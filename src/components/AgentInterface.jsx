// src/components/AgentInterface.jsx
import React, { useState } from 'react';
import { useTicket } from '../hooks/useTicket';

export default function AgentInterface({ organizationId }) {
  const { createTicket } = useTicket(organizationId);
  const [spokenText, setSpokenText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const startListening = () => {
    // Example with Web Speech API
    if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async () => {
    // 1) Call your agent/LLM to infer ticket structure
    //    (Either call a backend route, or directly if you have a local function)
    const response = await fetch('/api/agent/create-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userUtterance: spokenText })
    });
    const { title, description, tags } = await response.json();

    // 2) Create the ticket in Supabase
    const ticket = await createTicket({
      title,
      description,
      tags
    });

    alert(`Created new ticket with ID: ${ticket.id}`);
    setSpokenText('');
  };

  return (
    <div>
      <button onClick={startListening}>
        {isRecording ? 'Recording...' : 'Speak'}
      </button>
      <textarea
        value={spokenText}
        onChange={(e) => setSpokenText(e.target.value)}
        placeholder="What is your issue?"
      />
      <button onClick={handleSubmit}>
        Create Ticket
      </button>
    </div>
  );
}
