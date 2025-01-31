from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import time
import logging
from .llm_agent import create_ticket_from_text
from langfuse.client import Langfuse
import json
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Verify required environment variables
required_env_vars = ['OPENAI_API_KEY', 'LANGFUSE_PUBLIC_KEY', 'LANGFUSE_SECRET_KEY']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")

app = FastAPI()

# CORS configuration
CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
CORS_HEADERS = {
    "Access-Control-Allow-Origin": CORS_ORIGINS[0],
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.debug(f"=== New Request ===")
    logger.debug(f"Method: {request.method}")
    logger.debug(f"URL: {request.url}")
    logger.debug(f"Headers: {dict(request.headers)}")
    
    if request.method == "OPTIONS":
        logger.debug("Handling CORS preflight request")
        return JSONResponse(
            content={},
            headers=CORS_HEADERS
        )
    
    try:
        response = await call_next(request)
        
        logger.debug(f"=== Response ===")
        logger.debug(f"Status: {response.status_code}")
        logger.debug(f"Headers: {dict(response.headers)}")
        
        # Ensure CORS headers are present
        for key, value in CORS_HEADERS.items():
            response.headers[key] = value
            
        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        # Return error response with CORS headers
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)},
            headers=CORS_HEADERS
        )

# Configure CORS middleware
logger.info("Configuring CORS middleware...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.get("/health")
async def health_check():
    """Simple health check endpoint to verify CORS"""
    logger.debug("Health check endpoint called")
    return JSONResponse(
        content={"status": "ok"},
        headers=CORS_HEADERS
    )

# Initialize Langfuse for tracking metrics
try:
    logger.info("Initializing Langfuse client...")
    langfuse = Langfuse(
        public_key=os.getenv('LANGFUSE_PUBLIC_KEY'),
        secret_key=os.getenv('LANGFUSE_SECRET_KEY'),
        host=os.getenv('LANGFUSE_HOST', 'https://cloud.langfuse.com')
    )
except Exception as e:
    logger.error(f"Error initializing Langfuse: {str(e)}")
    langfuse = None

class TicketRequest(BaseModel):
    user_utterance: str
    organization_id: str

class TicketResponse(BaseModel):
    title: str
    description: str
    tags: List[str]
    metrics: dict

def log_to_langfuse(name: str, input_data: str, output_data: dict, metadata: dict = None, level: str = "INFO"):
    """Helper function to safely log to Langfuse with scoring"""
    if not langfuse:
        logger.warning("Langfuse client not initialized, skipping metrics")
        return
        
    try:
        logger.debug(f"Logging to Langfuse: {name}")
        
        # Create a trace for the entire operation
        trace = langfuse.trace(
            name=name,
            input=input_data,
            metadata=metadata or {}
        )
        
        # Create a span for the LLM generation
        generation_span = trace.span(
            name="llm_generation",
            input=input_data,
            output=output_data
        )
        
        # Add scores for our key metrics
        if metadata and "metrics" in metadata:
            metrics = metadata["metrics"]
            
            # Score for processing time (lower is better)
            if "processing_time" in metrics:
                trace.score(
                    name="processing_time",
                    value=metrics["processing_time"],
                    comment="Time taken to process request in seconds"
                )
            
            # Score for tag count (should be between 1-5)
            if "tag_count" in metrics:
                tag_count = metrics["tag_count"]
                tag_count_score = 1.0 if 1 <= tag_count <= 5 else 0.0
                trace.score(
                    name="tag_count_valid",
                    value=tag_count_score,
                    comment=f"Tag count {tag_count} {'within' if tag_count_score == 1.0 else 'outside'} valid range"
                )
            
            # Score for required fields
            if "has_required_fields" in metrics:
                trace.score(
                    name="required_fields_present",
                    value=1.0 if metrics["has_required_fields"] else 0.0,
                    comment="All required fields present in ticket"
                )
        
        # If this is an error event, add error scoring
        if level == "ERROR":
            trace.score(
                name="success_rate",
                value=0.0,
                comment=f"Failed with error: {output_data.get('error', 'Unknown error')}"
            )
        else:
            trace.score(
                name="success_rate",
                value=1.0,
                comment="Successfully created ticket"
            )
        
        generation_span.end()
        trace.end()
        
        logger.debug("Successfully logged to Langfuse")
    except Exception as e:
        logger.error(f"Error logging to Langfuse: {str(e)}")

@app.post("/api/agent/create-ticket")
async def create_ticket(request: TicketRequest):
    try:
        logger.info("Starting ticket creation process...")
        logger.debug(f"Request data: {request.dict()}")
        
        # Start tracking metrics
        start_time = time.time()
        
        logger.debug("Calling LLM for ticket creation...")
        # Process with LLM
        ticket_data = create_ticket_from_text(
            request.user_utterance,
            openai_api_key=os.getenv('OPENAI_API_KEY')
        )
        
        processing_time = time.time() - start_time
        logger.debug(f"LLM processing completed in {processing_time:.2f}s")
        logger.debug(f"Generated ticket data: {ticket_data}")
        
        # Track metrics
        metrics = {
            "processing_time": processing_time,
            "has_required_fields": all(k in ticket_data for k in ["title", "description", "tags"]),
            "tag_count": len(ticket_data.get("tags", [])),
        }
        
        # Log to Langfuse with metrics
        log_to_langfuse(
            name="ticket_creation",
            input_data=request.user_utterance,
            output_data=ticket_data,
            metadata={
                "organization_id": request.organization_id,
                "metrics": metrics,
                "field_validation": {
                    "title": bool(ticket_data.get("title")),
                    "description": bool(ticket_data.get("description")),
                    "tags": bool(ticket_data.get("tags"))
                }
            }
        )
        
        response = TicketResponse(
            title=ticket_data["title"],
            description=ticket_data["description"],
            tags=ticket_data["tags"],
            metrics=metrics
        )
        
        logger.info("Ticket creation successful")
        logger.debug(f"Sending response: {response.dict()}")
        
        return JSONResponse(
            content=response.dict(),
            headers=CORS_HEADERS
        )
        
    except Exception as e:
        logger.error(f"Error in ticket creation: {str(e)}", exc_info=True)
        # Log error to Langfuse with error scoring
        log_to_langfuse(
            name="ticket_creation_error",
            input_data=request.user_utterance,
            output_data={"error": str(e)},
            metadata={
                "organization_id": request.organization_id,
                "metrics": {
                    "error_type": type(e).__name__,
                    "processing_time": time.time() - start_time
                }
            },
            level="ERROR"
        )
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)},
            headers=CORS_HEADERS
        ) 