/**
 * Simple WhatsApp Webhook
 * This is a minimal Node.js server that handles WhatsApp webhook events
 * and responds to incoming messages with a simple reply or template.
 */

import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request body
app.use(bodyParser.json());

// WhatsApp API Configuration
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v22.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '598241500035903';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAIAmB3mH3EBO5zWW5FcNWj4lG5SqOJ5FYM1oU2oUsSGY82kfX0ThZCf4bnd1MLjrtLaLRULaNKMF4r7c88HlJaYwnDHhFVCNJkVjseVoQwLjzFANz5ZBZA4D9I8hSZA3bfR5kMJ2NTyfwyov8neqCYFRqO5oZBLLCP2Q3VvZBkyZAgDXcZAJUZAsZAV4v7cR0FrzFugZDZD';
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ;

// GET route for webhook verification
app.get('/webhook', (req, res) => {
  // Parse parameters from the webhook verification request
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent match your configuration
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
    // Respond with 403 Forbidden if verify tokens do not match
    return res.sendStatus(403);
  }
});

// POST route for handling webhook events
app.post('/webhook', async (req, res) => {
  // Return a '200 OK' response right away to acknowledge receipt
  res.status(200).send('EVENT_RECEIVED');
  
  const body = req.body;
  
  console.log('Received webhook payload:', JSON.stringify(body, null, 2));
  
  // Check if this is a WhatsApp message notification
  if (body.object && 
      body.entry && 
      body.entry[0].changes && 
      body.entry[0].changes[0] && 
      body.entry[0].changes[0].value.messages && 
      body.entry[0].changes[0].value.messages[0]) {
    
    const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const from = body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
    const messageType = body.entry[0].changes[0].value.messages[0].type; // extract the message type
    
    let messageBody = '';
    if (messageType === 'text') {
      messageBody = body.entry[0].changes[0].value.messages[0].text.body; // extract the message text
    } else {
      messageBody = `a message of type: ${messageType}`;
    }
    
    console.log(`Received message: "${messageBody}" from ${from}`);
    
    try {
      // Send a response using template
      await sendTemplateMessage(phoneNumberId, from);
      console.log(`Template message sent to ${from}`);
      
      // After a short delay, send a text response
      setTimeout(async () => {
        const responseMessage = `Hello! You sent: "${messageBody}". This is an automated response.`;
        await sendTextMessage(phoneNumberId, from, responseMessage);
        console.log(`Text response sent to ${from}`);
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
});

// Test route to send a template message
app.get('/send-template/:phoneNumber', async (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  
  try {
    const result = await sendTemplateMessage(WHATSAPP_PHONE_NUMBER_ID, phoneNumber);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending template message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Function to send a text WhatsApp message
 */
async function sendTextMessage(phoneNumberId, to, message) {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      throw new Error(JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Error in sendTextMessage:', error);
    throw error;
  }
}

/**
 * Function to send a template WhatsApp message
 */
async function sendTemplateMessage(phoneNumberId, to) {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      throw new Error(JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Error in sendTemplateMessage:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'whatsapp-webhook' 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test template: http://localhost:${PORT}/send-template/[PHONE_NUMBER]`);
});

/**
 * To run this webhook:
 * 
 * 1. Install dependencies:
 *    npm install express body-parser node-fetch dotenv
 * 
 * 2. Create a .env file with:
 *    WHATSAPP_PHONE_NUMBER_ID=598241500035903
 *    WHATSAPP_ACCESS_TOKEN=EAAIAmB3mH3EBO5zWW5FcNWj4lG5SqOJ5FYM1oU2oUsSGY82kfX0ThZCf4bnd1MLjrtLaLRULaNKMF4r7c88HlJaYwnDHhFVCNJkVjseVoQwLjzFANz5ZBZA4D9I8hSZA3bfR5kMJ2NTyfwyov8neqCYFRqO5oZBLLCP2Q3VvZBkyZAgDXcZAJUZAsZAV4v7cR0FrzFugZDZD
 *    WHATSAPP_VERIFY_TOKEN=your_verify_token
 *    WHATSAPP_API_VERSION=v22.0
 *    PORT=3000
 * 
 * 3. Run the server:
 *    node updated-whatsapp-webhook.js
 */


