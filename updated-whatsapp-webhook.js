import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import http from 'http';

// Load environment variables
dotenv.config();

// Import models - ONLY ONCE
import ChatbotSettings from './models/ChatbotSettings.js';
import UserEngagement from './models/UserEngagement.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3100;

// Create HTTP server for WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-dashboard')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// WebSocket clients tracking
const wsClients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('✅ New WebSocket client connected');
  wsClients.add(ws);
  
  // Send connection confirmation
  ws.send(JSON.stringify({ type: 'connected', message: 'Connected to WhatsApp webhook server' }));
  
  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
    wsClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast message to all connected clients
const broadcastToClients = (data) => {
  const message = JSON.stringify(data);
  wsClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
};

// =================== Webhook Routes ===================

// GET route for webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('🔍 Webhook verification request');
  
  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
    console.log('❌ Verification failed - token mismatch');
    return res.sendStatus(403);
  }
  
  return res.status(400).send('Please pass the correct parameters');
});

// POST route for webhook events (receiving messages)
app.post('/webhook', async (req, res) => {
  // Return 200 OK immediately
  res.status(200).send('EVENT_RECEIVED');
  
  const body = req.body;
  
  try {
    if (body.object === 'whatsapp_business_account') {
      if (body.entry?.[0]?.changes?.[0]?.value) {
        const value = body.entry[0].changes[0].value;
        
        // Handle incoming messages
        if (value.messages?.[0]) {
          const message = value.messages[0];
          const from = message.from;
          let messageContent = '';
          let messageType = message.type;
          
          // Extract message content based on type
          if (messageType === 'text') {
            messageContent = message.text.body;
          } else if (messageType === 'interactive') {
            const interactiveType = message.interactive.type;
            
            if (interactiveType === 'button_reply') {
              messageContent = message.interactive.button_reply.id;
            } else if (interactiveType === 'list_reply') {
              messageContent = message.interactive.list_reply.id;
            }
          } else {
            messageContent = `[${messageType} message]`;
          }
          
          console.log(`📨 Message from ${from}: ${messageContent}`);
          
          // Update user engagement
          await UserEngagement.findOneAndUpdate(
            { phoneNumber: from },
            { 
              phoneNumber: from,
              lastMessageTime: new Date(),
              $inc: { messageCount: 1 }
            },
            { upsert: true, new: true }
          );
          
          // Update or create conversation
          let conversation = await Conversation.findOne({ phoneNumber: from });
          if (!conversation) {
            conversation = await Conversation.create({
              phoneNumber: from,
              lastMessage: messageContent,
              lastMessageTime: new Date(),
              unreadCount: 1
            });
          } else {
            conversation.lastMessage = messageContent;
            conversation.lastMessageTime = new Date();
            conversation.unreadCount += 1;
            await conversation.save();
          }
          
          // Save message
          await Message.create({
            conversationId: conversation._id,
            phoneNumber: from,
            messageId: message.id,
            sender: 'user',
            type: messageType,
            text: messageContent
          });
          
          // Broadcast to WebSocket clients
          broadcastToClients({
            type: 'message',
            from: from,
            message: messageContent,
            messageId: message.id,
            timestamp: new Date().toISOString()
          });
          
          // Process with chatbot if enabled
          const chatbotSettings = await ChatbotSettings.getSettings();
          if (chatbotSettings.enabled) {
            const automatedReply = await processWithChatbot(from, messageContent, conversation);
            if (automatedReply) {
              // The dashboard will handle sending the actual message
              broadcastToClients({
                type: 'chatbot_reply',
                to: from,
                reply: automatedReply,
                delay: chatbotSettings.welcomeMessage.delay || 1000
              });
            }
          }
        }
        
        // Handle message status updates
        else if (value.statuses?.[0]) {
          const status = value.statuses[0];
          
          await Message.findOneAndUpdate(
            { messageId: status.id },
            { status: status.status }
          );
          
          broadcastToClients({
            type: 'status_update',
            messageId: status.id,
            status: status.status,
            timestamp: status.timestamp
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
  }
});

// =================== Chatbot API Routes ===================

// Get chatbot settings
app.get('/api/chatbot/settings', async (req, res) => {
  try {
    const settings = await ChatbotSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update chatbot settings
app.put('/api/chatbot/settings', async (req, res) => {
  try {
    const settings = await ChatbotSettings.getSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update specific chatbot feature
app.patch('/api/chatbot/settings/:feature', async (req, res) => {
  try {
    const { feature } = req.params;
    const settings = await ChatbotSettings.getSettings();
    
    if (feature in settings) {
      settings[feature] = req.body;
      await settings.save();
      res.json(settings);
    } else {
      res.status(400).json({ error: 'Invalid feature' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =================== Conversation & Engagement Routes ===================

// Get conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastMessageTime: -1 })
      .limit(50);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a conversation
app.get('/api/conversations/:phoneNumber/messages', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const conversation = await Conversation.findOne({ phoneNumber });
    
    if (!conversation) {
      return res.json([]);
    }
    
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(100);
      
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/webhook/config-check', (req, res) => {
  res.json({
    server_status: 'running',
    webhook_url: 'https://whatsapp-webhook-w7a3.onrender.com/webhook',
    expecting_webhook_fields: [
      'messages',              // ← THIS IS CRITICAL
      'messaging_postbacks',
      'message_deliveries', 
      'message_reads'
    ],
    verify_in_meta_dashboard: {
      step1: 'Go to Meta App Dashboard',
      step2: 'Navigate to WhatsApp > Configuration',
      step3: 'Click on Webhook',
      step4: 'Ensure "messages" field is subscribed',
      step5: 'Check Callback URL matches exactly'
    }
  });
});

// Mark conversation as read
app.put('/api/conversations/:phoneNumber/read', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    await Conversation.findOneAndUpdate(
      { phoneNumber },
      { unreadCount: 0 }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user engagement data
app.get('/api/user-engagement', async (req, res) => {
  try {
    const engagements = await UserEngagement.find()
      .sort({ lastMessageTime: -1 })
      .limit(100);
    
    const data = {};
    engagements.forEach(eng => {
      data[eng.phoneNumber] = {
        lastMessageTime: eng.lastMessageTime,
        conversationStarted: eng.createdAt,
        inWindow: eng.checkIfInWindow()
      };
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =================== Helper Functions ===================

async function processWithChatbot(phoneNumber, message, conversation) {
  try {
    const settings = await ChatbotSettings.getSettings();
    if (!settings.enabled) return null;
    
    const lowerMessage = message.toLowerCase().trim();
    
    // Check for quick replies
    const quickReply = settings.quickReplies.find(qr => 
      qr.enabled && lowerMessage.includes(qr.keyword.toLowerCase())
    );
    
    if (quickReply) {
      return quickReply.reply;
    }
    
    // Check for chatbot flows
    const activeFlow = settings.flows.find(flow => 
      flow.enabled && lowerMessage.includes(flow.trigger.toLowerCase())
    );
    
    if (activeFlow && activeFlow.nodes.length > 0) {
      return activeFlow.nodes[0].message;
    }
    
    // Check if it's first message (welcome message)
    const messageCount = await Message.countDocuments({ 
      conversationId: conversation._id 
    });
    
    if (messageCount === 1 && settings.welcomeMessage.enabled) {
      return settings.welcomeMessage.message;
    }
    
    // Check away message
    if (settings.awayMessage.enabled && isOutsideBusinessHours(settings.awayMessage)) {
      return settings.awayMessage.message;
    }
    
    return null;
  } catch (error) {
    console.error('Error processing chatbot:', error);
    return null;
  }
}

function isOutsideBusinessHours(awayMessage) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMin] = awayMessage.startTime.split(':').map(Number);
  const [endHour, endMin] = awayMessage.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (startMinutes > endMinutes) {
    // Overnight hours
    return currentTime >= startMinutes || currentTime < endMinutes;
  } else {
    return currentTime >= startMinutes && currentTime < endMinutes;
  }
}

// =================== Health & Debug Routes ===================

app.get('/health', async (req, res) => {
  try {
    const stats = await Promise.all([
      UserEngagement.countDocuments(),
      Conversation.countDocuments(),
      Message.countDocuments(),
      UserEngagement.countDocuments({
        lastMessageTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      websocket_clients: wsClients.size,
      stats: {
        total_users: stats[0],
        total_conversations: stats[1],
        total_messages: stats[2],
        users_in_24h_window: stats[3]
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🔌 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`💓 Health check: http://localhost:${PORT}/health`);
});