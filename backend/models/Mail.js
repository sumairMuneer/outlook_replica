const mongoose = require('mongoose');

const MailSchema = new mongoose.Schema({
    subject: String,
    sender: String,
    to: String,
    cc: String,
    body: String,
    date: String,
    read: Boolean,
    starred: Boolean,
    flagged: Boolean,
    reminder: String,
    pinned: Boolean,
    folder: String,
    conversationId: String,
    scheduledAt: String,
    attachments: [String],
});

module.exports = mongoose.model('Mail', MailSchema); 