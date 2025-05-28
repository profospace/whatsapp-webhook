// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation',
    required: true,
    index: true
  },
  phoneNumber: { 
    type: String, 
    required: true,
    index: true 
  },
  messageId: { 
    type: String, 
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  sender: { 
    type: String, 
    enum: ['user', 'business'], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['text', 'image', 'document', 'audio', 'video', 'location', 'interactive', 'template'],
    default: 'text'
  },
  text: String,
  mediaUrl: String,
  templateName: String,
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  isAutomated: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);