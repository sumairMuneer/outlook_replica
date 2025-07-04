# Outlook Replica Backend

A Fastify-based backend for the Outlook replica application.

## API Endpoints

### Mail Management

#### Send Email
- **POST** `/mails/sent` - Save a sent email
  - Body: `{ to, cc?, subject, body, attachments?, conversationId? }`
  - Returns: Saved email object with `id` field

#### Fetch Emails
- **GET** `/mails/inbox` - Fetch inbox emails
- **GET** `/mails/sent` - Fetch sent emails
- **GET** `/mails` - Fetch emails with optional folder and search filters
  - Query params: `folder`, `search`

#### General Mail Operations
- **POST** `/mails` - Send email (immediate or scheduled)
- **POST** `/mails/draft` - Save draft email
- **GET** `/mails/:id` - Get single email by ID
- **PUT** `/mails/:id` - Update email
- **DELETE** `/mails/:id` - Delete email
- **POST** `/mails/bulk` - Bulk operations (delete, move, read, star, flag, pin)

### Rules Management
- **GET** `/rules` - Fetch all rules
- **POST** `/rules` - Create new rule
- **DELETE** `/rules/:id` - Delete rule

## Database Schema

### Mail Schema
```javascript
{
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
  attachments: [String]
}
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB (make sure it's running on localhost:27017)

3. Start the server:
   ```bash
   npm start
   ```

4. Test the API:
   ```bash
   node test-sent-api.js
   ```

## Features

- **Sent Email Management**: Dedicated API for saving and retrieving sent emails
- **Validation**: Proper validation for required fields (to, subject, body)
- **Error Handling**: Comprehensive error handling with detailed error messages
- **CORS Support**: Cross-origin resource sharing enabled for frontend integration
- **MongoDB Integration**: Persistent storage using MongoDB 