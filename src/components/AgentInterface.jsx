// src/components/AgentInterface.jsx
import React, { useState } from 'react';
import { useTicket } from '../hooks/useTicket';
import { Mic, SendHorizontal } from 'lucide-react';

export default function AgentInterface({ organizationId }) {
  const { createTicket } = useTicket(organizationId);
  const [spokenText, setSpokenText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async () => {
    if (!spokenText.trim()) return;
    
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/agent/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUtterance: spokenText })
      });
      
      const { title, description, tags } = await response.json();
      await createTicket({ title, description, tags });
      
      setSpokenText('');
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsProcessing(false);
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
            className="w-full h-32 px-4 py-3 text-sm border border-zen-border/30 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-zen-primary/20 
                     bg-zen-bg text-zen-text resize-none"
          />
          
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <button
              onClick={startListening}
              disabled={isRecording || isProcessing}
              className={`p-2 rounded-full transition-colors
                       ${isRecording 
                         ? 'bg-red-500 text-white' 
                         : 'bg-zen-border/30 hover:bg-zen-border/50 text-zen-secondary'}`}
              title={isRecording ? 'Recording...' : 'Start voice recording'}
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
          <span>{isProcessing ? 'Creating ticket...' : 'Create Ticket'}</span>
          <SendHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
