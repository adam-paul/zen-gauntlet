# src/agents/llm_agent.py
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

system_prompt = """
You are a helpful assistant that takes user issues and creates a JSON representation of a ticket.
Required keys: title, description, tags
Rules:
- tags are an array of 1-5 concise strings, each 1-3 words, lowercase with hyphens
- output must be valid JSON, without markdown
"""

def create_ticket_from_text(user_utterance: str) -> dict:
    openai = ChatOpenAI(model_name="gpt-4")  # or "gpt-3.5-turbo", etc.
    system_template = SystemMessagePromptTemplate.from_template(system_prompt)
    user_template = HumanMessagePromptTemplate.from_template("{user_utterance}")

    messages = [
        system_template.format(),
        user_template.format(user_utterance=user_utterance),
    ]

    response = openai(messages)
    # Attempt to parse the LLM's output as JSON
    try:
        ticket_data = response.content.strip()
        return json.loads(ticket_data)
    except Exception as e:
        print("Error parsing LLM response", e)
        return {"title": "Untitled", "description": user_utterance, "tags": []}
