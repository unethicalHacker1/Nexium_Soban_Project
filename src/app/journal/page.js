'use client';

import { useState } from 'react';

export default function JournalForm({ user }) {
  const [journalText, setJournalText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        journalText,
        reflectionText,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage('Journal saved successfully!');
      setJournalText('');
      setReflectionText('');
    } else {
      setMessage('Something went wrong.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Write your journal..."
        value={journalText}
        onChange={(e) => setJournalText(e.target.value)}
        required
      />
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Any reflections?"
        value={reflectionText}
        onChange={(e) => setReflectionText(e.target.value)}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Journal</button>
      {message && <p>{message}</p>}
    </form>
  );
}
