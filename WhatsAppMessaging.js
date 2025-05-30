// /**
//  * WhatsApp Messaging Manager
//  * 
//  * This module handles the WhatsApp Business API messaging rules:
//  * - Tracks user engagement to manage the 24-hour messaging window
//  * - Automatically falls back to templates when the window expires
//  * - Supports multiple templates for different conversation scenarios
//  */

// import fetch from 'node-fetch';
// import dotenv from 'dotenv';

// // For production, use a real database instead of in-memory storage
// // e.g., MongoDB, Redis, or even a simple JSON file for persistence
// class UserEngagementTracker {
//   constructor() {
//     // In-memory storage for user engagement data
//     // Format: { phoneNumber: { lastMessageTime: timestamp, conversationContext: {} } }
//     this.userEngagement = new Map();
    
//     // 24-hour window in milliseconds
//     this.MESSAGING_WINDOW = 24 * 60 * 60 * 1000;
    
//     // Auto-cleanup interval (every hour)
//     setInterval(() => this.cleanupOldEntries(), 60 * 60 * 1000);
//   }
  
//   /**
//    * Record user engagement when a message is received
//    */
//   recordUserEngagement(phoneNumber, context = {}) {
//     const existingData = this.userEngagement.get(phoneNumber) || { conversationContext: {} };
    
//     this.userEngagement.set(phoneNumber, {
//       lastMessageTime: Date.now(),
//       conversationContext: {
//         ...existingData.conversationContext,
//         ...context
//       }
//     });
    
//     console.log(`📝 Recorded engagement for ${phoneNumber}`);
//     return true;
//   }
  
//   /**
//    * Check if a user is within the 24-hour messaging window
//    */
//   isInMessagingWindow(phoneNumber) {
//     const userData = this.userEngagement.get(phoneNumber);
    
//     if (!userData) {
//       console.log(`ℹ️ No previous engagement for ${phoneNumber}`);
//       return false;
//     }
    
//     const timeSinceLastMessage = Date.now() - userData.lastMessageTime;
//     const isInWindow = timeSinceLastMessage < this.MESSAGING_WINDOW;
    
//     console.log(`ℹ️ User ${phoneNumber} time since last message: ${Math.round(timeSinceLastMessage / (60 * 1000))} minutes, in window: ${isInWindow}`);
    
//     return isInWindow;
//   }
  
//   /**
//    * Get time remaining in the messaging window (in milliseconds)
//    */
//   getTimeRemainingInWindow(phoneNumber) {
//     const userData = this.userEngagement.get(phoneNumber);
    
//     if (!userData) {
//       return 0;
//     }
    
//     const timeSinceLastMessage = Date.now() - userData.lastMessageTime;
//     const timeRemaining = Math.max(0, this.MESSAGING_WINDOW - timeSinceLastMessage);
    
//     return timeRemaining;
//   }
  
//   /**
//    * Get user conversation context
//    */
//   getUserContext(phoneNumber) {
//     const userData = this.userEngagement.get(phoneNumber);
    
//     if (!userData) {
//       return {};
//     }
    
//     return userData.conversationContext;
//   }
  
//   /**
//    * Update user conversation context
//    */
//   updateUserContext(phoneNumber, context) {
//     const userData = this.userEngagement.get(phoneNumber) || 
//                      { lastMessageTime: Date.now(), conversationContext: {} };
    
//     this.userEngagement.set(phoneNumber, {
//       ...userData,
//       conversationContext: {
//         ...userData.conversationContext,
//         ...context
//       }
//     });
    
//     return true;
//   }
  
//   /**
//    * Remove entries older than 30 days to prevent memory leaks
//    */
//   cleanupOldEntries() {
//     const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
//     let cleanupCount = 0;
//     for (const [phoneNumber, data] of this.userEngagement.entries()) {
//       if (data.lastMessageTime < thirtyDaysAgo) {
//         this.userEngagement.delete(phoneNumber);
//         cleanupCount++;
//       }
//     }
    
//     if (cleanupCount > 0) {
//       console.log(`🧹 Cleaned up ${cleanupCount} old engagement records`);
//     }
//   }
  
//   /**
//    * Export data for persistence (e.g., save to database)
//    */
//   exportData() {
//     return Array.from(this.userEngagement.entries()).reduce((acc, [phoneNumber, data]) => {
//       acc[phoneNumber] = data;
//       return acc;
//     }, {});
//   }
  
//   /**
//    * Import data from persistence
//    */
//   importData(data) {
//     if (!data) return;
    
//     Object.entries(data).forEach(([phoneNumber, userData]) => {
//       this.userEngagement.set(phoneNumber, userData);
//     });
    
//     console.log(`📥 Imported engagement data for ${this.userEngagement.size} users`);
//   }
// }

// class WhatsAppMessaging {
//   constructor() {
//     dotenv.config();
    
//     // WhatsApp API Configuration
//     this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
//     this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
//     this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
//     // Initialize user engagement tracker
//     this.engagementTracker = new UserEngagementTracker();
    
//     // Define templates
//     this.templates = {
//       welcome: {
//         name: 'welcome_template',
//         language: { code: 'en_US' }
//       },
//       property_inquiry: {
//         name: 'property_inquiry',
//         language: { code: 'en_US' }
//       },
//       re_engagement: {
//         name: 're_engagement',
//         language: { code: 'en_US' },
//         components: [
//           {
//             type: 'body',
//             parameters: [
//               {
//                 type: 'text',
//                 text: '{{1}}' // Will be replaced with a personalized message
//               }
//             ]
//           }
//         ]
//       },
//       property_update: {
//         name: 'property_update',
//         language: { code: 'en_US' },
//         components: [
//           {
//             type: 'body',
//             parameters: [
//               {
//                 type: 'text',
//                 text: '{{1}}' // Property type
//               },
//               {
//                 type: 'text',
//                 text: '{{2}}' // Location
//               },
//               {
//                 type: 'text',
//                 text: '{{3}}' // Price
//               }
//             ]
//           }
//         ]
//       }
//     };
//   }
  
//   /**
//    * Process incoming message and record user engagement
//    */
//   processIncomingMessage(from, message, context = {}) {
//     // Record this engagement to reset the 24-hour window
//     this.engagementTracker.recordUserEngagement(from, context);
    
//     console.log(`📩 Processed incoming message from ${from}: ${message}`);
//     return true;
//   }
  
//   /**
//    * Smart send - automatically chooses between template and regular message
//    */
//   async smartSend(to, regularMessage, templateDetails = null) {
//     const isInWindow = this.engagementTracker.isInMessagingWindow(to);
    
//     if (isInWindow) {
//       // User is within 24-hour window, we can send regular messages
//       return await this.sendTextMessage(to, regularMessage);
//     } else {
//       // User is outside 24-hour window, we must use templates
//       if (!templateDetails) {
//         // Default to re-engagement template if none specified
//         templateDetails = {
//           templateName: 're_engagement',
//           components: [
//             {
//               type: 'body',
//               parameters: [
//                 {
//                   type: 'text',
//                   text: regularMessage.substring(0, 100) // Trim to avoid template parameter limits
//                 }
//               ]
//             }
//           ]
//         };
//       }
      
//       return await this.sendTemplateMessage(to, templateDetails.templateName, templateDetails.components);
//     }
//   }
  
//   /**
//    * Send a regular text message (only works within 24-hour window)
//    */
//   async sendTextMessage(to, message) {
//     const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${this.accessToken}`
//         },
//         body: JSON.stringify({
//           messaging_product: 'whatsapp',
//           recipient_type: 'individual',
//           to: to,
//           type: 'text',
//           text: { body: message }
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         console.error('❌ WhatsApp API error:', data);
        
//         // Check if this is a 24-hour window violation
//         if (data.error && (
//             data.error.message.includes('24 hour') || 
//             data.error.code === 131047)) {
//           console.log('⚠️ 24-hour window expired, falling back to template');
//           // Try to fall back to a template
//           return await this.sendTemplateMessage(to, 're_engagement', [
//             {
//               type: 'body',
//               parameters: [
//                 {
//                   type: 'text',
//                   text: message.substring(0, 100)
//                 }
//               ]
//             }
//           ]);
//         }
        
//         throw new Error(JSON.stringify(data));
//       }
      
//       console.log(`✅ Text message sent to ${to}`);
//       return data;
//     } catch (error) {
//       console.error('❌ Error in sendTextMessage:', error);
//       throw error;
//     }
//   }
  
//   /**
//    * Send a template message (works anytime, but must be pre-approved)
//    */
//   async sendTemplateMessage(to, templateName, components = null) {
//     const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    
//     // Get template configuration from our predefined templates
//     const templateConfig = this.templates[templateName] || {
//       name: templateName,
//       language: { code: 'en_US' }
//     };
    
//     // If components were provided, add them to the template config
//     if (components) {
//       templateConfig.components = components;
//     }
    
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${this.accessToken}`
//         },
//         body: JSON.stringify({
//           messaging_product: 'whatsapp',
//           recipient_type: 'individual',
//           to: to,
//           type: 'template',
//           template: templateConfig
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         console.error('❌ WhatsApp API template error:', data);
//         throw new Error(JSON.stringify(data));
//       }
      
//       console.log(`✅ Template message '${templateName}' sent to ${to}`);
//       return data;
//     } catch (error) {
//       console.error(`❌ Error sending template '${templateName}':`, error);
//       throw error;
//     }
//   }
  
//   /**
//    * Send a property listing using a template or regular message depending on window
//    */
//   async sendPropertyListing(to, propertyDetails) {
//     const { type, location, price, bedrooms, description } = propertyDetails;
    
//     // Create a regular message version
//     const regularMessage = `🏠 *New ${type} in ${location}*\n\n` +
//                            `💰 Price: ${price}\n` +
//                            `🛏️ Bedrooms: ${bedrooms}\n\n` +
//                            `📝 ${description}\n\n` +
//                            `Interested? Reply with "more info" to learn more!`;
    
//     // Create a template version (for outside 24-hour window)
//     const templateDetails = {
//       templateName: 'property_update',
//       components: [
//         {
//           type: 'body',
//           parameters: [
//             { type: 'text', text: type },
//             { type: 'text', text: location },
//             { type: 'text', text: price }
//           ]
//         }
//       ]
//     };
    
//     // Send using the appropriate method based on window
//     return await this.smartSend(to, regularMessage, templateDetails);
//   }
  
//   /**
//    * Send an interactive message (only works within 24-hour window)
//    */
//   async sendInteractiveMessage(to, interactiveContent) {
//     // Check if user is within 24-hour window
//     if (!this.engagementTracker.isInMessagingWindow(to)) {
//       console.log(`⚠️ User ${to} outside 24-hour window, falling back to template`);
//       return await this.sendTemplateMessage(to, 're_engagement', [
//         {
//           type: 'body',
//           parameters: [
//             {
//               type: 'text',
//               text: 'Please reply to this message to continue our conversation.'
//             }
//           ]
//         }
//       ]);
//     }
    
//     const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${this.accessToken}`
//         },
//         body: JSON.stringify({
//           messaging_product: 'whatsapp',
//           recipient_type: 'individual',
//           to: to,
//           type: 'interactive',
//           interactive: interactiveContent
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         console.error('❌ WhatsApp API error:', data);
//         throw new Error(JSON.stringify(data));
//       }
      
//       console.log(`✅ Interactive message sent to ${to}`);
//       return data;
//     } catch (error) {
//       console.error('❌ Error in sendInteractiveMessage:', error);
//       throw error;
//     }
//   }
  
//   /**
//    * Check time remaining and notify if window is about to expire
//    */
//   async checkAndNotifyWindowExpiry(to) {
//     const timeRemaining = this.engagementTracker.getTimeRemainingInWindow(to);
//     const hoursRemaining = timeRemaining / (60 * 60 * 1000);
    
//     // If less than 1 hour remaining and more than 30 minutes
//     if (hoursRemaining < 1 && hoursRemaining > 0.5) {
//       await this.sendTextMessage(to, 
//         "Just a heads up - to keep our conversation going, please respond within the next hour. " +
//         "Otherwise, we'll need to switch to using template messages."
//       );
//       return true;
//     }
    
//     return false;
//   }
  
//   /**
//    * Get user context data
//    */
//   getUserContext(phoneNumber) {
//     return this.engagementTracker.getUserContext(phoneNumber);
//   }
  
//   /**
//    * Update user context data
//    */
//   updateUserContext(phoneNumber, context) {
//     return this.engagementTracker.updateUserContext(phoneNumber, context);
//   }
  
//   /**
//    * Save engagement data for persistence
//    */
//   saveEngagementData() {
//     const data = this.engagementTracker.exportData();
//     // In a real implementation, you would save this to a database
//     // For example:
//     // await database.collection('userEngagement').updateOne(
//     //   { id: 'main' },
//     //   { $set: { data } },
//     //   { upsert: true }
//     // );
//     console.log(`💾 Saved engagement data for ${Object.keys(data).length} users`);
//     return data;
//   }
  
//   /**
//    * Load engagement data from persistence
//    */
//   loadEngagementData(data) {
//     this.engagementTracker.importData(data);
//   }
// }

// // Export for use in the main application
// export default WhatsAppMessaging;