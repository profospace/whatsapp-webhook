/**
 * Simple WhatsApp Webhook
 * This is a minimal Node.js server that handles WhatsApp webhook events
 * and responds to incoming messages with a simple reply or template.
 */

// import express from 'express';
// import bodyParser from 'body-parser';
// import fetch from 'node-fetch';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import path from 'path';

// // Load environment variables
// dotenv.config();

// // Initialize express app
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Parse JSON request body
// app.use(bodyParser.json());

// // WhatsApp API Configuration
// const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v22.0';
// const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '598241500035903';
// const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAIAmB3mH3EBO5zWW5FcNWj4lG5SqOJ5FYM1oU2oUsSGY82kfX0ThZCf4bnd1MLjrtLaLRULaNKMF4r7c88HlJaYwnDHhFVCNJkVjseVoQwLjzFANz5ZBZA4D9I8hSZA3bfR5kMJ2NTyfwyov8neqCYFRqO5oZBLLCP2Q3VvZBkyZAgDXcZAJUZAsZAV4v7cR0FrzFugZDZD';
// const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ;


// app.get('/webhook', (req, res) => {
//   // Parse parameters from the webhook verification request
//   const mode = req.query['hub.mode'];
//   const token = req.query['hub.verify_token'];
//   const challenge = req.query['hub.challenge'];
  
//   console.log('=== WEBHOOK VERIFICATION REQUEST ===');
//   console.log(`Timestamp: ${new Date().toISOString()}`);
//   console.log(`Request URL: ${req.originalUrl}`);
//   console.log(`hub.mode: ${mode}`);
//   console.log(`hub.verify_token: ${token}`);
//   console.log(`hub.challenge: ${challenge}`);
//   console.log(`Expected verify_token: ${VERIFY_TOKEN}`);
//   console.log(`Environment variable WHATSAPP_VERIFY_TOKEN: ${process.env.WHATSAPP_VERIFY_TOKEN}`);
  
//   // Check if a token and mode were sent
//   if (mode && token) {
//     // Check the mode and token sent match your configuration
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//       // Respond with the challenge token from the request
//       console.log('✅ WEBHOOK_VERIFIED: Token match successful');
//       return res.status(200).send(challenge);
//     }
//     // Respond with 403 Forbidden if verify tokens do not match
//     console.log('❌ VERIFICATION FAILED: Token does not match');
//     console.log(`Received: "${token}" vs Expected: "${VERIFY_TOKEN}"`);
//     return res.sendStatus(403);
//   }
  
//   // If no mode or token parameters were provided, return a simple message
//   console.log('⚠️ No verification parameters provided, sending default response');
//   return res.status(200).send('WhatsApp Webhook is running. Add hub.mode, hub.verify_token, and hub.challenge parameters for verification.');
// });

// // POST route for handling webhook events
// app.post('/webhook', async (req, res) => {
//   // Return a '200 OK' response right away to acknowledge receipt
//   res.status(200).send('EVENT_RECEIVED');
  
//   const body = req.body;
  
//   console.log('Received webhook payload:', JSON.stringify(body, null, 2));
  
//   // Check if this is a WhatsApp message notification
//   if (body.object && 
//       body.entry && 
//       body.entry[0].changes && 
//       body.entry[0].changes[0] && 
//       body.entry[0].changes[0].value.messages && 
//       body.entry[0].changes[0].value.messages[0]) {
    
//     const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
//     const from = body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
//     const messageType = body.entry[0].changes[0].value.messages[0].type; // extract the message type
    
//     let messageBody = '';
//     if (messageType === 'text') {
//       messageBody = body.entry[0].changes[0].value.messages[0].text.body; // extract the message text
//     } else {
//       messageBody = `a message of type: ${messageType}`;
//     }
    
//     console.log(`Received message: "${messageBody}" from ${from}`);
    
//     try {
//       // Send a response using template
//       await sendTemplateMessage(phoneNumberId, from);
//       console.log(`Template message sent to ${from}`);
      
//       // After a short delay, send a text response
//       setTimeout(async () => {
//         const responseMessage = `Hello! You sent: "${messageBody}". This is an automated response.`;
//         await sendTextMessage(phoneNumberId, from, responseMessage);
//         console.log(`Text response sent to ${from}`);
//       }, 2000);
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   }
// });

// // Test route to send a template message
// app.get('/send-template/:phoneNumber', async (req, res) => {
//   const phoneNumber = req.params.phoneNumber;
  
//   try {
//     const result = await sendTemplateMessage(WHATSAPP_PHONE_NUMBER_ID, phoneNumber);
//     res.json({ success: true, result });
//   } catch (error) {
//     console.error('Error sending template message:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// /**
//  * Function to send a text WhatsApp message
//  */
// async function sendTextMessage(phoneNumberId, to, message) {
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         to: to,
//         type: 'text',
//         text: { body: message }
//       })
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       console.error('WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('Error in sendTextMessage:', error);
//     throw error;
//   }
// }

// /**
//  * Function to send a template WhatsApp message
//  */
// async function sendTemplateMessage(phoneNumberId, to) {
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         to: to,
//         type: 'template',
//         template: {
//           name: 'hello_world',
//           language: { code: 'en_US' }
//         }
//       })
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       console.error('WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('Error in sendTemplateMessage:', error);
//     throw error;
//   }
// }

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     service: 'whatsapp-webhook' 
//   });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
//   console.log(`Health check: http://localhost:${PORT}/health`);
//   console.log(`Test template: http://localhost:${PORT}/send-template/[PHONE_NUMBER]`);
// });

// /**
//  * To run this webhook:
//  * 
//  * 1. Install dependencies:
//  *    npm install express body-parser node-fetch dotenv
//  * 
//  * 2. Create a .env file with:
//  *    WHATSAPP_PHONE_NUMBER_ID=598241500035903
//  *    WHATSAPP_ACCESS_TOKEN=EAAIAmB3mH3EBO5zWW5FcNWj4lG5SqOJ5FYM1oU2oUsSGY82kfX0ThZCf4bnd1MLjrtLaLRULaNKMF4r7c88HlJaYwnDHhFVCNJkVjseVoQwLjzFANz5ZBZA4D9I8hSZA3bfR5kMJ2NTyfwyov8neqCYFRqO5oZBLLCP2Q3VvZBkyZAgDXcZAJUZAsZAV4v7cR0FrzFugZDZD
//  *    WHATSAPP_VERIFY_TOKEN=your_verify_token
//  *    WHATSAPP_API_VERSION=v22.0
//  *    PORT=3000
//  * 
//  * 3. Run the server:
//  *    node updated-whatsapp-webhook.js
//  */




// import express from 'express';
// import bodyParser from 'body-parser';
// import fetch from 'node-fetch';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import path from 'path';

// // Load environment variables
// dotenv.config();

// // Initialize express app
// const app = express();
// const PORT = process.env.PORT || 3100;

// // Parse JSON request body
// app.use(bodyParser.json());

// // WhatsApp API Configuration
// const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
// const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
// const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
// const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// // In-memory user session storage
// // In a production environment, use a database like MongoDB or Redis
// const userSessions = new Map();

// // Session TTL in milliseconds (30 minutes)
// const SESSION_TTL = 30 * 60 * 1000;

// // GET route for webhook verification
// app.get('/webhook', (req, res) => {
//   const mode = req.query['hub.mode'];
//   const token = req.query['hub.verify_token'];
//   const challenge = req.query['hub.challenge'];
  
//   console.log('Webhook GET request received');
//   console.log('Mode:', mode);
//   console.log('Token:', token);
//   console.log('Challenge:', challenge);
//   console.log('Expected token:', VERIFY_TOKEN);
  
//   if (mode && token) {
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//       console.log('WEBHOOK_VERIFIED');
//       return res.status(200).send(challenge);
//     }
//     console.log('Token verification failed');
//     return res.sendStatus(403);
//   }
  
//   console.log('Missing mode or token');
//   return res.status(200).send('WhatsApp Webhook is running.');
// });

// // POST route for webhook events (receiving messages)
// app.post('/webhook', (req, res) => {
//   // Return a 200 OK response to acknowledge receipt
//   res.status(200).send('EVENT_RECEIVED');
  
//   const body = req.body;
  
//   // Log incoming webhook for debugging
//   console.log('Received webhook:', JSON.stringify(body, null, 2));

//   try {
//     // Check if this is a WhatsApp API event
//     if (body.object === 'whatsapp_business_account') {
//       if (body.entry && 
//           body.entry[0].changes && 
//           body.entry[0].changes[0] && 
//           body.entry[0].changes[0].value.messages && 
//           body.entry[0].changes[0].value.messages[0]) {
        
//         // Get the phone number ID from the webhook payload
//         const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
//         const from = body.entry[0].changes[0].value.messages[0].from;
//         let message = '';
        
//         // Check message type (text or interactive)
//         if (body.entry[0].changes[0].value.messages[0].type === 'text') {
//           message = body.entry[0].changes[0].value.messages[0].text.body;
//         } else if (body.entry[0].changes[0].value.messages[0].type === 'interactive') {
//           // Handle button clicks or list selections
//           const interactiveType = body.entry[0].changes[0].value.messages[0].interactive.type;
          
//           if (interactiveType === 'button_reply') {
//             message = body.entry[0].changes[0].value.messages[0].interactive.button_reply.id;
//           } else if (interactiveType === 'list_reply') {
//             message = body.entry[0].changes[0].value.messages[0].interactive.list_reply.id;
//           }
//         }
        
//         console.log(`Processing message from ${from}: ${message}`);
        
//         // Process the message
//         processMessage(phoneNumberId, from, message)
//           .catch(error => console.error('Error processing message:', error));
//       }
//     }
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//   }
// });

// /**
//  * Process incoming messages and manage conversation flow
//  */
// async function processMessage(phoneNumberId, from, message) {
//   // Get or create a session for this user
//   let session = userSessions.get(from);
  
//   if (!session) {
//     session = {
//       phoneNumber: from,
//       lastActivity: Date.now(),
//       context: {
//         step: 'initial',
//         userData: {}
//       }
//     };
//     userSessions.set(from, session);
//   }
  
//   // Update last activity time
//   session.lastActivity = Date.now();
  
//   // Convert message to lowercase for easier matching
//   const lowerMessage = message.toLowerCase().trim();
  
//   // Check for greeting or reset conversation
//   if (['hi', 'hello', 'hey', 'start', 'restart', 'reset'].includes(lowerMessage) || session.context.step === 'initial') {
//     session.context.step = 'welcome';
//     await sendMainMenu(phoneNumberId, from);
//     return;
//   }
  
//   // Process based on current conversation step
//   switch (session.context.step) {
//     case 'welcome':
//       if (lowerMessage === 'buy_property' || lowerMessage.includes('buy') || lowerMessage.includes('looking')) {
//         session.context.step = 'buy_location';
//         session.context.userData.intent = 'buy';
//         await sendTextMessage(phoneNumberId, from, "Great! What area or neighborhood are you interested in buying a property?");
//       } else if (lowerMessage === 'sell_property' || lowerMessage.includes('sell')) {
//         session.context.step = 'sell_property_type';
//         session.context.userData.intent = 'sell';
//         await sendPropertyTypeOptions(phoneNumberId, from, 'sell');
//       } else if (lowerMessage === 'rent_property' || lowerMessage.includes('rent')) {
//         session.context.step = 'rent_location';
//         session.context.userData.intent = 'rent';
//         await sendTextMessage(phoneNumberId, from, "What area or neighborhood are you looking to rent in?");
//       } else {
//         // If input doesn't match options, re-send the menu
//         await sendTextMessage(phoneNumberId, from, "I didn't quite catch that. Please select one of these options:");
//         await sendMainMenu(phoneNumberId, from);
//       }
//       break;
      
//     case 'buy_location':
//       session.context.userData.location = message;
//       session.context.step = 'buy_budget';
//       await sendTextMessage(phoneNumberId, from, `Great, ${message} is a nice area. What's your budget range? (e.g., $200,000-$300,000)`);
//       break;
      
//     case 'buy_budget':
//       session.context.userData.budget = message;
//       session.context.step = 'buy_property_type';
//       await sendPropertyTypeOptions(phoneNumberId, from, 'buy');
//       break;
      
//     case 'buy_property_type':
//       session.context.userData.propertyType = message;
//       session.context.step = 'buy_bedrooms';
//       await sendBedroomOptions(phoneNumberId, from);
//       break;
      
//     case 'buy_bedrooms':
//       session.context.userData.bedrooms = message;
//       session.context.step = 'summary';
//       await sendSummary(phoneNumberId, from, session.context.userData);
//       break;
      
//     case 'rent_location':
//       session.context.userData.location = message;
//       session.context.step = 'rent_budget';
//       await sendTextMessage(phoneNumberId, from, `Great, ${message} is a nice area for rentals. What's your monthly budget? (e.g., $1,500-$2,000)`);
//       break;
      
//     case 'rent_budget':
//       session.context.userData.budget = message;
//       session.context.step = 'rent_property_type';
//       await sendPropertyTypeOptions(phoneNumberId, from, 'rent');
//       break;
    
//     case 'rent_property_type':
//       session.context.userData.propertyType = message;
//       session.context.step = 'rent_bedrooms';
//       await sendBedroomOptions(phoneNumberId, from);
//       break;
      
//     case 'rent_bedrooms':
//       session.context.userData.bedrooms = message;
//       session.context.step = 'summary';
//       await sendSummary(phoneNumberId, from, session.context.userData);
//       break;
      
//     case 'sell_property_type':
//       session.context.userData.propertyType = message;
//       session.context.step = 'sell_location';
//       await sendTextMessage(phoneNumberId, from, "Where is your property located?");
//       break;
      
//     case 'sell_location':
//       session.context.userData.location = message;
//       session.context.step = 'sell_asking_price';
//       await sendTextMessage(phoneNumberId, from, "What is your asking price for the property?");
//       break;
      
//     case 'sell_asking_price':
//       session.context.userData.askingPrice = message;
//       session.context.step = 'summary';
//       await sendSummary(phoneNumberId, from, session.context.userData);
//       break;
      
//     case 'summary':
//       if (lowerMessage === 'new_search' || lowerMessage.includes('new') || lowerMessage.includes('again')) {
//         // Reset the conversation
//         session.context.step = 'welcome';
//         await sendMainMenu(phoneNumberId, from);
//       } else if (lowerMessage === 'contact_agent' || lowerMessage.includes('agent') || lowerMessage.includes('contact')) {
//         session.context.step = 'contact_info';
//         await sendTextMessage(phoneNumberId, from, "Please provide your name and best time to contact you:");
//       } else {
//         await sendFollowUpOptions(phoneNumberId, from);
//       }
//       break;
      
//     case 'contact_info':
//       session.context.userData.contactInfo = message;
//       session.context.step = 'completed';
//       await sendTextMessage(phoneNumberId, from, 
//         "Thank you for providing your information! One of our real estate agents will contact you shortly.\n\n" +
//         "Is there anything else you'd like to know in the meantime?");
//       // Here you would trigger a notification to your CRM or agent system
//       // sendAgentNotification(session.context.userData);
//       break;
      
//     case 'completed':
//       if (lowerMessage === 'new_search' || lowerMessage.includes('new') || lowerMessage.includes('again') || 
//           lowerMessage.includes('start') || lowerMessage.includes('restart')) {
//         // Reset the conversation
//         session.context.step = 'welcome';
//         await sendMainMenu(phoneNumberId, from);
//       } else {
//         await sendTextMessage(phoneNumberId, from, 
//           "Our agent will be in touch with you shortly. If you'd like to start a new search, simply type 'new search' or 'start again'.");
//       }
//       break;
      
//     default:
//       // If we don't know what step we're on, restart the conversation
//       session.context.step = 'welcome';
//       await sendMainMenu(phoneNumberId, from);
//       break;
//   }
  
//   // Update the session in the map
//   userSessions.set(from, session);
// }

// /**
//  * Send the main menu with options
//  */
// async function sendMainMenu(phoneNumberId, from) {
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         recipient_type: 'individual',
//         to: from,
//         type: 'interactive',
//         interactive: {
//           type: 'button',
//           body: {
//             text: 'Welcome to Real Estate Assistant! How can I help you today?'
//           },
//           action: {
//             buttons: [
//               {
//                 type: 'reply',
//                 reply: {
//                   id: 'buy_property',
//                   title: 'Buy Property'
//                 }
//               },
//               {
//                 type: 'reply',
//                 reply: {
//                   id: 'sell_property',
//                   title: 'Sell Property'
//                 }
//               },
//               {
//                 type: 'reply',
//                 reply: {
//                   id: 'rent_property',
//                   title: 'Rent Property'
//                 }
//               }
//             ]
//           }
//         }
//       })
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       console.error('WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('Error in sendMainMenu:', error);
//     // Fallback to text message if interactive message fails
//     await sendTextMessage(phoneNumberId, from, 
//       "Welcome to Real Estate Assistant! How can I help you today?\n\n" +
//       "1. Buy Property\n" +
//       "2. Sell Property\n" +
//       "3. Rent Property\n\n" +
//       "Please type your choice."
//     );
//   }
// }

// /**
//  * Send property type selection buttons
//  */
// async function sendPropertyTypeOptions(phoneNumberId, from, action) {
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
//   const actionPrefix = action === 'buy' ? 'buy_' : (action === 'rent' ? 'rent_' : 'sell_');
  
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         recipient_type: 'individual',
//         to: from,
//         type: 'interactive',
//         interactive: {
//           type: 'list',
//           body: {
//             text: `What type of property are you interested in ${action === 'sell' ? 'selling' : action + 'ing'}?`
//           },
//           action: {
//             button: "Property Types",
//             sections: [
//               {
//                 title: "Property Types",
//                 rows: [
//                   {
//                     id: `${actionPrefix}house`,
//                     title: "House",
//                     description: "Single-family home"
//                   },
//                   {
//                     id: `${actionPrefix}apartment`,
//                     title: "Apartment",
//                     description: "Apartment or flat"
//                   },
//                   {
//                     id: `${actionPrefix}condo`,
//                     title: "Condo",
//                     description: "Condominium"
//                   },
//                   {
//                     id: `${actionPrefix}townhouse`,
//                     title: "Townhouse",
//                     description: "Townhouse or rowhouse"
//                   },
//                   {
//                     id: `${actionPrefix}land`,
//                     title: "Land",
//                     description: "Vacant land or lot"
//                   }
//                 ]
//               }
//             ]
//           }
//         }
//       })
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       console.error('WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('Error in sendPropertyTypeOptions:', error);
//     // Fallback to text message if interactive message fails
//     await sendTextMessage(phoneNumberId, from, 
//       `What type of property are you interested in ${action === 'sell' ? 'selling' : action + 'ing'}?\n\n` +
//       "- House (Single-family home)\n" +
//       "- Apartment (Apartment or flat)\n" +
//       "- Condo (Condominium)\n" +
//       "- Townhouse (Townhouse or rowhouse)\n" +
//       "- Land (Vacant land or lot)\n\n" +
//       "Please type your choice."
//     );
//   }
// }

// /**
//  * Send bedroom options
//  */
// async function sendBedroomOptions(phoneNumberId, from) {
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         recipient_type: 'individual',
//         to: from,
//         type: 'interactive',
//         interactive: {
//           type: 'button',
//           body: {
//             text: 'How many bedrooms are you looking for?'
//           },
//           action: {
//             buttons: [
//               {
//                 type: 'reply',
//                 reply: {
//                   id: '1-2_bedrooms',
//                   title: '1-2 Bedrooms'
//                 }
//               },
//               {
//                 type: 'reply',
//                 reply: {
//                   id: '3-4_bedrooms',
//                   title: '3-4 Bedrooms'
//                 }
//               },
//               {
//                 type: 'reply',
//                 reply: {
//                   id: '5+_bedrooms',
//                   title: '5+ Bedrooms'
//                 }
//               }
//             ]
//           }
//         }
//       })
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       console.error('WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('Error in sendBedroomOptions:', error);
//     // Fallback to text message if interactive message fails
//     await sendTextMessage(phoneNumberId, from, 
//       "How many bedrooms are you looking for?\n\n" +
//       "1. 1-2 Bedrooms\n" +
//       "2. 3-4 Bedrooms\n" +
//       "3. 5+ Bedrooms\n\n" +
//       "Please type your choice."
//     );
//   }
// }

// /**
//  * Send a summary of the user's preferences and next steps
//  */
// async function sendSummary(phoneNumberId, from, userData) {
//   let summaryText = "Here's a summary of what you're looking for:\n\n";
  
//   if (userData.intent === 'buy') {
//     summaryText += `🏠 *Interest*: Buying a property\n`;
//     summaryText += `📍 *Location*: ${userData.location}\n`;
//     summaryText += `💰 *Budget*: ${userData.budget}\n`;
//     summaryText += `🏢 *Property Type*: ${userData.propertyType || 'Not specified'}\n`;
//     summaryText += `🛏️ *Bedrooms*: ${userData.bedrooms || 'Not specified'}\n\n`;
//     summaryText += "Based on your preferences, we'll find some great properties for you!";
//   } else if (userData.intent === 'rent') {
//     summaryText += `🏠 *Interest*: Renting a property\n`;
//     summaryText += `📍 *Location*: ${userData.location}\n`;
//     summaryText += `💰 *Monthly Budget*: ${userData.budget}\n`;
//     summaryText += `🏢 *Property Type*: ${userData.propertyType || 'Not specified'}\n`;
//     summaryText += `🛏️ *Bedrooms*: ${userData.bedrooms || 'Not specified'}\n\n`;
//     summaryText += "We'll help you find the perfect rental property!";
//   } else if (userData.intent === 'sell') {
//     summaryText += `🏠 *Interest*: Selling a property\n`;
//     summaryText += `🏢 *Property Type*: ${userData.propertyType || 'Not specified'}\n`;
//     summaryText += `📍 *Location*: ${userData.location}\n`;
//     summaryText += `💰 *Asking Price*: ${userData.askingPrice}\n\n`;
//     summaryText += "We'll help you sell your property at the best price!";
//   }
  
//   await sendTextMessage(phoneNumberId, from, summaryText);
//   await sendFollowUpOptions(phoneNumberId, from);
// }

// /**
//  * Send follow-up options after summary
//  */
// async function sendFollowUpOptions(phoneNumberId, from) {
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         recipient_type: 'individual',
//         to: from,
//         type: 'interactive',
//         interactive: {
//           type: 'button',
//           body: {
//             text: 'What would you like to do next?'
//           },
//           action: {
//             buttons: [
//               {
//                 type: 'reply',
//                 reply: {
//                   id: 'contact_agent',
//                   title: 'Contact Agent'
//                 }
//               },
//               {
//                 type: 'reply',
//                 reply: {
//                   id: 'new_search',
//                   title: 'New Search'
//                 }
//               }
//             ]
//           }
//         }
//       })
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       console.error('WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('Error in sendFollowUpOptions:', error);
//     // Fallback to text message if interactive message fails
//     await sendTextMessage(phoneNumberId, from, 
//       "What would you like to do next?\n\n" +
//       "1. Contact Agent\n" +
//       "2. Start a New Search\n\n" +
//       "Please type your choice."
//     );
//   }
// }

// /**
//  * Function to send a text WhatsApp message
//  */
// async function sendTextMessage(phoneNumberId, to, message) {
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         to: to,
//         type: 'text',
//         text: { body: message }
//       })
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       console.error('WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('Error in sendTextMessage:', error);
//     throw error;
//   }
// }

// /**
//  * Periodically clean up expired sessions
//  */
// setInterval(() => {
//   const now = Date.now();
//   for (const [key, session] of userSessions.entries()) {
//     if (now - session.lastActivity > SESSION_TTL) {
//       userSessions.delete(key);
//       console.log(`Session expired for ${key}`);
//     }
//   }
// }, 5 * 60 * 1000); // Run every 5 minutes

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     service: 'real-estate-chatbot',
//     activeUsers: userSessions.size
//   });
// });

// // Debug endpoint to view active sessions (password protected)
// app.get('/debug/sessions', (req, res) => {
//   const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
//   const providedPassword = req.query.password;
  
//   if (providedPassword !== adminPassword) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
  
//   const sessions = Array.from(userSessions.entries()).map(([phone, session]) => ({
//     phone,
//     lastActivity: new Date(session.lastActivity).toISOString(),
//     step: session.context.step,
//     data: session.context.userData
//   }));
  
//   res.json({ sessions });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
//   console.log(`Health check: http://localhost:${PORT}/health`);
//   console.log(`Debug sessions: http://localhost:${PORT}/debug/sessions?password=admin123`);
// });


////// second part of the code ---------------------------------------------->>>>>>>> 

// import express from 'express';
// import bodyParser from 'body-parser';
// import fetch from 'node-fetch';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import path from 'path';
// // Load environment variables
// dotenv.config();
// // Initialize express app
// const app = express();
// const PORT = process.env.PORT || 3100;
// // Add request logging middleware
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
//     query: req.query,
//     body: req.method === 'POST' ? req.body : undefined
//   });
//   next();
// });
// // Parse JSON request body
// app.use(bodyParser.json());
// // WhatsApp API Configuration
// const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION ;
// const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
// const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
// const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
// // Log configuration on startup
// console.log('Starting with configuration:');
// console.log(`API Version: ${WHATSAPP_API_VERSION}`);
// console.log(`Phone Number ID: ${WHATSAPP_PHONE_NUMBER_ID ? 'Set' : 'NOT SET (CRITICAL)'}`);
// console.log(`Access Token: ${WHATSAPP_ACCESS_TOKEN ? 'Set' : 'NOT SET (CRITICAL)'}`);
// console.log(`Verify Token: ${VERIFY_TOKEN ? 'Set' : 'NOT SET (CRITICAL)'}`);
// // In-memory user session storage
// const userSessions = new Map();
// // Session TTL in milliseconds (30 minutes)
// const SESSION_TTL = 30 * 60 * 1000;
// // GET route for webhook verification
// app.get('/webhook', (req, res) => {
//   const mode = req.query['hub.mode'];
//   const token = req.query['hub.verify_token'];
//   const challenge = req.query['hub.challenge'];
  
//   console.log('Webhook verification request received:');
//   console.log('Mode:', mode);
//   console.log('Token:', token);
//   console.log('Challenge:', challenge);
//   console.log('Expected token:', VERIFY_TOKEN);
  
//   if (mode && token) {
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//       console.log('✅ WEBHOOK_VERIFIED');
//       return res.status(200).send(challenge);
//     }
//     console.log('❌ Token verification failed');
//     return res.sendStatus(403);
//   }
  
//   console.log('Missing mode or token');
//   return res.status(200).send('WhatsApp Webhook is running.');
// });
// app.post('/webhook', (req, res) => {
//   // Return a 200 OK response immediately to acknowledge receipt
//   res.status(200).send('EVENT_RECEIVED');
  
//   const body = req.body;
  
//   // Log incoming webhook for debugging
//   console.log('📩 Received webhook:', JSON.stringify(body, null, 2));
//   try {
//     // Check if this is a WhatsApp API event
//     if (body.object === 'whatsapp_business_account') {
//       if (body.entry && 
//           body.entry[0].changes && 
//           body.entry[0].changes[0]) {
        
//         const change = body.entry[0].changes[0];
//         const field = change.field;
//         const value = change.value;
        
//         console.log(`📊 Processing webhook field: ${field}`);
        
//         // Handle different types of webhook notifications
//         switch (field) {
//           case 'messages':
//             if (value.messages && value.messages[0]) {
//               // Handle messages
//               const phoneNumberId = value.metadata.phone_number_id;
//               const from = value.messages[0].from;
//               let message = '';
              
//               // Check message type (text or interactive)
//               if (value.messages[0].type === 'text') {
//                 message = value.messages[0].text.body;
//                 console.log(`📝 Received text message: "${message}"`);
//               } else if (value.messages[0].type === 'interactive') {
//                 // Handle button clicks or list selections
//                 const interactiveType = value.messages[0].interactive.type;
                
//                 if (interactiveType === 'button_reply') {
//                   message = value.messages[0].interactive.button_reply.id;
//                   console.log(`🔘 Received button reply: ${message}`);
//                 } else if (interactiveType === 'list_reply') {
//                   message = value.messages[0].interactive.list_reply.id;
//                   console.log(`📋 Received list selection: ${message}`);
//                 }
//               } else {
//                 // Handle other message types (image, video, audio, etc.)
//                 console.log(`📦 Received message of type: ${value.messages[0].type}`);
//                 message = `[${value.messages[0].type} message]`;
//               }
              
//               console.log(`📱 Processing message from ${from}: ${message}`);
              
//               // Process the message through the conversation flow
//               processMessage(phoneNumberId, from, message)
//                 .catch(error => console.error('❌ Error processing message:', error));
//             } else if (value.statuses && value.statuses[0]) {
//               // Handle message status updates
//               const status = value.statuses[0].status;
//               const messageId = value.statuses[0].id;
              
//               console.log(`📊 Message status update: ${messageId} is now ${status}`);
              
//               // You can implement specific handling for different statuses
//               switch (status) {
//                 case 'sent':
//                   console.log(`✅ Message ${messageId} was sent`);
//                   break;
//                 case 'delivered':
//                   console.log(`📬 Message ${messageId} was delivered`);
//                   break;
//                 case 'read':
//                   console.log(`👁️ Message ${messageId} was read`);
//                   break;
//                 case 'failed':
//                   console.error(`❌ Message ${messageId} failed to deliver`);
//                   // You might want to retry or notify admins
//                   if (value.statuses[0].errors) {
//                     console.error('Error details:', value.statuses[0].errors);
//                   }
//                   break;
//               }
//             }
//             break;
            
//           case 'account_alerts':
//             // Handle account alerts
//             console.log(`📢 Account alert received: ${value.alert_type}`);
//             console.log('Alert details:', JSON.stringify(value, null, 2));
            
//             // Handle specific alert types
//             switch (value.alert_type) {
//               case 'OBA_APPROVED':
//                 console.log('✅ Official Business Account has been approved!');
//                 // Trigger any OBA approval related actions
//                 // Example: updateAccountStatus('approved');
//                 break;
//               case 'ACCOUNT_REVIEW':
//                 console.log('⚠️ Account is under review');
//                 break;
//               case 'ACCOUNT_UPDATE':
//                 console.log('ℹ️ Account has been updated');
//                 break;
//               default:
//                 console.log(`ℹ️ Received alert type: ${value.alert_type}`);
//             }
//             break;
            
//           case 'message_template_status_update':
//             // Handle template status updates
//             console.log(`📋 Template status update received`);
//             console.log('Template details:', JSON.stringify(value, null, 2));
            
//             // You can update your template database/cache based on these updates
//             // Example: updateTemplateStatus(value.message_template_id, value.status);
//             break;
          
//           case 'phone_number_quality_update':
//             // Handle phone number quality updates
//             console.log(`📱 Phone number quality update received`);
//             console.log('Quality details:', JSON.stringify(value, null, 2));
//             break;
            
//           case 'phone_number_name_update':
//             // Handle phone number name updates
//             console.log(`📱 Phone number name update received`);
//             console.log('Name update details:', JSON.stringify(value, null, 2));
//             break;
            
//           default:
//             // Log other types of webhooks that we're not handling specifically
//             console.log(`⚠️ Received webhook with unknown field type: ${field}`);
//             console.log('Value:', JSON.stringify(value, null, 2));
//         }
//       } else {
//         console.log('⚠️ Received webhook with incomplete structure');
//         console.log('Body:', JSON.stringify(body, null, 2));
//       }
//     } else {
//       console.log(`⚠️ Webhook received with object type: ${body.object || 'undefined'}`);
//     }
//   } catch (error) {
//     console.error('❌ Error processing webhook:', error);
//     console.error('Error stack:', error.stack);
//     console.error('Request body:', JSON.stringify(body, null, 2));
//   }
// });
// /**
//  * Process incoming messages and manage conversation flow
//  */
// async function processMessage(phoneNumberId, from, message) {
//   console.log(`🔄 processMessage: phoneNumberId=${phoneNumberId}, from=${from}, message=${message}`);
  
//   // Get or create a session for this user
//   let session = userSessions.get(from);
  
//   if (!session) {
//     console.log(`🆕 Creating new session for ${from}`);
//     session = {
//       phoneNumber: from,
//       lastActivity: Date.now(),
//       context: {
//         step: 'initial',
//         userData: {}
//       }
//     };
//     userSessions.set(from, session);
//   } else {
//     console.log(`🔄 Using existing session for ${from}, current step: ${session.context.step}`);
//   }
  
//   // Update last activity time
//   session.lastActivity = Date.now();
  
//   // Convert message to lowercase for easier matching
//   const lowerMessage = message.toLowerCase().trim();
  
//   // Check for greeting or reset conversation
//   if (['hi', 'hello', 'hey', 'start', 'restart', 'reset'].includes(lowerMessage) || session.context.step === 'initial') {
//     console.log(`👋 Greeting detected or initial step: ${lowerMessage}`);
//     session.context.step = 'welcome';
//     await sendMainMenu(phoneNumberId, from);
//     return;
//   }
  
//   // Process based on current conversation step
//   console.log(`🔄 Processing step: ${session.context.step}`);
  
//   switch (session.context.step) {
//     case 'welcome':
//       if (lowerMessage === 'buy_property' || lowerMessage.includes('buy') || lowerMessage.includes('looking')) {
//         console.log(`👤 User selected 'buy' option`);
//         session.context.step = 'buy_location';
//         session.context.userData.intent = 'buy';
//         await sendTextMessage(phoneNumberId, from, "Great! What area or neighborhood are you interested in buying a property?");
//       } else if (lowerMessage === 'sell_property' || lowerMessage.includes('sell')) {
//         console.log(`👤 User selected 'sell' option`);
//         session.context.step = 'sell_property_type';
//         session.context.userData.intent = 'sell';
//         await sendPropertyTypeOptions(phoneNumberId, from, 'sell');
//       } else if (lowerMessage === 'rent_property' || lowerMessage.includes('rent')) {
//         console.log(`👤 User selected 'rent' option`);
//         session.context.step = 'rent_location';
//         session.context.userData.intent = 'rent';
//         await sendTextMessage(phoneNumberId, from, "What area or neighborhood are you looking to rent in?");
//       } else {
//         console.log(`⚠️ Unrecognized input at welcome step: ${lowerMessage}`);
//         // If input doesn't match options, re-send the menu
//         await sendTextMessage(phoneNumberId, from, "I didn't quite catch that. Please select one of these options:");
//         await sendMainMenu(phoneNumberId, from);
//       }
//       break;
      
//     // Rest of the switch cases remain the same with added logging
//     case 'buy_location':
//       console.log(`👤 User provided buy location: ${message}`);
//       session.context.userData.location = message;
//       session.context.step = 'buy_budget';
//       await sendTextMessage(phoneNumberId, from, `Great, ${message} is a nice area. What's your budget range? (e.g., $200,000-$300,000)`);
//       break;
      
//     case 'buy_budget':
//       console.log(`👤 User provided buy budget: ${message}`);
//       session.context.userData.budget = message;
//       session.context.step = 'buy_property_type';
//       await sendPropertyTypeOptions(phoneNumberId, from, 'buy');
//       break;
      
//     case 'buy_property_type':
//       console.log(`👤 User selected property type: ${message}`);
//       session.context.userData.propertyType = message;
//       session.context.step = 'buy_bedrooms';
//       await sendBedroomOptions(phoneNumberId, from);
//       break;
      
//     case 'buy_bedrooms':
//       console.log(`👤 User selected bedrooms: ${message}`);
//       session.context.userData.bedrooms = message;
//       session.context.step = 'summary';
//       await sendSummary(phoneNumberId, from, session.context.userData);
//       break;
      
//     case 'rent_location':
//       console.log(`👤 User provided rent location: ${message}`);
//       session.context.userData.location = message;
//       session.context.step = 'rent_budget';
//       await sendTextMessage(phoneNumberId, from, `Great, ${message} is a nice area for rentals. What's your monthly budget? (e.g., $1,500-$2,000)`);
//       break;
      
//     case 'rent_budget':
//       console.log(`👤 User provided rent budget: ${message}`);
//       session.context.userData.budget = message;
//       session.context.step = 'rent_property_type';
//       await sendPropertyTypeOptions(phoneNumberId, from, 'rent');
//       break;
    
//     case 'rent_property_type':
//       console.log(`👤 User selected property type: ${message}`);
//       session.context.userData.propertyType = message;
//       session.context.step = 'rent_bedrooms';
//       await sendBedroomOptions(phoneNumberId, from);
//       break;
      
//     case 'rent_bedrooms':
//       console.log(`👤 User selected bedrooms: ${message}`);
//       session.context.userData.bedrooms = message;
//       session.context.step = 'summary';
//       await sendSummary(phoneNumberId, from, session.context.userData);
//       break;
      
//     case 'sell_property_type':
//       console.log(`👤 User selected property type to sell: ${message}`);
//       session.context.userData.propertyType = message;
//       session.context.step = 'sell_location';
//       await sendTextMessage(phoneNumberId, from, "Where is your property located?");
//       break;
      
//     case 'sell_location':
//       console.log(`👤 User provided sell location: ${message}`);
//       session.context.userData.location = message;
//       session.context.step = 'sell_asking_price';
//       await sendTextMessage(phoneNumberId, from, "What is your asking price for the property?");
//       break;
      
//     case 'sell_asking_price':
//       console.log(`👤 User provided asking price: ${message}`);
//       session.context.userData.askingPrice = message;
//       session.context.step = 'summary';
//       await sendSummary(phoneNumberId, from, session.context.userData);
//       break;
      
//     case 'summary':
//       console.log(`👤 User response after summary: ${message}`);
//       if (lowerMessage === 'new_search' || lowerMessage.includes('new') || lowerMessage.includes('again')) {
//         // Reset the conversation
//         console.log(`🔄 Resetting conversation to welcome step`);
//         session.context.step = 'welcome';
//         await sendMainMenu(phoneNumberId, from);
//       } else if (lowerMessage === 'contact_agent' || lowerMessage.includes('agent') || lowerMessage.includes('contact')) {
//         console.log(`👤 User wants to contact an agent`);
//         session.context.step = 'contact_info';
//         await sendTextMessage(phoneNumberId, from, "Please provide your name and best time to contact you:");
//       } else {
//         console.log(`⚠️ Unrecognized input at summary step, sending follow-up options`);
//         await sendFollowUpOptions(phoneNumberId, from);
//       }
//       break;
      
//     case 'contact_info':
//       console.log(`👤 User provided contact info: ${message}`);
//       session.context.userData.contactInfo = message;
//       session.context.step = 'completed';
//       await sendTextMessage(phoneNumberId, from, 
//         "Thank you for providing your information! One of our real estate agents will contact you shortly.\n\n" +
//         "Is there anything else you'd like to know in the meantime?");
//       // Here you would trigger a notification to your CRM or agent system
//       // sendAgentNotification(session.context.userData);
//       break;
      
//     case 'completed':
//       console.log(`👤 User message after completion: ${message}`);
//       if (lowerMessage === 'new_search' || lowerMessage.includes('new') || lowerMessage.includes('again') || 
//           lowerMessage.includes('start') || lowerMessage.includes('restart')) {
//         // Reset the conversation
//         console.log(`🔄 Resetting conversation to welcome step`);
//         session.context.step = 'welcome';
//         await sendMainMenu(phoneNumberId, from);
//       } else {
//         console.log(`👤 User sent message after completion, sending default response`);
//         await sendTextMessage(phoneNumberId, from, 
//           "Our agent will be in touch with you shortly. If you'd like to start a new search, simply type 'new search' or 'start again'.");
//       }
//       break;
      
//     default:
//       console.log(`⚠️ Unknown step: ${session.context.step}, resetting to welcome`);
//       // If we don't know what step we're on, restart the conversation
//       session.context.step = 'welcome';
//       await sendMainMenu(phoneNumberId, from);
//       break;
//   }
  
//   // Update the session in the map
//   userSessions.set(from, session);
//   console.log(`💾 Updated session for ${from}, new step: ${session.context.step}`);
// }
// /**
//  * Send the main menu with options
//  */
// async function sendMainMenu(phoneNumberId, from) {
//   console.log(`📤 Sending main menu to ${from}`);
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const payload = {
//       messaging_product: 'whatsapp',
//       recipient_type: 'individual',
//       to: from,
//       type: 'interactive',
//       interactive: {
//         type: 'button',
//         body: {
//           text: 'Welcome to Real Estate Assistant! How can I help you today?'
//         },
//         action: {
//           buttons: [
//             {
//               type: 'reply',
//               reply: {
//                 id: 'buy_property',
//                 title: 'Buy Property'
//               }
//             },
//             {
//               type: 'reply',
//               reply: {
//                 id: 'sell_property',
//                 title: 'Sell Property'
//               }
//             },
//             {
//               type: 'reply',
//               reply: {
//                 id: 'rent_property',
//                 title: 'Rent Property'
//               }
//             }
//           ]
//         }
//       }
//     };
    
//     console.log(`📤 Main menu payload: ${JSON.stringify(payload, null, 2)}`);
//     console.log(`📤 Using URL: ${url}`);
    
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify(payload)
//     });
    
//     const data = await response.json();
//     console.log(`📥 Main menu API response: ${JSON.stringify(data, null, 2)}`);
    
//     if (!response.ok) {
//       console.error('❌ WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('❌ Error in sendMainMenu:', error);
//     // Fallback to text message if interactive message fails
//     console.log(`⚠️ Falling back to text message for main menu`);
//     await sendTextMessage(phoneNumberId, from, 
//       "Welcome to Real Estate Assistant! How can I help you today?\n\n" +
//       "1. Buy Property\n" +
//       "2. Sell Property\n" +
//       "3. Rent Property\n\n" +
//       "Please type your choice."
//     );
//   }
// }
// /**
//  * Send property type selection buttons
//  */
// async function sendPropertyTypeOptions(phoneNumberId, from, action) {
//   console.log(`📤 Sending property type options for "${action}" to ${from}`);
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
//   const actionPrefix = action === 'buy' ? 'buy_' : (action === 'rent' ? 'rent_' : 'sell_');
  
//   try {
//     const payload = {
//       messaging_product: 'whatsapp',
//       recipient_type: 'individual',
//       to: from,
//       type: 'interactive',
//       interactive: {
//         type: 'list',
//         body: {
//           text: `What type of property are you interested in ${action === 'sell' ? 'selling' : action + 'ing'}?`
//         },
//         action: {
//           button: "Property Types",
//           sections: [
//             {
//               title: "Property Types",
//               rows: [
//                 {
//                   id: `${actionPrefix}house`,
//                   title: "House",
//                   description: "Single-family home"
//                 },
//                 {
//                   id: `${actionPrefix}apartment`,
//                   title: "Apartment",
//                   description: "Apartment or flat"
//                 },
//                 {
//                   id: `${actionPrefix}condo`,
//                   title: "Condo",
//                   description: "Condominium"
//                 },
//                 {
//                   id: `${actionPrefix}townhouse`,
//                   title: "Townhouse",
//                   description: "Townhouse or rowhouse"
//                 },
//                 {
//                   id: `${actionPrefix}land`,
//                   title: "Land",
//                   description: "Vacant land or lot"
//                 }
//               ]
//             }
//           ]
//         }
//       }
//     };
//     console.log(`📤 Property type options payload: ${JSON.stringify(payload, null, 2)}`);
    
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify(payload)
//     });
    
//     const data = await response.json();
//     console.log(`📥 Property type API response: ${JSON.stringify(data, null, 2)}`);
    
//     if (!response.ok) {
//       console.error('❌ WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('❌ Error in sendPropertyTypeOptions:', error);
//     // Fallback to text message if interactive message fails
//     console.log(`⚠️ Falling back to text message for property types`);
//     await sendTextMessage(phoneNumberId, from, 
//       `What type of property are you interested in ${action === 'sell' ? 'selling' : action + 'ing'}?\n\n` +
//       "- House (Single-family home)\n" +
//       "- Apartment (Apartment or flat)\n" +
//       "- Condo (Condominium)\n" +
//       "- Townhouse (Townhouse or rowhouse)\n" +
//       "- Land (Vacant land or lot)\n\n" +
//       "Please type your choice."
//     );
//   }
// }
// /**
//  * Send bedroom options
//  */
// async function sendBedroomOptions(phoneNumberId, from) {
//   console.log(`📤 Sending bedroom options to ${from}`);
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const payload = {
//       messaging_product: 'whatsapp',
//       recipient_type: 'individual',
//       to: from,
//       type: 'interactive',
//       interactive: {
//         type: 'button',
//         body: {
//           text: 'How many bedrooms are you looking for?'
//         },
//         action: {
//           buttons: [
//             {
//               type: 'reply',
//               reply: {
//                 id: '1-2_bedrooms',
//                 title: '1-2 Bedrooms'
//               }
//             },
//             {
//               type: 'reply',
//               reply: {
//                 id: '3-4_bedrooms',
//                 title: '3-4 Bedrooms'
//               }
//             },
//             {
//               type: 'reply',
//               reply: {
//                 id: '5+_bedrooms',
//                 title: '5+ Bedrooms'
//               }
//             }
//           ]
//         }
//       }
//     };
//     console.log(`📤 Bedroom options payload: ${JSON.stringify(payload, null, 2)}`);
    
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify(payload)
//     });
    
//     const data = await response.json();
//     console.log(`📥 Bedroom options API response: ${JSON.stringify(data, null, 2)}`);
    
//     if (!response.ok) {
//       console.error('❌ WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('❌ Error in sendBedroomOptions:', error);
//     // Fallback to text message if interactive message fails
//     console.log(`⚠️ Falling back to text message for bedroom options`);
//     await sendTextMessage(phoneNumberId, from, 
//       "How many bedrooms are you looking for?\n\n" +
//       "1. 1-2 Bedrooms\n" +
//       "2. 3-4 Bedrooms\n" +
//       "3. 5+ Bedrooms\n\n" +
//       "Please type your choice."
//     );
//   }
// }
// /**
//  * Send a summary of the user's preferences and next steps
//  */
// async function sendSummary(phoneNumberId, from, userData) {
//   console.log(`📤 Sending summary to ${from}`);
//   console.log(`📊 User data: ${JSON.stringify(userData, null, 2)}`);
  
//   let summaryText = "Here's a summary of what you're looking for:\n\n";
  
//   if (userData.intent === 'buy') {
//     summaryText += `🏠 Interest: Buying a property\n`;
//     summaryText += `📍 Location: ${userData.location}\n`;
//     summaryText += `💰 Budget: ${userData.budget}\n`;
//     summaryText += `🏢 Property Type: ${userData.propertyType || 'Not specified'}\n`;
//     summaryText += `🛏️ Bedrooms: ${userData.bedrooms || 'Not specified'}\n\n`;
//     summaryText += "Based on your preferences, we'll find some great properties for you!";
//   } else if (userData.intent === 'rent') {
//     summaryText += `🏠 Interest: Renting a property\n`;
//     summaryText += `📍 Location: ${userData.location}\n`;
//     summaryText += `💰 Monthly Budget: ${userData.budget}\n`;
//     summaryText += `🏢 Property Type: ${userData.propertyType || 'Not specified'}\n`;
//     summaryText += `🛏️ Bedrooms: ${userData.bedrooms || 'Not specified'}\n\n`;
//     summaryText += "We'll help you find the perfect rental property!";
//   } else if (userData.intent === 'sell') {
//     summaryText += `🏠 Interest: Selling a property\n`;
//     summaryText += `🏢 Property Type: ${userData.propertyType || 'Not specified'}\n`;
//     summaryText += `📍 Location: ${userData.location}\n`;
//     summaryText += `💰 Asking Price: ${userData.askingPrice}\n\n`;
//     summaryText += "We'll help you sell your property at the best price!";
//   }
  
//   await sendTextMessage(phoneNumberId, from, summaryText);
//   await sendFollowUpOptions(phoneNumberId, from);
// }
// /**
//  * Send follow-up options after summary
//  */
// async function sendFollowUpOptions(phoneNumberId, from) {
//   console.log(`📤 Sending follow-up options to ${from}`);
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const payload = {
//       messaging_product: 'whatsapp',
//       recipient_type: 'individual',
//       to: from,
//       type: 'interactive',
//       interactive: {
//         type: 'button',
//         body: {
//           text: 'What would you like to do next?'
//         },
//         action: {
//           buttons: [
//             {
//               type: 'reply',
//               reply: {
//                 id: 'contact_agent',
//                 title: 'Contact Agent'
//               }
//             },
//             {
//               type: 'reply',
//               reply: {
//                 id: 'new_search',
//                 title: 'New Search'
//               }
//             }
//           ]
//         }
//       }
//     };
//     console.log(`📤 Follow-up options payload: ${JSON.stringify(payload, null, 2)}`);
    
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify(payload)
//     });
    
//     const data = await response.json();
//     console.log(`📥 Follow-up options API response: ${JSON.stringify(data, null, 2)}`);
    
//     if (!response.ok) {
//       console.error('❌ WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('❌ Error in sendFollowUpOptions:', error);
//     // Fallback to text message if interactive message fails
//     console.log(`⚠️ Falling back to text message for follow-up options`);
//     await sendTextMessage(phoneNumberId, from, 
//       "What would you like to do next?\n\n" +
//       "1. Contact Agent\n" +
//       "2. Start a New Search\n\n" +
//       "Please type your choice."
//     );
//   }
//  }
//  /**
//  * Function to send a text WhatsApp message
//  */
//  async function sendTextMessage(phoneNumberId, to, message) {
//   console.log(`📤 Sending text message to ${to}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
//   const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  
//   try {
//     const payload = {
//       messaging_product: 'whatsapp',
//       to: to,
//       type: 'text',
//       text: { body: message }
//     };
//     console.log(`📤 Text message payload: ${JSON.stringify(payload, null, 2)}`);
//     console.log(`📤 Using URL: ${url}`);
    
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify(payload)
//     });
    
//     const data = await response.json();
//     console.log(`📥 Text message API response: ${JSON.stringify(data, null, 2)}`);
    
//     if (!response.ok) {
//       console.error('❌ WhatsApp API error:', data);
//       throw new Error(JSON.stringify(data));
//     }
    
//     return data;
//   } catch (error) {
//     console.error('❌ Error in sendTextMessage:', error);
//     throw error;
//   }
//  }
//  app.get('/test-template', async (req, res) => {
//   const to = req.query.to;
  
//   if (!to) {
//     return res.status(400).json({ error: 'Missing "to" parameter' });
//   }
  
//   try {
//     // Use your approved template
//     const result = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         to: to,
//         type: 'template',
//         template: {
//           name: 'hello_world', // Replace with your approved template name
//           language: { code: 'en_US' }
//         }
//       })
//     });
    
//     const data = await result.json();
//     res.json({ success: true, result: data });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

//  // Add an environment check endpoint
//  app.get('/check-env', (req, res) => {
//   const adminPassword = req.query.password;
  
//   if (adminPassword !== (process.env.ADMIN_PASSWORD || 'admin123')) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
  
//   // Only show partial values for security
//   const maskToken = token => token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : 'Not set';
  
//   res.json({
//     WHATSAPP_API_VERSION: WHATSAPP_API_VERSION,
//     WHATSAPP_PHONE_NUMBER_ID: WHATSAPP_PHONE_NUMBER_ID ? 'Set' : 'Not set',
//     WHATSAPP_ACCESS_TOKEN: maskToken(WHATSAPP_ACCESS_TOKEN),
//     VERIFY_TOKEN: VERIFY_TOKEN ? 'Set' : 'Not set',
//     PORT: PORT,
//     active_sessions: userSessions.size
//   });
//  });
//  /**
//  * Periodically clean up expired sessions
//  */
//  setInterval(() => {
//   const now = Date.now();
//   let expiredCount = 0;
  
//   for (const [key, session] of userSessions.entries()) {
//     if (now - session.lastActivity > SESSION_TTL) {
//       userSessions.delete(key);
//       expiredCount++;
//       console.log(`⏰ Session expired for ${key}`);
//     }
//   }
  
//   if (expiredCount > 0) {
//     console.log(`⏰ Cleaned up ${expiredCount} expired sessions. Remaining: ${userSessions.size}`);
//   }
//  }, 5 * 60 * 1000); // Run every 5 minutes
//  // Health check endpoint
//  app.get('/health', (req, res) => {
//   const status = {
//     status: 'ok',
//     timestamp: new Date().toISOString(),
//     service: 'real-estate-chatbot',
//     activeUsers: userSessions.size,
//     uptime: process.uptime()
//   };
  
//   console.log(`💓 Health check: ${JSON.stringify(status)}`);
//   res.status(200).json(status);
//  });
//  // Debug endpoint to view active sessions (password protected)
//  app.get('/debug/sessions', (req, res) => {
//   const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
//   const providedPassword = req.query.password;
  
//   if (providedPassword !== adminPassword) {
//     console.log(`🔒 Unauthorized access attempt to debug sessions`);
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
  
//   const sessions = Array.from(userSessions.entries()).map(([phone, session]) => ({
//     phone,
//     lastActivity: new Date(session.lastActivity).toISOString(),
//     step: session.context.step,
//     data: session.context.userData
//   }));
  
//   console.log(`🔍 Debug sessions accessed, active sessions: ${sessions.length}`);
//   res.json({ sessions });
//  });
//  // Start the server
//  app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
//   console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
//   console.log(`💓 Health check: http://localhost:${PORT}/health`);
//   console.log(`🔍 Debug sessions: http://localhost:${PORT}/debug/sessions?password=admin123`);
//   console.log(`🧪 Test message: http://localhost:${PORT}/test-message?to=PHONE_NUMBER`);
//   console.log(`🔧 Environment check: http://localhost:${PORT}/check-env?password=admin123`);
//  });



/**
 * Express Server with WhatsApp Messaging Manager
 * 
 * This sample application demonstrates how to integrate the WhatsApp Messaging Manager
 * into an Express.js server to handle WhatsApp Business API communication
 * with support for 24-hour messaging window tracking and template fallbacks.
 */

import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import WhatsAppMessaging from './whatsapp-messaging-manager.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3100;

// Parse JSON request body
app.use(bodyParser.json());

// Initialize WhatsApp messaging manager
const whatsAppManager = new WhatsAppMessaging();

// Load saved engagement data on startup, if available
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dataFile = path.join(__dirname, 'engagement-data.json');
  
  if (fs.existsSync(dataFile)) {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    whatsAppManager.loadEngagementData(data);
    console.log('📂 Loaded saved engagement data');
  }
} catch (error) {
  console.error('⚠️ Error loading engagement data:', error);
}

// Save engagement data periodically
setInterval(() => {
  try {
    const data = whatsAppManager.saveEngagementData();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dataFile = path.join(__dirname, 'engagement-data.json');
    
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    console.log('💾 Saved engagement data to file');
  } catch (error) {
    console.error('⚠️ Error saving engagement data:', error);
  }
}, 15 * 60 * 1000); // Save every 15 minutes

// GET route for webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('🔍 Webhook verification request');
  
  if (mode && token) {
    // Check if tokens match
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
    console.log('❌ Verification failed - token mismatch');
    return res.sendStatus(403);
  }
  
  console.log('⚠️ Invalid verification request');
  return res.status(400).send('Please pass the correct parameters');
});

// POST route for webhook events (receiving messages)
app.post('/webhook', (req, res) => {
  // Return 200 OK immediately to acknowledge receipt
  res.status(200).send('EVENT_RECEIVED');
  
  const body = req.body;
  
  console.log('📩 Webhook received:', JSON.stringify(body, null, 2));
  
  try {
    // Check if this is a WhatsApp API event
    if (body.object === 'whatsapp_business_account') {
      if (body.entry && 
          body.entry[0].changes && 
          body.entry[0].changes[0] && 
          body.entry[0].changes[0].value) {
        
        const value = body.entry[0].changes[0].value;
        
        // Handle incoming messages
        if (value.messages && value.messages[0]) {
          const message = value.messages[0];
          const phoneNumberId = value.metadata.phone_number_id;
          const from = message.from;
          let messageContent = '';
          let messageType = message.type;
          
          // Extract message content based on type
          if (messageType === 'text') {
            messageContent = message.text.body;
          } else if (messageType === 'interactive') {
            // Handle interactive messages (button clicks, list selections)
            const interactiveType = message.interactive.type;
            
            if (interactiveType === 'button_reply') {
              messageContent = message.interactive.button_reply.id;
              console.log(`🔘 Button clicked: ${messageContent}`);
            } else if (interactiveType === 'list_reply') {
              messageContent = message.interactive.list_reply.id;
              console.log(`📋 List item selected: ${messageContent}`);
            }
          } else {
            // Handle other message types
            messageContent = `[${messageType} message]`;
          }
          
          console.log(`📨 Message from ${from}: ${messageContent}`);
          
          // Record this engagement - extends the 24-hour window
          whatsAppManager.processIncomingMessage(from, messageContent, {
            lastMessageType: messageType
          });
          
          // Process the message through your conversational flow
          processMessage(phoneNumberId, from, messageContent, messageType);
        }
        // Handle message status updates
        else if (value.statuses && value.statuses[0]) {
          const status = value.statuses[0].status;
          const messageId = value.statuses[0].id;
          
          console.log(`📊 Message status update: ${messageId} is now ${status}`);
          
          // Handle specific statuses (delivered, read, failed)
          if (status === 'failed') {
            console.error(`❌ Message ${messageId} failed to deliver`);
            
            if (value.statuses[0].errors) {
              console.error('Error details:', value.statuses[0].errors);
              // Handle specific error codes here if needed
            }
          }
        }
      } else {
        console.log('⚠️ Received webhook with incomplete structure');
      }
    } else {
      console.log(`⚠️ Webhook received with object type: ${body.object || 'undefined'}`);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
  }
});

/**
 * Process incoming messages and manage conversation flow
 */
async function processMessage(phoneNumberId, from, message, messageType) {
  try {
    // Get user context to determine conversation state
    const userContext = whatsAppManager.getUserContext(from) || {};
    const conversationStep = userContext.step || 'initial';
    const lowerMessage = message.toLowerCase().trim();
    
    console.log(`🔄 Processing message for ${from}, step: ${conversationStep}`);
    
    // Handle special commands
    if (['restart', 'reset', 'start', 'menu'].includes(lowerMessage)) {
      whatsAppManager.updateUserContext(from, { step: 'welcome' });
      await sendWelcomeMenu(from);
      return;
    }
    
    // Process based on current conversation step
    switch (conversationStep) {
      case 'initial':
        // First-time user or reset user
        whatsAppManager.updateUserContext(from, { step: 'welcome' });
        await sendWelcomeMenu(from);
        break;
        
      case 'welcome':
        // User has selected an option from the welcome menu
        if (lowerMessage.includes('buy') || lowerMessage === 'buy_property') {
          whatsAppManager.updateUserContext(from, { 
            step: 'buy_location',
            intent: 'buy'
          });
          await whatsAppManager.smartSend(from, 
            "Great! What area or neighborhood are you interested in buying a property?"
          );
        } else if (lowerMessage.includes('rent') || lowerMessage === 'rent_property') {
          whatsAppManager.updateUserContext(from, { 
            step: 'rent_location',
            intent: 'rent'
          });
          await whatsAppManager.smartSend(from, 
            "What area or neighborhood are you looking to rent in?"
          );
        } else if (lowerMessage.includes('sell') || lowerMessage === 'sell_property') {
          whatsAppManager.updateUserContext(from, { 
            step: 'sell_property_type',
            intent: 'sell'
          });
          await sendPropertyTypeOptions(from, 'sell');
        } else {
          // Unrecognized option, re-send menu
          await whatsAppManager.smartSend(from, "I didn't quite understand that. Please select an option:");
          await sendWelcomeMenu(from);
        }
        break;
        
      case 'buy_location':
        whatsAppManager.updateUserContext(from, { 
          step: 'buy_budget',
          location: message
        });
        await whatsAppManager.smartSend(from, 
          `Great, ${message} is a nice area. What's your budget range? (e.g., $200,000-$300,000)`
        );
        break;
        
      case 'buy_budget':
        whatsAppManager.updateUserContext(from, { 
          step: 'buy_property_type',
          budget: message
        });
        await sendPropertyTypeOptions(from, 'buy');
        break;
      
      // Add more case handlers for each step in your conversation flow
      // ...
        
      default:
        // If we don't recognize the state, reset to welcome
        whatsAppManager.updateUserContext(from, { step: 'welcome' });
        await whatsAppManager.smartSend(from, 
          "I seem to have lost track of our conversation. Let's start again."
        );
        await sendWelcomeMenu(from);
        break;
    }
    
    // Check if 24-hour window is about to expire and notify user if needed
    await whatsAppManager.checkAndNotifyWindowExpiry(from);
    
  } catch (error) {
    console.error('❌ Error in processMessage:', error);
    
    try {
      // Try to send an error notification
      await whatsAppManager.smartSend(from, 
        "I'm sorry, but I encountered an error processing your request. Please try again in a moment."
      );
    } catch (secondaryError) {
      console.error('❌ Failed to send error notification:', secondaryError);
    }
  }
}

/**
 * Send the welcome menu to a user
 */
async function sendWelcomeMenu(to) {
  try {
    // Check if user is in 24-hour window
    if (whatsAppManager.engagementTracker.isInMessagingWindow(to)) {
      // User is in window, we can send interactive message
      return await whatsAppManager.sendInteractiveMessage(to, {
        type: 'button',
        body: {
          text: 'Welcome to Real Estate Assistant! How can I help you today?'
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'buy_property',
                title: 'Buy Property'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'sell_property',
                title: 'Sell Property'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'rent_property',
                title: 'Rent Property'
              }
            }
          ]
        }
      });
    } else {
      // User is outside window, must use template
      return await whatsAppManager.sendTemplateMessage(to, 'welcome');
    }
  } catch (error) {
    console.error('❌ Error sending welcome menu:', error);
    
    // Fallback to simple text message using smartSend
    return await whatsAppManager.smartSend(to, 
      "Welcome to Real Estate Assistant! How can I help you today?\n\n" +
      "1. Buy Property\n" +
      "2. Sell Property\n" +
      "3. Rent Property\n\n" +
      "Please type your choice."
    );
  }
}

/**
 * Send property type options
 */
async function sendPropertyTypeOptions(to, action) {
  try {
    // Check if user is in 24-hour window
    if (whatsAppManager.engagementTracker.isInMessagingWindow(to)) {
      const actionText = action === 'sell' ? 'selling' : `${action}ing`;
      
      // User is in window, send interactive list message
      return await whatsAppManager.sendInteractiveMessage(to, {
        type: 'list',
        body: {
          text: `What type of property are you interested in ${actionText}?`
        },
        action: {
          button: "Property Types",
          sections: [
            {
              title: "Property Types",
              rows: [
                {
                  id: `${action}_house`,
                  title: "House",
                  description: "Single-family home"
                },
                {
                  id: `${action}_apartment`,
                  title: "Apartment",
                  description: "Apartment or flat"
                },
                {
                  id: `${action}_condo`,
                  title: "Condo",
                  description: "Condominium"
                },
                {
                  id: `${action}_townhouse`,
                  title: "Townhouse",
                  description: "Townhouse or rowhouse"
                },
                {
                  id: `${action}_land`,
                  title: "Land",
                  description: "Vacant land or lot"
                }
              ]
            }
          ]
        }
      });
    } else {
      // User is outside window, must use template
      return await whatsAppManager.sendTemplateMessage(to, 'property_inquiry');
    }
  } catch (error) {
    console.error(`❌ Error sending property type options:`, error);
    // Fallback to simple text message
    const actionText = action === 'sell' ? 'selling' : `${action}ing`;
    
    return await whatsAppManager.smartSend(to, 
      `What type of property are you interested in ${actionText}?\n\n` +
      "- House (Single-family home)\n" +
      "- Apartment (Apartment or flat)\n" +
      "- Condo (Condominium)\n" +
      "- Townhouse (Townhouse or rowhouse)\n" +
      "- Land (Vacant land or lot)\n\n" +
      "Please type your choice."
    );
  }
}

// Add test endpoints for the API
app.get('/test-message', async (req, res) => {
  const to = req.query.to;
  const message = req.query.message || "This is a test message from your Real Estate Assistant!";
  
  if (!to) {
    return res.status(400).json({ error: 'Missing "to" parameter' });
  }
  
  try {
    console.log(`🧪 Test message endpoint called for ${to}`);
    const result = await whatsAppManager.sendTextMessage(to, message);
    console.log(`✅ Test message sent successfully to ${to}`);
    res.json({ success: true, result });
  } catch (error) {
    console.error('❌ Test message error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/test-template', async (req, res) => {
  const to = req.query.to;
  const templateName = req.query.template || "welcome";
  
  if (!to) {
    return res.status(400).json({ error: 'Missing "to" parameter' });
  }
  
  try {
    console.log(`🧪 Test template endpoint called for ${to} using template: ${templateName}`);
    const result = await whatsAppManager.sendTemplateMessage(to, templateName);
    console.log(`✅ Template message sent successfully to ${to}`);
    res.json({ success: true, result });
  } catch (error) {
    console.error('❌ Test template error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/test-smart-send', async (req, res) => {
  const to = req.query.to;
  const message = req.query.message || "This is a test message that will be sent as a regular message if within the 24-hour window, or as a template if outside.";
  
  if (!to) {
    return res.status(400).json({ error: 'Missing "to" parameter' });
  }
  
  try {
    console.log(`🧪 Smart send test endpoint called for ${to}`);
    const result = await whatsAppManager.smartSend(to, message);
    const isInWindow = whatsAppManager.engagementTracker.isInMessagingWindow(to);
    console.log(`✅ Smart send successful to ${to} (in 24h window: ${isInWindow})`);
    res.json({ success: true, in_messaging_window: isInWindow, result });
  } catch (error) {
    console.error('❌ Smart send test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const activeUsers = Object.keys(whatsAppManager.engagementTracker.exportData()).length;
  const usersInWindow = Object.entries(whatsAppManager.engagementTracker.exportData())
    .filter(([_, data]) => {
      const timeSinceLastMessage = Date.now() - data.lastMessageTime;
      return timeSinceLastMessage < (24 * 60 * 60 * 1000);
    }).length;
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'whatsapp-messaging-manager',
    active_users: activeUsers,
    users_in_24h_window: usersInWindow,
    uptime: process.uptime()
  });
});

// Debug endpoint to view messaging status
app.get('/debug/users', (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const providedPassword = req.query.password;
  
  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userData = whatsAppManager.engagementTracker.exportData();
  const enhancedData = Object.entries(userData).map(([phone, data]) => {
    const timeSinceLastMessage = Date.now() - data.lastMessageTime;
    const isInWindow = timeSinceLastMessage < (24 * 60 * 60 * 1000);
    const timeRemaining = isInWindow ? 
      Math.floor((24 * 60 * 60 * 1000 - timeSinceLastMessage) / (60 * 1000)) + ' minutes' : 
      'Window expired';
    
    return {
      phone,
      last_activity: new Date(data.lastMessageTime).toISOString(),
      in_messaging_window: isInWindow,
      time_remaining: timeRemaining,
      context: data.conversationContext
    };
  });
  
  res.json({ users: enhancedData });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🧪 Test message: http://localhost:${PORT}/test-message?to=PHONE_NUMBER`);
  console.log(`🧪 Test template: http://localhost:${PORT}/test-template?to=PHONE_NUMBER`);
  console.log(`🧪 Test smart send: http://localhost:${PORT}/test-smart-send?to=PHONE_NUMBER`);
  console.log(`💓 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Debug users: http://localhost:${PORT}/debug/users?password=admin123`);
});

/**
 * Send bedroom options to the user
 */
async function sendBedroomOptions(to) {
  try {
    // Check if user is in 24-hour window
    if (whatsAppManager.engagementTracker.isInMessagingWindow(to)) {
      // User is in window, send interactive button message
      return await whatsAppManager.sendInteractiveMessage(to, {
        type: 'button',
        body: {
          text: 'How many bedrooms are you looking for?'
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: '1-2_bedrooms',
                title: '1-2 Bedrooms'
              }
            },
            {
              type: 'reply',
              reply: {
                id: '3-4_bedrooms',
                title: '3-4 Bedrooms'
              }
            },
            {
              type: 'reply',
              reply: {
                id: '5+_bedrooms',
                title: '5+ Bedrooms'
              }
            }
          ]
        }
      });
    } else {
      // User is outside window, use template with fallback
      return await whatsAppManager.smartSend(to, 
        "How many bedrooms are you looking for? Please reply with 1-2, 3-4, or 5+ bedrooms."
      );
    }
  } catch (error) {
    console.error('❌ Error sending bedroom options:', error);
    
    // Fallback to simple text message
    return await whatsAppManager.smartSend(to, 
      "How many bedrooms are you looking for?\n\n" +
      "1. 1-2 Bedrooms\n" +
      "2. 3-4 Bedrooms\n" +
      "3. 5+ Bedrooms\n\n" +
      "Please type your choice."
    );
  }
}

/**
 * Send a property listing to a user
 */
async function sendPropertyListing(to, property) {
  try {
    return await whatsAppManager.sendPropertyListing(to, property);
  } catch (error) {
    console.error('❌ Error sending property listing:', error);
    
    // Fallback to simple text message
    return await whatsAppManager.smartSend(to, 
      `🏠 Property Listing: ${property.type} in ${property.location}\n` +
      `💰 Price: ${property.price}\n` +
      `🛏️ Bedrooms: ${property.bedrooms}\n\n` +
      `Reply for more information.`
    );
  }
}

/**
 * Send a summary of user preferences and next steps
 */
async function sendSummary(to, userData) {
  try {
    let summaryText = "Here's a summary of what you're looking for:\n\n";
    
    if (userData.intent === 'buy') {
      summaryText += `🏠 Interest: Buying a property\n`;
      summaryText += `📍 Location: ${userData.location}\n`;
      summaryText += `💰 Budget: ${userData.budget}\n`;
      summaryText += `🏢 Property Type: ${userData.propertyType || 'Not specified'}\n`;
      summaryText += `🛏️ Bedrooms: ${userData.bedrooms || 'Not specified'}\n\n`;
      summaryText += "Based on your preferences, we'll find some great properties for you!";
    } else if (userData.intent === 'rent') {
      summaryText += `🏠 Interest: Renting a property\n`;
      summaryText += `📍 Location: ${userData.location}\n`;
      summaryText += `💰 Monthly Budget: ${userData.budget}\n`;
      summaryText += `🏢 Property Type: ${userData.propertyType || 'Not specified'}\n`;
      summaryText += `🛏️ Bedrooms: ${userData.bedrooms || 'Not specified'}\n\n`;
      summaryText += "We'll help you find the perfect rental property!";
    } else if (userData.intent === 'sell') {
      summaryText += `🏠 Interest: Selling a property\n`;
      summaryText += `🏢 Property Type: ${userData.propertyType || 'Not specified'}\n`;
      summaryText += `📍 Location: ${userData.location}\n`;
      summaryText += `💰 Asking Price: ${userData.askingPrice}\n\n`;
      summaryText += "We'll help you sell your property at the best price!";
    }
    
    await whatsAppManager.smartSend(to, summaryText);
    await sendFollowUpOptions(to);
  } catch (error) {
    console.error('❌ Error sending summary:', error);
    
    // Fallback to simple notification
    await whatsAppManager.smartSend(to, 
      "Thanks for providing your preferences. We'll work on finding the right options for you."
    );
  }
}

/**
 * Send follow-up options after summary
 */
async function sendFollowUpOptions(to) {
  try {
    // Check if user is in 24-hour window
    if (whatsAppManager.engagementTracker.isInMessagingWindow(to)) {
      // User is in window, send interactive button message
      return await whatsAppManager.sendInteractiveMessage(to, {
        type: 'button',
        body: {
          text: 'What would you like to do next?'
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'contact_agent',
                title: 'Contact Agent'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'new_search',
                title: 'New Search'
              }
            }
          ]
        }
      });
    } else {
      // User is outside window, use template with fallback
      return await whatsAppManager.smartSend(to, 
        "What would you like to do next? Reply with 'agent' to contact an agent or 'new' to start a new search."
      );
    }
  } catch (error) {
    console.error('❌ Error sending follow-up options:', error);
    
    // Fallback to simple text message
    return await whatsAppManager.smartSend(to, 
      "What would you like to do next?\n\n" +
      "1. Contact Agent\n" +
      "2. Start a New Search\n\n" +
      "Please type your choice."
    );
  }
}