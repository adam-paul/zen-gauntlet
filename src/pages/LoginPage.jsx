import React, { useState } from 'react';
// import { supabase } from '../supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Example: supabase signIn logic
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // const { error } = await supabase.auth.signIn({ email, password });
      // if (error) throw error;
      console.log('Logging in with:', email, password);
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div style={{ margin: '2rem' }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
        <label>Email</label>
        <input 
          type="email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          required 
        />
        <label>Password</label>
        <input 
          type="password" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          required 
        />
        <button type="submit" style={{ marginTop: '1rem' }}>Login</button>
      </form>
    </div>
  );
}

