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
  console.log('Headers:', req.headers);
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

// Test OpenAI API key endpoint
app.get('/api/test-openai', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('OPENAI_API_KEY present:', !!apiKey);
    if (apiKey) {
      console.log('OPENAI_API_KEY (masked):', apiKey.slice(0, 8) + '...' + apiKey.slice(-5));
    }
    if (!apiKey) {
      console.error('OPENAI_API_KEY not set in backend .env');
      return res.status(400).json({ error: 'OPENAI_API_KEY not set in backend .env' });
    }
    // Example: List OpenAI models
    console.log('Sending request to OpenAI...');
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    console.log('OpenAI response status:', response.status);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error calling OpenAI:', error.message);
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