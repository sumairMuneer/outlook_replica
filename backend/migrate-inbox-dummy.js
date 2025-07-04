const mongoose = require('mongoose');
const Mail = require('./models/Mail');

async function insertDummyInboxEmails() {
    await mongoose.connect('mongodb://localhost:27017/outlook_replica', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const now = new Date();
    const dummyEmails = Array.from({ length: 10 }).map((_, i) => ({
        subject: `Inbox Dummy Email #${i + 1}`,
        sender: `sender${i + 1}@example.com`,
        to: 'user@example.com',
        cc: '',
        body: `This is the body of dummy inbox email #${i + 1}.`,
        date: new Date(now.getTime() - i * 86400000).toLocaleString(),
        read: false,
        starred: false,
        flagged: false,
        reminder: null,
        pinned: false,
        folder: 'Inbox',
        conversationId: `conv_inbox_${i + 1}`,
        scheduledAt: null,
        attachments: [],
    }));

    await Mail.insertMany(dummyEmails);
    console.log('Inserted 10 dummy inbox emails.');
    await mongoose.disconnect();
}

insertDummyInboxEmails().catch(err => {
    console.error(err);
    process.exit(1);
}); 