// models/ChatbotSettings.js
const mongoose = require('mongoose');

const quickReplySchema = new mongoose.Schema({
  id: Number,
  keyword: String,
  reply: String,
  enabled: { type: Boolean, default: true }
});

const flowNodeSchema = new mongoose.Schema({
  id: String,
  type: String,
  message: String,
  buttons: [{
    id: String,
    text: String,
    next: String
  }],
  next: String
});

const flowSchema = new mongoose.Schema({
  id: Number,
  name: String,
  trigger: String,
  nodes: [flowNodeSchema],
  enabled: { type: Boolean, default: true }
});

const chatbotSettingsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  quickReplies: [quickReplySchema],
  flows: [flowSchema],
  welcomeMessage: {
    enabled: { type: Boolean, default: false },
    message: String,
    delay: { type: Number, default: 1000 }
  },
  awayMessage: {
    enabled: { type: Boolean, default: false },
    message: String,
    startTime: String,
    endTime: String
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
chatbotSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      enabled: false,
      quickReplies: [],
      flows: [],
      welcomeMessage: {
        enabled: false,
        message: 'Welcome! How can I help you today?',
        delay: 1000
      },
      awayMessage: {
        enabled: false,
        message: "We're currently away but will respond as soon as possible.",
        startTime: '18:00',
        endTime: '09:00'
      }
    });
  }
  return settings;
};

module.exports = mongoose.model('ChatbotSettings', chatbotSettingsSchema);