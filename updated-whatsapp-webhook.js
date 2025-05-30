// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import { WebSocketServer } from 'ws';
// import http from 'http';

// // Load environment variables
// dotenv.config();

// // Import models - ONLY ONCE
// import ChatbotSettings from './models/ChatbotSettings.js';
// import UserEngagement from './models/UserEngagement.js';
// import Conversation from './models/Conversation.js';
// import Message from './models/Message.js';

// // Initialize express app
// const app = express();
// const PORT = process.env.PORT || 3100;

// // Create HTTP server for WebSocket
// const server = http.createServer(app);
// const wss = new WebSocketServer({ server });

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-dashboard')
//   .then(() => {
//     console.log('✅ Connected to MongoDB');
//   })
//   .catch(err => {
//     console.error('❌ MongoDB connection error:', err);
//     process.exit(1);
//   });

// // WebSocket clients tracking
// const wsClients = new Set();

// console.log("wsClients", wsClients)

// // WebSocket connection handling
// wss.on('connection', (ws) => {
//   console.log('✅ New WebSocket client connected');
//   wsClients.add(ws);

//   // Send connection confirmation
//   ws.send(JSON.stringify({ type: 'connected', message: 'Connected to WhatsApp webhook server' }));

//   ws.on('close', () => {
//     console.log('❌ WebSocket client disconnected');
//     wsClients.delete(ws);
//   });

//   ws.on('error', (error) => {
//     console.error('WebSocket error:', error);
//   });
// });

// // Broadcast message to all connected clients
// const broadcastToClients = (data) => {
//   const message = JSON.stringify(data);
//   console.log('📡 Broadcasting message to clients:', message);
//   wsClients.forEach(client => {
//     if (client.readyState === 1) { // WebSocket.OPEN
//       client.send(message);
//     }
//   });
// };

// // =================== Webhook Routes ===================

// // GET route for webhook verification
// // app.get('/webhook', (req, res) => {
// //   const mode = req.query['hub.mode'];
// //   const token = req.query['hub.verify_token'];
// //   const challenge = req.query['hub.challenge'];

// //   console.log('🔍 Webhook verification request');

// //   if (mode && token) {
// //     if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
// //       console.log('✅ WEBHOOK_VERIFIED');
// //       return res.status(200).send(challenge);
// //     }
// //     console.log('❌ Verification failed - token mismatch');
// //     return res.sendStatus(403);
// //   }

// //   return res.status(400).send('Please pass the correct parameters');
// // });

// app.get('/webhook', (req, res) => {
//   const VERIFY_TOKEN = process.env.WHATSAPP_TOKEN || 'your_verify_token_here';

//   const mode = req.query['hub.mode'];
//   const token = req.query['hub.verify_token'];
//   const challenge = req.query['hub.challenge'];

//   if (mode && token === VERIFY_TOKEN) {
//     console.log('✅ Webhook verified successfully');
//     res.status(200).send(challenge);
//   } else {
//     console.error('❌ Webhook verification failed');
//     res.sendStatus(403);
//   }
// });


// // POST route for webhook events (receiving messages)
// // app.post('/webhook', async (req, res) => {
// //   // Return 200 OK immediately
// //   res.status(200).send('EVENT_RECEIVED');

// //   const body = req.body;

// //   console.log('📬 Webhook event received:', JSON.stringify(body, null, 2));

// //   try {
// //     if (body.object === 'whatsapp_business_account') {
// //       if (body.entry?.[0]?.changes?.[0]?.value) {
// //         const value = body.entry[0].changes[0].value;

// //         // Handle incoming messages
// //         if (value.messages?.[0]) {
// //           const message = value.messages[0];
// //           const from = message.from;
// //           let messageContent = '';
// //           let messageType = message.type;

// //           // Extract message content based on type
// //           if (messageType === 'text') {
// //             messageContent = message.text.body;
// //             console
// //           } else if (messageType === 'interactive') {
// //             const interactiveType = message.interactive.type;

// //             if (interactiveType === 'button_reply') {
// //               messageContent = message.interactive.button_reply.id;
// //             } else if (interactiveType === 'list_reply') {
// //               messageContent = message.interactive.list_reply.id;
// //             }
// //           } else {
// //             messageContent = `[${messageType} message]`;
// //           }

// //           console.log(`📨 Message from ${from}: ${messageContent}`);

// //           // Update user engagement
// //           const userEngagement =  await UserEngagement.findOneAndUpdate(
// //             { phoneNumber: from },
// //             { 
// //               phoneNumber: from,
// //               lastMessageTime: new Date(),
// //               $inc: { messageCount: 1 }
// //             },
// //             { upsert: true, new: true }
// //           );

// //           console.log(`👤 User engagement updated for ${from}:`, userEngagement);

// //           // Update or create conversation
// //           let conversation = await Conversation.findOne({ phoneNumber: from });
// //           if (!conversation) {
// //             conversation = await Conversation.create({
// //               phoneNumber: from,
// //               lastMessage: messageContent,
// //               lastMessageTime: new Date(),
// //               unreadCount: 1
// //             });
// //             console.log(`📖 Created new conversation for ${from}`);
// //           } else {
// //             conversation.lastMessage = messageContent;
// //             conversation.lastMessageTime = new Date();
// //             conversation.unreadCount += 1;
// //             await conversation.save();
// //           }

// //           // Save message
// //           const savedMessage = await Message.create({
// //             conversationId: conversation._id,
// //             phoneNumber: from,
// //             messageId: message.id,
// //             sender: 'user',
// //             type: messageType,
// //             text: messageContent
// //           });

// //           console.log(`💬 Saved message ${savedMessage.id} for conversation ${conversation._id}`);

// //           // Broadcast to WebSocket clients
// //           await broadcastToClients({
// //             type: 'message',
// //             from: from,
// //             message: messageContent,
// //             messageId: message.id,
// //             timestamp: new Date().toISOString()
// //           });

// //           // Process with chatbot if enabled
// //           const chatbotSettings = await ChatbotSettings.getSettings();
// //           if (chatbotSettings.enabled) {
// //             const automatedReply = await processWithChatbot(from, messageContent, conversation);
// //             if (automatedReply) {
// //               // The dashboard will handle sending the actual message
// //               broadcastToClients({
// //                 type: 'chatbot_reply',
// //                 to: from,
// //                 reply: automatedReply,
// //                 delay: chatbotSettings.welcomeMessage.delay || 1000
// //               });
// //             }
// //           }
// //         }

// //         // Handle message status updates
// //         else if (value.statuses?.[0]) {
// //           const status = value.statuses[0];

// //           const updatedMessage = await Message.findOneAndUpdate(
// //             { messageId: status.id },
// //             { status: status.status }
// //           );

// //           console.log(`📦 Updated message status for ${status.id}: ${status.status}`);

// //           broadcastToClients({
// //             type: 'status_update',
// //             messageId: status.id,
// //             status: status.status,
// //             timestamp: status.timestamp
// //           });
// //         }
// //       }
// //     }
// //   } catch (error) {
// //     console.error('❌ Error processing webhook:', error);
// //   }
// // });

// app.post('/webhook', async (req, res) => {
//   // Immediate 200 response to avoid timeout
//   res.status(200).send('EVENT_RECEIVED');

//   const body = req.body;
//   console.log('📬 Webhook event received:', JSON.stringify(body, null, 2));

//   try {
//     if (body.object === 'whatsapp_business_account') {
//       const entry = body.entry?.[0];
//       const change = entry?.changes?.[0];
//       const value = change?.value;

//       if (!value) return;

//       // Handle all incoming messages
//       if (Array.isArray(value.messages)) {
//         for (const message of value.messages) {
//           try {
//             const from = message.from;
//             const messageType = message.type;
//             let messageContent = '';

//             // Extract content based on type
//             if (messageType === 'text') {
//               messageContent = message.text.body;
//               console.log('📝 Text message content:', messageContent);
//             } else if (messageType === 'interactive') {
//               const interactiveType = message.interactive.type;
//               if (interactiveType === 'button_reply') {
//                 messageContent = message.interactive.button_reply.id;
//               } else if (interactiveType === 'list_reply') {
//                 messageContent = message.interactive.list_reply.id;
//               }
//               console.log('🔘 Interactive reply:', messageContent);
//             } else {
//               messageContent = `[${messageType} message]`;
//               console.log('📦 Non-text message received:', messageType, message);
//             }

//             console.log(`📨 Message from ${from}: ${messageContent}`);

//             // Update user engagement
//             const userEngagement = await UserEngagement.findOneAndUpdate(
//               { phoneNumber: from },
//               {
//                 phoneNumber: from,
//                 lastMessageTime: new Date(),
//                 $inc: { messageCount: 1 }
//               },
//               { upsert: true, new: true }
//             );
//             console.log(`👤 User engagement updated for ${from}:`, userEngagement);

//             // Update or create conversation
//             const conversation = await Conversation.findOneAndUpdate(
//               { phoneNumber: from },
//               {
//                 $set: {
//                   lastMessage: messageContent,
//                   lastMessageTime: new Date()
//                 },
//                 $inc: { unreadCount: 1 }
//               },
//               { new: true, upsert: true }
//             );
//             console.log(`💬 Conversation updated for ${from}:`, conversation._id);

//             // Save message
//             const savedMessage = await Message.create({
//               conversationId: conversation._id,
//               phoneNumber: from,
//               messageId: message.id,
//               sender: 'user',
//               type: messageType,
//               text: messageContent
//             });
//             console.log(`✅ Saved message ${savedMessage.id}`);

//             // Broadcast to WebSocket clients
//             await broadcastToClients({
//               type: 'message',
//               from,
//               message: messageContent,
//               messageId: message.id,
//               timestamp: new Date().toISOString()
//             });

//             // Process with chatbot if enabled
//             const chatbotSettings = await ChatbotSettings.getSettings();
//             if (chatbotSettings.enabled) {
//               const automatedReply = await processWithChatbot(from, messageContent, conversation);
//               if (automatedReply) {
//                 await broadcastToClients({
//                   type: 'chatbot_reply',
//                   to: from,
//                   reply: automatedReply,
//                   delay: chatbotSettings.welcomeMessage?.delay || 1000
//                 });
//               }
//             }

//             console.log("chatbotSettings", chatbotSettings);

//           } catch (msgError) {
//             console.error('⚠️ Error handling individual message:', msgError);
//           }
//         }
//       }

//       // Handle message status updates
//       if (Array.isArray(value.statuses)) {
//         for (const status of value.statuses) {
//           try {
//             const updatedMessage = await Message.findOneAndUpdate(
//               { messageId: status.id },
//               { status: status.status }
//             );
//             console.log(`📦 Updated message status for ${status.id}: ${status.status}`);

//             await broadcastToClients({
//               type: 'status_update',
//               messageId: status.id,
//               status: status.status,
//               timestamp: status.timestamp
//             });

//           } catch (statusErr) {
//             console.error('⚠️ Error handling message status:', statusErr);
//           }
//         }
//       }
//     }
//   } catch (error) {
//     console.error('❌ Error processing webhook:', error);
//   }
// });


// // app.post('/webhook', async (req, res) => {
// //   console.log('webhook post endpoint run received');
// //   // Return 200 immediately
// //   res.status(200).send('EVENT_RECEIVED');
// //   console.log(':inbox_tray: Webhook received:', JSON.stringify(req.body, null, 2));
// //   const body = req.body;
// //   try {
// //     if (body.object === 'whatsapp_business_account') {
// //       const entry = body.entry?.[0];
// //       const changes = entry?.changes?.[0];
// //       const value = changes?.value;
// //       const field = changes?.field;
// //       console.log(`:clipboard: Webhook field: ${field}`);
// //       // Handle different webhook fields
// //       switch (field) {
// //         case 'messages':
// //           // Your existing message handling code
// //           if (value.messages?.[0]) {
// //             const message = value.messages[0];
// //             console.log(`:incoming_envelope: New message from ${message.from}: ${message.text?.body}`);
// //             // ... your existing message processing
// //           }
// //           break;
// //         case 'message_status':
// //           // Handle status updates
// //           if (value.statuses?.[0]) {
// //             const status = value.statuses[0];
// //             console.log(`:bar_chart: Status update for ${status.id}: ${status.status}`);
// //           }
// //           break;
// //         case 'message_echoes':
// //           // Handle echoes (messages you sent)
// //           console.log(':outbox_tray: Message echo received');
// //           break;
// //         default:
// //           console.log(`:warning: Unhandled webhook field: ${field}`);
// //       }
// //     }
// //   } catch (error) {
// //     console.error(':x: Error processing webhook:', error);
// //   }
// // });

// // Replace your existing webhook POST handler with this
// // app.post('/webhook', async (req, res) => {
// //   // Return 200 OK immediately - CRITICAL!
// //   res.status(200).send('EVENT_RECEIVED');
// //   // Enhanced logging
// //   console.log('\n=== WEBHOOK RECEIVED ===');
// //   console.log('Time:', new Date().toISOString());
// //   console.log('Headers:', {
// //     'x-hub-signature': req.headers['x-hub-signature'] ? 'Present' : 'Missing',
// //     'content-type': req.headers['content-type'],
// //   });
// //   const body = req.body;
// //   console.log('Full body:', JSON.stringify(body, null, 2));
// //   try {
// //     if (body.object === 'whatsapp_business_account') {
// //       const entry = body.entry?.[0];
// //       const changes = entry?.changes?.[0];
// //       const field = changes?.field;
// //       const value = changes?.value;
// //       console.log(`Field type: ${field}`);
// //       // Handle messages
// //       if (field === 'messages' && value.messages?.[0]) {
// //         const message = value.messages[0];
// //         const from = message.from;
// //         console.log(`:incoming_envelope: NEW MESSAGE from ${from}`);
// //         console.log(`Type: ${message.type}`);
// //         console.log(`Content: ${message.text?.body || '[non-text]'}`);
// //         // Your existing message handling code...
// //       }
// //       // Handle statuses
// //       else if (value.statuses?.[0]) {
// //         const status = value.statuses[0];
// //         console.log(`:bar_chart: Status update: ${status.status} for message ${status.id}`);
// //       }
// //       // Handle other events
// //       else {
// //         console.log('Other event type:', field);
// //       }
// //     }
// //   } catch (error) {
// //     console.error(':x: Error processing webhook:', error);
// //   }
// //   console.log('=== END WEBHOOK ===\n');
// // });



// // Add this to your webhook server to initiate conversations
// app.post('/api/send-message', async (req, res) => {
//   const { to, message } = req.body;
//   try {
//     // Replace with your actual WhatsApp API credentials
//     const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.WHATSAPP_VERIFY_TOKEN}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         recipient_type: 'individual',
//         to: to,
//         type: 'text',
//         text: {
//           preview_url: false,
//           body: message
//         }
//       })
//     });
//     const data = await response.json();
//     console.log('Message sent:', data);
//     res.json({ success: true, data });
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post('/api/send-template', async (req, res) => {
//   const { to } = req.body;
//   try {
//     const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.WHATSAPP_VERIFY_TOKEN}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         to: to,
//         type: 'template',
//         template: {
//           name: 'hello_world', // Use your approved template name
//           language: {
//             code: 'en_US'
//           }
//         }
//       })
//     });
//     const data = await response.json();
//     res.json({ success: true, data });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// // =================== Chatbot API Routes ===================

// // Get chatbot settings
// app.get('/api/chatbot/settings', async (req, res) => {
//   try {
//     const settings = await ChatbotSettings.getSettings();
//     res.json(settings);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update chatbot settings
// app.put('/api/chatbot/settings', async (req, res) => {
//   try {
//     const settings = await ChatbotSettings.getSettings();
//     Object.assign(settings, req.body);
//     await settings.save();
//     res.json(settings);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update specific chatbot feature
// app.patch('/api/chatbot/settings/:feature', async (req, res) => {
//   try {
//     const { feature } = req.params;
//     const settings = await ChatbotSettings.getSettings();

//     if (feature in settings) {
//       settings[feature] = req.body;
//       await settings.save();
//       res.json(settings);
//     } else {
//       res.status(400).json({ error: 'Invalid feature' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // =================== Conversation & Engagement Routes ===================

// // Get conversations
// app.get('/api/conversations', async (req, res) => {
//   try {
//     const conversations = await Conversation.find()
//       .sort({ lastMessageTime: -1 })
//       .limit(50);

//     console.log(`📖 Fetched ${conversations.length} and ${conversations} conversations`);
//     res.json(conversations);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get messages for a conversation
// app.get('/api/conversations/:phoneNumber/messages', async (req, res) => {
//   try {
//     const { phoneNumber } = req.params;
//     const conversation = await Conversation.findOne({ phoneNumber });

//     console.log(`📖 Fetching messages for conversation: ${phoneNumber}`);
//     console.log(`📖 Conversation found: ${conversation}`);

//     if (!conversation) {
//       return res.json([]);
//     }

//     const messages = await Message.find({ conversationId: conversation._id })
//       .sort({ createdAt: 1 })
//       .limit(100);

//     console.log(`📖 Fetched ${messages.length} messages for conversation: ${phoneNumber}`);
//     console.log(`📖 Messages: ${messages}`);

//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get('/webhook/config-check', (req, res) => {
//   res.json({
//     server_status: 'running',
//     webhook_url: 'https://whatsapp-webhook-w7a3.onrender.com/webhook',
//     expecting_webhook_fields: [
//       'messages',              // ← THIS IS CRITICAL
//       'messaging_postbacks',
//       'message_deliveries',
//       'message_reads'
//     ],
//     verify_in_meta_dashboard: {
//       step1: 'Go to Meta App Dashboard',
//       step2: 'Navigate to WhatsApp > Configuration',
//       step3: 'Click on Webhook',
//       step4: 'Ensure "messages" field is subscribed',
//       step5: 'Check Callback URL matches exactly'
//     }
//   });
// });

// // Mark conversation as read
// app.put('/api/conversations/:phoneNumber/read', async (req, res) => {
//   try {
//     const { phoneNumber } = req.params;
//     const conversation = await Conversation.findOneAndUpdate(
//       { phoneNumber },
//       { unreadCount: 0 }
//     );

//     console.log(`📖 Marked conversation as read: ${phoneNumber}`);
//     console.log(`📖 Updated conversation: ${conversation}`);


//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get user engagement data
// app.get('/api/user-engagement', async (req, res) => {
//   try {
//     const engagements = await UserEngagement.find()
//       .sort({ lastMessageTime: -1 })
//       .limit(100);

//     const data = {};
//     engagements.forEach(eng => {
//       data[eng.phoneNumber] = {
//         lastMessageTime: eng.lastMessageTime,
//         conversationStarted: eng.createdAt,
//         inWindow: eng.checkIfInWindow()
//       };
//     });

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // =================== Helper Functions ===================

// async function processWithChatbot(phoneNumber, message, conversation) {
//   try {
//     const settings = await ChatbotSettings.getSettings();
//     if (!settings.enabled) return null;

//     const lowerMessage = message.toLowerCase().trim();

//     // Check for quick replies
//     const quickReply = settings.quickReplies.find(qr =>
//       qr.enabled && lowerMessage.includes(qr.keyword.toLowerCase())
//     );

//     if (quickReply) {
//       return quickReply.reply;
//     }

//     // Check for chatbot flows
//     const activeFlow = settings.flows.find(flow =>
//       flow.enabled && lowerMessage.includes(flow.trigger.toLowerCase())
//     );

//     if (activeFlow && activeFlow.nodes.length > 0) {
//       return activeFlow.nodes[0].message;
//     }

//     // Check if it's first message (welcome message)
//     const messageCount = await Message.countDocuments({
//       conversationId: conversation._id
//     });

//     if (messageCount === 1 && settings.welcomeMessage.enabled) {
//       return settings.welcomeMessage.message;
//     }

//     // Check away message
//     if (settings.awayMessage.enabled && isOutsideBusinessHours(settings.awayMessage)) {
//       return settings.awayMessage.message;
//     }

//     return null;
//   } catch (error) {
//     console.error('Error processing chatbot:', error);
//     return null;
//   }
// }

// function isOutsideBusinessHours(awayMessage) {
//   const now = new Date();
//   const currentTime = now.getHours() * 60 + now.getMinutes();
//   const [startHour, startMin] = awayMessage.startTime.split(':').map(Number);
//   const [endHour, endMin] = awayMessage.endTime.split(':').map(Number);
//   const startMinutes = startHour * 60 + startMin;
//   const endMinutes = endHour * 60 + endMin;

//   if (startMinutes > endMinutes) {
//     // Overnight hours
//     return currentTime >= startMinutes || currentTime < endMinutes;
//   } else {
//     return currentTime >= startMinutes && currentTime < endMinutes;
//   }
// }

// // =================== Health & Debug Routes ===================

// app.get('/health', async (req, res) => {
//   try {
//     const stats = await Promise.all([
//       UserEngagement.countDocuments(),
//       Conversation.countDocuments(),
//       Message.countDocuments(),
//       UserEngagement.countDocuments({
//         lastMessageTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
//       })
//     ]);

//     res.json({
//       status: 'ok',
//       timestamp: new Date().toISOString(),
//       mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//       websocket_clients: wsClients.size,
//       stats: {
//         total_users: stats[0],
//         total_conversations: stats[1],
//         total_messages: stats[2],
//         users_in_24h_window: stats[3]
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ status: 'error', error: error.message });
//   }
// });

// // Start the server
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
//   console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
//   console.log(`🔌 WebSocket URL: ws://localhost:${PORT}`);
//   console.log(`💓 Health check: http://localhost:${PORT}/health`);
// });


// import express from 'express'
// import axios from 'axios'
const express = require('express')
const axios = require('axios');
require('dotenv').config();

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_TOKEN
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'working_profo_token'
const PORT = process.env.PORT || 3000
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Whatsapp with Node.js and Webhooks')
})

app.get('/webhook', (req, res) => {
  console.log("Webhook hit get endpoint")
  const mode = req.query['hub.mode']
  const challenge = req.query['hub.challenge']
  const token = req.query['hub.verify_token']

  if (mode && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge)
  } else {
    res.sendStatus(403)
  }
})

app.post('/webhook', async (req, res) => {
  console.log("Webhook hit post endpoint")

  const { entry } = req.body
  console.log('Received webhook entry:', JSON.stringify(entry, null, 2))

  if (!entry || entry.length === 0) {
    return res.status(400).send('Invalid Request')
  }

  const changes = entry[0].changes

  if (!changes || changes.length === 0) {
    return res.status(400).send('Invalid Request')
  }

  const statuses = changes[0].value.statuses ? changes[0].value.statuses[0] : null
  const messages = changes[0].value.messages ? changes[0].value.messages[0] : null

  if (statuses) {
    // Handle message status
    console.log(`
      MESSAGE STATUS UPDATE:
      ID: ${statuses.id},
      STATUS: ${statuses.status}
    `)
  }

  if (messages) {
    // Handle received messages
    if (messages.type === 'text') {
      if (messages.text.body.toLowerCase() === 'hello') {
        replyMessage(messages.from, 'Hello. How are you?', messages.id)
      }

      if (messages.text.body.toLowerCase() === 'list') {
        sendList(messages.from)
      }

      if (messages.text.body.toLowerCase() === 'buttons') {
        sendReplyButtons(messages.from)
      }
    }

    if (messages.type === 'interactive') {
      if (messages.interactive.type === 'list_reply') {
        sendMessage(messages.from, `You selected the option with ID ${messages.interactive.list_reply.id} - Title ${messages.interactive.list_reply.title}`)
      }

      if (messages.interactive.type === 'button_reply') {
        sendMessage(messages.from, `You selected the button with ID ${messages.interactive.button_reply.id} - Title ${messages.interactive.button_reply.title}`)
      }
    }

    console.log(JSON.stringify(messages, null, 2))
  }

  res.status(200).send('Webhook processed')
})

async function sendMessage(to, body) {
  await axios({
    url: 'https://graph.facebook.com/v18.0/598241500035903/messages',
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body
      }
    })
  })
}

async function replyMessage(to, body, messageId) {
  await axios({
    url: 'https://graph.facebook.com/v18.0/598241500035903/messages',
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body
      },
      context: {
        message_id: messageId
      }
    })
  })
}

async function sendList(to) {
  const sendListRes = await axios({
    url: 'https://graph.facebook.com/v18.0/598241500035903/messages',
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: 'Message Header'
        },
        body: {
          text: 'This is a interactive list message'
        },
        footer: {
          text: 'This is the message footer'
        },
        action: {
          button: 'Tap for the options',
          sections: [
            {
              title: 'First Section',
              rows: [
                {
                  id: 'first_option',
                  title: 'First option',
                  description: 'This is the description of the first option'
                },
                {
                  id: 'second_option',
                  title: 'Second option',
                  description: 'This is the description of the second option'
                }
              ]
            },
            {
              title: 'Second Section',
              rows: [
                {
                  id: 'third_option',
                  title: 'Third option'
                }
              ]
            }
          ]
        }
      }
    })
  })

  console.log("sendListRedsponse", sendListRes.data);
}

async function sendReplyButtons(to) {
  await axios({
    url: 'https://graph.facebook.com/v18.0/598241500035903/messages',
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'text',
          text: 'Message Header'
        },
        body: {
          text: 'This is a interactive reply buttons message'
        },
        footer: {
          text: 'This is the message footer'
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'first_button',
                title: 'First Button'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'second_button',
                title: 'Second Button'
              }
            }
          ]
        }
      }
    })
  })
}

app.listen(PORT, '0.0.0.0' ,() => {
  console.log('Server started on port 3000')
})