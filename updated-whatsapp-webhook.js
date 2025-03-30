// /**
//  * Simple WhatsApp Webhook
//  * This is a minimal Node.js server that handles WhatsApp webhook events
//  * and responds to incoming messages with a simple reply or template.
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
// const PORT = process.env.PORT || 3000;

// // Parse JSON request body
// app.use(bodyParser.json());

// // WhatsApp API Configuration
// const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v22.0';
// const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '598241500035903';
// const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAIAmB3mH3EBO5zWW5FcNWj4lG5SqOJ5FYM1oU2oUsSGY82kfX0ThZCf4bnd1MLjrtLaLRULaNKMF4r7c88HlJaYwnDHhFVCNJkVjseVoQwLjzFANz5ZBZA4D9I8hSZA3bfR5kMJ2NTyfwyov8neqCYFRqO5oZBLLCP2Q3VvZBkyZAgDXcZAJUZAsZAV4v7cR0FrzFugZDZD';
// const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'simple-whatsapp-webhook';

// // GET route for webhook verification
// app.get('/webhook', (req, res) => {
//   // Parse parameters from the webhook verification request
//   const mode = req.query['hub.mode'];
//   const token = req.query['hub.verify_token'];
//   const challenge = req.query['hub.challenge'];
  
//   // Check if a token and mode were sent
//   if (mode && token) {
//     // Check the mode and token sent match your configuration
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//       // Respond with the challenge token from the request
//       console.log('WEBHOOK_VERIFIED');
//       return res.status(200).send(challenge);
//     }
//     // Respond with 403 Forbidden if verify tokens do not match
//     return res.sendStatus(403);
//   }
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
const PORT = process.env.PORT || 3100;

// Parse JSON request body
app.use(bodyParser.json());

// WhatsApp API Configuration
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ;

// In-memory user session storage
// In a production environment, use a database like MongoDB or Redis
const userSessions = new Map();

// Session TTL in milliseconds (30 minutes)
const SESSION_TTL = 30 * 60 * 1000;

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

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('Webhook GET request received');
  console.log('Mode:', mode);
  console.log('Token:', token);
  console.log('Challenge:', challenge);
  console.log('Expected token:', VERIFY_TOKEN);
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
    console.log('Token verification failed');
    return res.sendStatus(403);
  }
  
  console.log('Missing mode or token');
  return res.status(200).send('WhatsApp Webhook is running.');
});

/**
 * Process incoming messages and manage conversation flow
 */
async function processMessage(phoneNumberId, from, message) {
  // Get or create a session for this user
  let session = userSessions.get(from);
  
  if (!session) {
    session = {
      phoneNumber: from,
      lastActivity: Date.now(),
      context: {
        step: 'initial',
        userData: {}
      }
    };
    userSessions.set(from, session);
  }
  
  // Update last activity time
  session.lastActivity = Date.now();
  
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase().trim();
  
  // Check for greeting or reset conversation
  if (['hi', 'hello', 'hey', 'start', 'restart', 'reset'].includes(lowerMessage) || session.context.step === 'initial') {
    session.context.step = 'welcome';
    await sendMainMenu(phoneNumberId, from);
    return;
  }
  
  // Process based on current conversation step
  switch (session.context.step) {
    case 'welcome':
      if (lowerMessage === 'buy_property' || lowerMessage.includes('buy') || lowerMessage.includes('looking')) {
        session.context.step = 'buy_location';
        session.context.userData.intent = 'buy';
        await sendTextMessage(phoneNumberId, from, "Great! What area or neighborhood are you interested in buying a property?");
      } else if (lowerMessage === 'sell_property' || lowerMessage.includes('sell')) {
        session.context.step = 'sell_property_type';
        session.context.userData.intent = 'sell';
        await sendPropertyTypeOptions(phoneNumberId, from, 'sell');
      } else if (lowerMessage === 'rent_property' || lowerMessage.includes('rent')) {
        session.context.step = 'rent_location';
        session.context.userData.intent = 'rent';
        await sendTextMessage(phoneNumberId, from, "What area or neighborhood are you looking to rent in?");
      } else {
        // If input doesn't match options, re-send the menu
        await sendTextMessage(phoneNumberId, from, "I didn't quite catch that. Please select one of these options:");
        await sendMainMenu(phoneNumberId, from);
      }
      break;
      
    case 'buy_location':
      session.context.userData.location = message;
      session.context.step = 'buy_budget';
      await sendTextMessage(phoneNumberId, from, `Great, ${message} is a nice area. What's your budget range? (e.g., $200,000-$300,000)`);
      break;
      
    case 'buy_budget':
      session.context.userData.budget = message;
      session.context.step = 'buy_property_type';
      await sendPropertyTypeOptions(phoneNumberId, from, 'buy');
      break;
      
    case 'buy_property_type':
      session.context.userData.propertyType = message;
      session.context.step = 'buy_bedrooms';
      await sendBedroomOptions(phoneNumberId, from);
      break;
      
    case 'buy_bedrooms':
      session.context.userData.bedrooms = message;
      session.context.step = 'summary';
      await sendSummary(phoneNumberId, from, session.context.userData);
      break;
      
    case 'rent_location':
      session.context.userData.location = message;
      session.context.step = 'rent_budget';
      await sendTextMessage(phoneNumberId, from, `Great, ${message} is a nice area for rentals. What's your monthly budget? (e.g., $1,500-$2,000)`);
      break;
      
    case 'rent_budget':
      session.context.userData.budget = message;
      session.context.step = 'rent_property_type';
      await sendPropertyTypeOptions(phoneNumberId, from, 'rent');
      break;
    
    case 'rent_property_type':
      session.context.userData.propertyType = message;
      session.context.step = 'rent_bedrooms';
      await sendBedroomOptions(phoneNumberId, from);
      break;
      
    case 'rent_bedrooms':
      session.context.userData.bedrooms = message;
      session.context.step = 'summary';
      await sendSummary(phoneNumberId, from, session.context.userData);
      break;
      
    case 'sell_property_type':
      session.context.userData.propertyType = message;
      session.context.step = 'sell_location';
      await sendTextMessage(phoneNumberId, from, "Where is your property located?");
      break;
      
    case 'sell_location':
      session.context.userData.location = message;
      session.context.step = 'sell_asking_price';
      await sendTextMessage(phoneNumberId, from, "What is your asking price for the property?");
      break;
      
    case 'sell_asking_price':
      session.context.userData.askingPrice = message;
      session.context.step = 'summary';
      await sendSummary(phoneNumberId, from, session.context.userData);
      break;
      
    case 'summary':
      if (lowerMessage === 'new_search' || lowerMessage.includes('new') || lowerMessage.includes('again')) {
        // Reset the conversation
        session.context.step = 'welcome';
        await sendMainMenu(phoneNumberId, from);
      } else if (lowerMessage === 'contact_agent' || lowerMessage.includes('agent') || lowerMessage.includes('contact')) {
        session.context.step = 'contact_info';
        await sendTextMessage(phoneNumberId, from, "Please provide your name and best time to contact you:");
      } else {
        await sendFollowUpOptions(phoneNumberId, from);
      }
      break;
      
    case 'contact_info':
      session.context.userData.contactInfo = message;
      session.context.step = 'completed';
      await sendTextMessage(phoneNumberId, from, 
        "Thank you for providing your information! One of our real estate agents will contact you shortly.\n\n" +
        "Is there anything else you'd like to know in the meantime?");
      // Here you would trigger a notification to your CRM or agent system
      // sendAgentNotification(session.context.userData);
      break;
      
    case 'completed':
      if (lowerMessage === 'new_search' || lowerMessage.includes('new') || lowerMessage.includes('again') || 
          lowerMessage.includes('start') || lowerMessage.includes('restart')) {
        // Reset the conversation
        session.context.step = 'welcome';
        await sendMainMenu(phoneNumberId, from);
      } else {
        await sendTextMessage(phoneNumberId, from, 
          "Our agent will be in touch with you shortly. If you'd like to start a new search, simply type 'new search' or 'start again'.");
      }
      break;
      
    default:
      // If we don't know what step we're on, restart the conversation
      session.context.step = 'welcome';
      await sendMainMenu(phoneNumberId, from);
      break;
  }
  
  // Update the session in the map
  userSessions.set(from, session);
}

/**
 * Send the main menu with options
 */
async function sendMainMenu(phoneNumberId, from) {
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
        recipient_type: 'individual',
        to: from,
        type: 'interactive',
        interactive: {
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
    console.error('Error in sendMainMenu:', error);
    // Fallback to text message if interactive message fails
    await sendTextMessage(phoneNumberId, from, 
      "Welcome to Real Estate Assistant! How can I help you today?\n\n" +
      "1. Buy Property\n" +
      "2. Sell Property\n" +
      "3. Rent Property\n\n" +
      "Please type your choice."
    );
  }
}

/**
 * Send property type selection buttons
 */
async function sendPropertyTypeOptions(phoneNumberId, from, action) {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
  const actionPrefix = action === 'buy' ? 'buy_' : (action === 'rent' ? 'rent_' : 'sell_');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: from,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: `What type of property are you interested in ${action === 'sell' ? 'selling' : action + 'ing'}?`
          },
          action: {
            button: "Property Types",
            sections: [
              {
                title: "Property Types",
                rows: [
                  {
                    id: `${actionPrefix}house`,
                    title: "House",
                    description: "Single-family home"
                  },
                  {
                    id: `${actionPrefix}apartment`,
                    title: "Apartment",
                    description: "Apartment or flat"
                  },
                  {
                    id: `${actionPrefix}condo`,
                    title: "Condo",
                    description: "Condominium"
                  },
                  {
                    id: `${actionPrefix}townhouse`,
                    title: "Townhouse",
                    description: "Townhouse or rowhouse"
                  },
                  {
                    id: `${actionPrefix}land`,
                    title: "Land",
                    description: "Vacant land or lot"
                  }
                ]
              }
            ]
          }
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
    console.error('Error in sendPropertyTypeOptions:', error);
    // Fallback to text message if interactive message fails
    await sendTextMessage(phoneNumberId, from, 
      `What type of property are you interested in ${action === 'sell' ? 'selling' : action + 'ing'}?\n\n` +
      "- House (Single-family home)\n" +
      "- Apartment (Apartment or flat)\n" +
      "- Condo (Condominium)\n" +
      "- Townhouse (Townhouse or rowhouse)\n" +
      "- Land (Vacant land or lot)\n\n" +
      "Please type your choice."
    );
  }
}

/**
 * Send bedroom options
 */
async function sendBedroomOptions(phoneNumberId, from) {
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
        recipient_type: 'individual',
        to: from,
        type: 'interactive',
        interactive: {
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
    console.error('Error in sendBedroomOptions:', error);
    // Fallback to text message if interactive message fails
    await sendTextMessage(phoneNumberId, from, 
      "How many bedrooms are you looking for?\n\n" +
      "1. 1-2 Bedrooms\n" +
      "2. 3-4 Bedrooms\n" +
      "3. 5+ Bedrooms\n\n" +
      "Please type your choice."
    );
  }
}

/**
 * Send a summary of the user's preferences and next steps
 */
async function sendSummary(phoneNumberId, from, userData) {
  let summaryText = "Here's a summary of what you're looking for:\n\n";
  
  if (userData.intent === 'buy') {
    summaryText += `🏠 *Interest*: Buying a property\n`;
    summaryText += `📍 *Location*: ${userData.location}\n`;
    summaryText += `💰 *Budget*: ${userData.budget}\n`;
    summaryText += `🏢 *Property Type*: ${userData.propertyType || 'Not specified'}\n`;
    summaryText += `🛏️ *Bedrooms*: ${userData.bedrooms || 'Not specified'}\n\n`;
    summaryText += "Based on your preferences, we'll find some great properties for you!";
  } else if (userData.intent === 'rent') {
    summaryText += `🏠 *Interest*: Renting a property\n`;
    summaryText += `📍 *Location*: ${userData.location}\n`;
    summaryText += `💰 *Monthly Budget*: ${userData.budget}\n`;
    summaryText += `🏢 *Property Type*: ${userData.propertyType || 'Not specified'}\n`;
    summaryText += `🛏️ *Bedrooms*: ${userData.bedrooms || 'Not specified'}\n\n`;
    summaryText += "We'll help you find the perfect rental property!";
  } else if (userData.intent === 'sell') {
    summaryText += `🏠 *Interest*: Selling a property\n`;
    summaryText += `🏢 *Property Type*: ${userData.propertyType || 'Not specified'}\n`;
    summaryText += `📍 *Location*: ${userData.location}\n`;
    summaryText += `💰 *Asking Price*: ${userData.askingPrice}\n\n`;
    summaryText += "We'll help you sell your property at the best price!";
  }
  
  await sendTextMessage(phoneNumberId, from, summaryText);
  await sendFollowUpOptions(phoneNumberId, from);
}

/**
 * Send follow-up options after summary
 */
async function sendFollowUpOptions(phoneNumberId, from) {
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
        recipient_type: 'individual',
        to: from,
        type: 'interactive',
        interactive: {
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
    console.error('Error in sendFollowUpOptions:', error);
    // Fallback to text message if interactive message fails
    await sendTextMessage(phoneNumberId, from, 
      "What would you like to do next?\n\n" +
      "1. Contact Agent\n" +
      "2. Start a New Search\n\n" +
      "Please type your choice."
    );
  }
}

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
 * Periodically clean up expired sessions
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of userSessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL) {
      userSessions.delete(key);
      console.log(`Session expired for ${key}`);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'real-estate-chatbot',
    activeUsers: userSessions.size
  });
});

// Debug endpoint to view active sessions (password protected)
app.get('/debug/sessions', (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const providedPassword = req.query.password;
  
  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const sessions = Array.from(userSessions.entries()).map(([phone, session]) => ({
    phone,
    lastActivity: new Date(session.lastActivity).toISOString(),
    step: session.context.step,
    data: session.context.userData
  }));
  
  res.json({ sessions });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Debug sessions: http://localhost:${PORT}/debug/sessions?password=admin123`);
});
