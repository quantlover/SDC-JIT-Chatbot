# JustInTimeMedicine Chatbot Transfer Guide

## Overview
This guide provides instructions for transferring the CHM AI chatbot to the Just In Time Medicine team for integration into their website.

## What You're Getting
- Complete React-based chatbot widget that can be embedded in any website
- Express.js backend with OpenAI integration and fallback knowledge base
- Comprehensive medical education knowledge base covering CHM curriculum
- PostgreSQL database schema for conversation storage
- All source code and configuration files

## Deployment Options

### Option 1: Replit Deployment (Recommended for Quick Setup)
1. **Fork the Project**: The Just In Time team can fork this Replit project
2. **Add API Key**: Set the `OPENAI_API_KEY` environment variable in Replit
3. **Deploy**: Click the "Deploy" button in Replit for instant hosting
4. **Custom Domain**: Configure a custom domain in Replit Deployments

### Option 2: Self-Hosted Deployment
1. **Export Code**: Download all project files from this Replit
2. **Server Setup**: Deploy on your preferred hosting platform (AWS, Vercel, Netlify, etc.)
3. **Database**: Set up PostgreSQL database (or use the included in-memory storage)
4. **Environment Variables**: Configure required environment variables
5. **Build & Deploy**: Run `npm install` and `npm run build`

## Integration into JustInTimeMedicine.com

### Embed as Widget
The chatbot is designed as a floating widget that can be embedded in any website:

```html
<!-- Add to your website's HTML -->
<div id="chm-chatbot"></div>
<script src="https://your-deployed-chatbot.com/widget.js"></script>
```

### Iframe Integration
Alternatively, embed as an iframe:

```html
<iframe 
  src="https://your-deployed-chatbot.com" 
  width="400" 
  height="600"
  frameborder="0">
</iframe>
```

## Required Environment Variables

### Production Setup
```bash
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

### Development Setup
```bash
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
# Database is optional in development (uses in-memory storage)
```

## Customization Options

### Branding
- Update colors in `client/src/index.css`
- Modify the welcome message in `client/src/components/ChatWidget.tsx`
- Add your logo and styling

### Knowledge Base
- Edit `server/services/knowledge-base.ts` to update curriculum information
- Add new learning societies, courses, or resources
- Modify quick action buttons and suggestions

### Features
- Conversation history is automatically saved
- Fallback responses work even without OpenAI API
- Mobile-responsive design
- Accessible UI components

## Technical Architecture

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn/ui component library
- TanStack Query for API calls

### Backend
- Express.js with TypeScript
- OpenAI GPT-4o integration
- PostgreSQL with Drizzle ORM
- In-memory fallback storage

### Database Schema
```sql
-- Users table for future authentication
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations for chat sessions
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages for chat history
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Considerations

### API Key Protection
- Never expose the OpenAI API key in frontend code
- Use environment variables for all sensitive data
- Consider implementing rate limiting for API calls

### Data Privacy
- All conversations are stored securely
- No personal student information is required
- HIPAA compliance considerations for medical education content

## Support and Maintenance

### Regular Updates
- Update the knowledge base with new curriculum changes
- Monitor OpenAI API usage and costs
- Review conversation logs for improvement opportunities

### Troubleshooting
- Check environment variables if API calls fail
- Monitor server logs for errors
- Test fallback responses if OpenAI is unavailable

## Cost Considerations

### OpenAI API Usage
- Estimated cost: $0.01-0.03 per conversation
- Implement usage monitoring and alerts
- Consider caching common responses

### Hosting
- Replit: $20/month for Core plan with custom domains
- Self-hosted: Variable based on traffic and provider

## Contact Information
For technical questions about the implementation, the development team can be reached through this Replit workspace.

## Files to Transfer
- All files in this Replit workspace
- This transfer guide
- Database migration scripts (if using PostgreSQL)
- Environment variable templates

The chatbot is production-ready and includes comprehensive error handling, fallback responses, and a complete knowledge base covering CHM's curriculum, learning societies, and academic resources.