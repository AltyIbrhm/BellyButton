const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    message: 'Dashboard data fetched successfully!',
    stats: {
      users: 42,
      sales: 1234,
      active: true,
    },
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint for OpenAI
app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const { message } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'OPENAI_API_KEY not set in backend .env' });
    }
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }
    // Call OpenAI Chat API (gpt-3.5-turbo)
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message },
        ],
        max_tokens: 256,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Error calling OpenAI Chat API:', error.message);
    if (error.response) {
      console.error('OpenAI error response:', error.response.data);
    }
    res.status(500).json({
      success: false,
      message: error.message,
      ...(error.response && { openaiError: error.response.data }),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API listening at http://localhost:${PORT}`);
}); 