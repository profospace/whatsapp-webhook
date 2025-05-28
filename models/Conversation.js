// models/Conversation.js
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  lastMessage: String,
  lastMessageTime: { 
    type: Date, 
    default: Date.now 
  },
  unreadCount: { 
    type: Number, 
    default: 0 
  },
  archived: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

export default mongoose.model('Conversation', conversationSchema);

