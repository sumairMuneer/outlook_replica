const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const Mail = require('./models/Mail');
const Rule = require('./models/Rule');
const cors = require('@fastify/cors');

fastify.register(cors, {
    origin: true, // Allow all origins (for development)
    credentials: true,
});

mongoose.connect('mongodb://localhost:27017/outlook_replica', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

fastify.get('/', async (request, reply) => {
    return { message: 'Hello from Fastify backend!' };
});

// Save a composed email as a draft
fastify.post('/mails/draft', async (request, reply) => {
    const data = request.body;
    const mail = new Mail({
        ...data,
        date: new Date().toLocaleString(),
        sender: 'You',
        read: false,
        starred: false,
        flagged: false,
        pinned: false,
        folder: 'Drafts',
        attachments: data.attachments || [],
        cc: data.cc || '',
    });
    await mail.save();
    return mail;
});

// List mails in a folder (with optional search)
fastify.get('/mails', async (request, reply) => {
    const { folder, search } = request.query;
    const query = {};
    if (folder) query.folder = folder;
    if (search) {
        query.$or = [
            { subject: { $regex: search, $options: 'i' } },
            { sender: { $regex: search, $options: 'i' } },
            { body: { $regex: search, $options: 'i' } },
        ];
    }
    const mails = await Mail.find(query).sort({ date: -1 });
    return mails;
});

// Fetch Inbox mails
fastify.get('/mails/inbox', async (request, reply) => {
    const mails = await Mail.find({ folder: 'Inbox' }).sort({ date: -1 });
    return mails;
});

// Fetch Sent mails
fastify.get('/mails/sent', async (request, reply) => {
    const mails = await Mail.find({ folder: 'Sent' }).sort({ date: -1 });
    return mails;
});

// Fetch Scheduled mails
fastify.get('/mails/scheduled', async (request, reply) => {
    const mails = await Mail.find({ folder: 'Scheduled' }).sort({ date: -1 });
    return mails;
});

// Get a single mail by ID
fastify.get('/mails/:id', async (request, reply) => {
    const mail = await Mail.findById(request.params.id);
    if (!mail) return reply.code(404).send({ error: 'Mail not found' });
    return mail;
});

// Send a new mail (immediate or scheduled)
fastify.post('/mails', async (request, reply) => {
    const data = request.body;
    const mail = new Mail({
        ...data,
        date: data.scheduledAt ? data.scheduledAt : new Date().toLocaleString(),
        sender: 'You',
        read: true,
        starred: false,
        flagged: false,
        pinned: false,
        folder: data.scheduledAt ? 'Scheduled' : 'Sent',
        attachments: data.attachments || [],
        cc: data.cc || '',
    });
    await mail.save();
    return mail;
});

// Save sent email (dedicated endpoint for sent emails)
fastify.post('/mails/sent', async (request, reply) => {
    try {
        const data = request.body;

        // Validate required fields
        if (!data.to || !data.subject || !data.body) {
            return reply.code(400).send({
                error: 'Missing required fields: to, subject, and body are required'
            });
        }

        const mail = new Mail({
            ...data,
            date: new Date().toLocaleString(),
            sender: 'You',
            read: true,
            starred: false,
            flagged: false,
            pinned: false,
            folder: 'Sent',
            attachments: data.attachments || [],
            cc: data.cc || '',
            conversationId: data.conversationId || `sent_${Date.now()}`,
        });

        await mail.save();

        // Return the saved mail with proper ID mapping
        const savedMail = mail.toObject();
        return {
            ...savedMail,
            id: savedMail._id,
            _id: savedMail._id
        };
    } catch (error) {
        fastify.log.error('Error saving sent email:', error);
        return reply.code(500).send({
            error: 'Failed to save sent email',
            details: error.message
        });
    }
});

// Update mail (read, star, flag, pin, move, etc.)
fastify.put('/mails/:id', async (request, reply) => {
    const mail = await Mail.findByIdAndUpdate(request.params.id, request.body, { new: true });
    if (!mail) return reply.code(404).send({ error: 'Mail not found' });
    return mail;
});

// Delete a mail (move to Deleted folder)
fastify.delete('/mails/:id', async (request, reply) => {
    const mail = await Mail.findByIdAndUpdate(request.params.id, { folder: 'Deleted' }, { new: true });
    if (!mail) return reply.code(404).send({ error: 'Mail not found' });
    return { success: true };
});

// Fetch Deleted mails
fastify.get('/mails/deleted', async (request, reply) => {
    const mails = await Mail.find({ folder: 'Deleted' }).sort({ date: -1 });
    return mails;
});

// Bulk update/delete/move
fastify.post('/mails/bulk', async (request, reply) => {
    const { ids, action, value } = request.body;
    if (!Array.isArray(ids) || !action) return reply.code(400).send({ error: 'Invalid request' });
    let update = {};
    if (action === 'delete') {
        // Move to Deleted folder instead of hard-deleting
        await Mail.updateMany({ _id: { $in: ids } }, { $set: { folder: 'Deleted' } });
        return { success: true };
    }
    if (action === 'move') update.folder = value;
    if (action === 'read') update.read = value;
    if (action === 'star') update.starred = value;
    if (action === 'flag') update.flagged = value;
    if (action === 'pin') update.pinned = value;
    await Mail.updateMany({ _id: { $in: ids } }, { $set: update });
    return { success: true };
});

// List rules
fastify.get('/rules', async (request, reply) => {
    const rules = await Rule.find();
    return rules;
});

// Create rule
fastify.post('/rules', async (request, reply) => {
    const rule = new Rule(request.body);
    await rule.save();
    return rule;
});

// Delete rule
fastify.delete('/rules/:id', async (request, reply) => {
    const rule = await Rule.findByIdAndDelete(request.params.id);
    if (!rule) return reply.code(404).send({ error: 'Rule not found' });
    return { success: true };
});

const start = async () => {
    try {
        await fastify.listen({ port: 5001, host: '0.0.0.0' });
        fastify.log.info(`Server listening on http://localhost:5000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start(); 