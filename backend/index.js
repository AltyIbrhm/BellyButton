const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
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
    const { message, fridgeIngredients = [], dietaryRestrictions = [] } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'OPENAI_API_KEY not set in backend .env' });
    }
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Create enhanced system prompt with fridge context
    const fridgeList = fridgeIngredients.map(item => `${item.name} (${item.quantity})`).join(', ');
    const dietaryList = dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'none';
    
    const systemPrompt = `You are HealthyBot, an AI kitchen assistant that helps users with healthy recipes and nutrition advice. 

IMPORTANT CONTEXT:
- User's fridge contains: ${fridgeList || 'empty'}
- User's dietary restrictions: ${dietaryList}

Provide personalized advice based on what's in their fridge. If they ask about recipes, suggest ones they can make with their available ingredients. If they ask about nutrition, consider their dietary restrictions. Be helpful, encouraging, and specific to their situation.`;
    
    // Call OpenAI Chat API (gpt-3.5-turbo)
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 400,
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

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Image analysis endpoint using OpenAI Vision
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'OPENAI_API_KEY not set in backend .env' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Call OpenAI Vision API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this fridge image and extract all food ingredients you can see. 
                Respond with a JSON array of objects, each containing:
                - name: the ingredient name
                - quantity: estimated quantity (e.g., "2 medium", "1 cup", "3 pieces")
                - confidence: confidence level (0.0 to 1.0)
                
                Example response format:
                [
                  {"name": "tomatoes", "quantity": "4 medium", "confidence": 0.95},
                  {"name": "milk", "quantity": "1 gallon", "confidence": 0.88}
                ]
                
                Only include ingredients you are confident about. If the fridge appears empty or you can't clearly identify ingredients, return an empty array.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    
    // Try to parse the JSON response
    let ingredients = [];
    try {
      // Remove markdown code blocks if present
      let cleanedReply = reply.trim();
      if (cleanedReply.startsWith('```json')) {
        cleanedReply = cleanedReply.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanedReply.startsWith('```')) {
        cleanedReply = cleanedReply.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      ingredients = JSON.parse(cleanedReply);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', reply);
      // Fallback: try to extract ingredients from text response
      ingredients = [];
    }

    res.json({ 
      success: true, 
      ingredients,
      rawResponse: reply 
    });

  } catch (error) {
    console.error('Error calling OpenAI Vision API:', error.message);
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