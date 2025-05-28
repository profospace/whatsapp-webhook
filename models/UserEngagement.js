// models/UserEngagement.js
import mongoose from 'mongoose';

const userEngagementSchema = new mongoose.Schema({
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  lastMessageTime: { 
    type: Date, 
    default: Date.now 
  },
  messageCount: { 
    type: Number, 
    default: 0 
  },
  conversationContext: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

userEngagementSchema.methods.checkIfInWindow = function() {
  const timeSinceLastMessage = Date.now() - this.lastMessageTime.getTime();
  return timeSinceLastMessage < (24 * 60 * 60 * 1000); // 24 hours in milliseconds
};


export default mongoose.model('UserEngagement', userEngagementSchema);
