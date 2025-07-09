import React, { useEffect, useState, useRef } from 'react';

const Home: React.FC = () => {
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'assistant'; message: string }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatHistory(prev => [...prev, { sender: 'user', message: chatInput }]);
    setChatLoading(true);
    setChatError(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput }),
      });
      const json = await res.json();
      if (!res.ok) throw json;
      setChatHistory(prev => [
        ...prev,
        { sender: 'assistant', message: json.reply },
      ]);
    } catch (err: any) {
      setChatError(err.message || JSON.stringify(err));
    } finally {
      setChatLoading(false);
    }
    setChatInput('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Dashboard Chatbot</h1>
      <div className="bg-white shadow-lg rounded-lg w-full max-w-xl flex flex-col h-[400px]">
        <div className="flex-1 overflow-y-auto p-4">
          {chatHistory.length === 0 && (
            <div className="text-gray-400 text-center">
              Start the conversation...
            </div>
          )}
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}
              >
                <span>{msg.message}</span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            placeholder="Type your message..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={chatLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={!chatInput.trim() || chatLoading}
          >
            {chatLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {chatError && (
          <div className="text-red-500 bg-red-100 p-2 rounded text-center mt-2">
            {chatError}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
