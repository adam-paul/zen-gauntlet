// src/components/AgentInterface.jsx
import React, { useState } from 'react';
import { useTicket } from '../hooks/useTicket';
import { useAuth } from '../hooks/useAuth';
import { Mic, SendHorizontal, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Langfuse } from 'langfuse';

// Initialize Langfuse with public key (safe to expose in frontend)
const langfuse = new Langfuse({
  publicKey: import.meta.env.LANGFUSE_PUBLIC_KEY,
  secretKey: import.meta.env.LANGFUSE_SECRET_KEY,
  baseUrl: import.meta.env.LANGFUSE_HOST
});

// Get the appropriate speech recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSpeechRecognition = !!SpeechRecognition;

export default function AgentInterface({ organizationId }) {
  const { createTicket } = useTicket(organizationId);
  const { session } = useAuth();
  const [spokenText, setSpokenText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const startListening = () => {
    if (!hasSpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async () => {
    if (!spokenText.trim()) return;
    
    const toastId = toast.loading('Creating ticket...');
    
    // Create a new trace for this ticket creation attempt
    const trace = langfuse.trace({
      name: "ticket_creation",
      userId: session?.user?.id,
      input: spokenText,
      metadata: {
        organization_id: organizationId,
        timestamp: new Date().toISOString()
      }
    });
    
    try {
      setIsProcessing(true);
      
      const startTime = Date.now();
      
      // Start the main span for the ticket creation process
      const ticketSpan = trace.span({
        name: "process_ticket",
        input: spokenText,
        metadata: {
          start_time: startTime
        }
      });
      
      // Test server connectivity first
      console.log('Testing server connectivity...');
      try {
        const healthCheck = await fetch('http://localhost:8000/health', {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        });
        console.log('Health check response:', {
          status: healthCheck.status,
          statusText: healthCheck.statusText,
          headers: Object.fromEntries(healthCheck.headers.entries())
        });
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        trace.event({
          name: "health_check_failed",
          level: "error",
          metadata: {
            error: healthError.message,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Create a span for the API request
      const apiSpan = trace.span({
        name: "api_request",
        input: spokenText,
        metadata: {
          start_time: Date.now()
        }
      });
      
      const response = await fetch('http://localhost:8000/api/agent/create-ticket', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ 
          user_utterance: spokenText,
          organization_id: organizationId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        apiSpan.update({
          status: "error",
          output: errorData,
          metadata: {
            status: response.status,
            error: errorData.detail || 'Failed to create ticket',
            end_time: Date.now()
          }
        });
        apiSpan.end();
        throw new Error(errorData.detail || 'Failed to create ticket');
      }

      const data = await response.json();
      apiSpan.update({
        status: "success",
        output: data,
        metadata: {
          processing_time: data.metrics.processing_time,
          tag_count: data.metrics.tag_count,
          end_time: Date.now()
        }
      });
      apiSpan.end();
      
      // Store metrics
      setMetrics(data.metrics);
      
      // Create a span for Supabase ticket creation
      const supabaseSpan = trace.span({
        name: "supabase_create_ticket",
        input: {
          title: data.title,
          description: data.description,
          tags: data.tags,
          organization_id: organizationId,
          created_by: session?.user?.id
        },
        metadata: {
          start_time: Date.now()
        }
      });
      
      console.log('Creating ticket in Supabase...');
      await createTicket({
        title: data.title,
        description: data.description,
        tags: data.tags,
        organization_id: organizationId,
        created_by: session?.user?.id,
        created_at: new Date().toISOString()
      });
      
      supabaseSpan.update({
        status: "success",
        output: {
          title: data.title,
          tags: data.tags
        },
        metadata: {
          end_time: Date.now(),
          field_validation: {
            has_title: !!data.title,
            has_description: !!data.description,
            has_tags: data.tags.length > 0,
            has_organization: !!organizationId,
            has_user: !!session?.user?.id
          }
        }
      });
      supabaseSpan.end();
      
      // Calculate total processing time
      const processingTime = (Date.now() - startTime) / 1000;
      
      ticketSpan.update({
        status: "success",
        output: {
          title: data.title,
          tag_count: data.tags.length
        },
        metadata: {
          processing_time: processingTime,
          tag_count: data.tags.length,
          has_required_fields: true,
          field_completeness: {
            title: !!data.title,
            description: !!data.description,
            tags: data.tags.length > 0 && data.tags.length <= 5,
            organization_id: !!organizationId,
            user_id: !!session?.user?.id
          },
          end_time: Date.now()
        }
      });
      ticketSpan.end();
      
      trace.update({
        output: {
          success: true,
          title: data.title,
          tag_count: data.tags.length,
          processing_time: processingTime
        },
        metadata: {
          success_metrics: {
            processing_time: processingTime,
            tag_count: data.tags.length,
            has_required_fields: true,
            field_completeness: 100,
            status: "success"
          }
        }
      });
      
      trace.event({
        name: "ticket_creation_success",
        level: "info",
        metadata: {
          processing_time: processingTime,
          tag_count: data.tags.length,
          timestamp: new Date().toISOString(),
          metrics: {
            speed: {
              total_time: processingTime,
              api_time: data.metrics.processing_time
            },
            accuracy: {
              required_fields_present: true,
              tag_count_valid: data.tags.length > 0 && data.tags.length <= 5,
              field_validation: {
                title: !!data.title,
                description: !!data.description,
                tags: data.tags.length > 0,
                organization_id: !!organizationId,
                user_id: !!session?.user?.id
              }
            }
          }
        }
      });
      
      // Show success message
      toast.success(`Ticket created in ${processingTime.toFixed(2)}s`, {
        id: toastId
      });
      
      setSpokenText('');
      
    } catch (error) {
      console.error('Detailed error information:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      trace.update({
        output: {
          success: false,
          error: error.message
        },
        metadata: {
          success_metrics: {
            status: "error",
            error_type: error.name,
            timestamp: new Date().toISOString()
          }
        }
      });
      
      trace.event({
        name: "ticket_creation_error",
        level: "error",
        metadata: {
          error_message: error.message,
          error_type: error.name,
          timestamp: new Date().toISOString(),
          metrics: {
            error_classification: {
              type: error.name,
              is_api_error: error.message.includes('Failed to create ticket'),
              is_validation_error: error.message.includes('validation'),
              is_network_error: error.message.includes('network') || error.message.includes('fetch')
            }
          }
        }
      });
      
      toast.error(error.message || 'Failed to create ticket. Please try again.', {
        id: toastId
      });
    } finally {
      setIsProcessing(false);
      // Flush events to Langfuse
      await langfuse.flushAsync();
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-zen-primary mb-2">
          Ticket Agent
        </h2>
        <p className="text-zen-secondary text-sm">
          Describe your problem in natural language, and I'll create a ticket for you.
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="relative">
          <textarea
            value={spokenText}
            onChange={(e) => setSpokenText(e.target.value)}
            placeholder="What would you like help with?"
            disabled={isProcessing}
            className="w-full h-32 px-4 py-3 text-sm border border-zen-border/30 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-zen-primary/20 
                     bg-zen-bg text-zen-text resize-none
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <button
              onClick={startListening}
              disabled={isRecording || isProcessing || !hasSpeechRecognition}
              className={`p-2 rounded-full transition-colors
                       ${isRecording 
                         ? 'bg-red-500 text-white' 
                         : !hasSpeechRecognition
                           ? 'bg-zen-border/20 text-zen-secondary/50 cursor-not-allowed'
                           : 'bg-zen-border/30 hover:bg-zen-border/50 text-zen-secondary'}`}
              title={!hasSpeechRecognition 
                ? 'Speech recognition is not supported in your browser' 
                : isRecording 
                  ? 'Recording...' 
                  : 'Start voice recording'}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!spokenText.trim() || isProcessing}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                   bg-zen-primary text-white rounded-lg
                   hover:bg-zen-primary/90 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Create Ticket</span>
              <SendHorizontal className="w-4 h-4" />
            </>
          )}
        </button>

        {metrics && (
          <div className="mt-4 p-4 bg-zen-bg border border-zen-border/30 rounded-lg">
            <h3 className="text-sm font-medium text-zen-primary mb-2">Processing Metrics</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-zen-secondary">Processing Time</dt>
              <dd className="text-zen-text">{metrics.processing_time.toFixed(2)}s</dd>
              <dt className="text-zen-secondary">Tag Count</dt>
              <dd className="text-zen-text">{metrics.tag_count}</dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
