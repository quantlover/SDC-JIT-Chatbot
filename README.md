# JustInTimeMedicine Chatbot

An AI-powered medical education chatbot designed for the College of Human Medicine's Shared Discovery Curriculum. This comprehensive assessment system helps medical students test their knowledge across all major medical topics with intelligent, contextual feedback.

## 🩺 Features

- **10 Medical Topics**: Cardiovascular, Respiratory, Renal, Endocrine, Gastrointestinal, Nervous System, Immunology, Microbiology, Biochemistry, Pharmacology
- **3 Difficulty Levels**: Easy, Medium, Difficult assessments tailored to learning progress
- **Curriculum Phases**: M1, MCE (Mid-Curricular Exam), LCE (Longitudinal Curricular Exam) specific content
- **AI-Powered Responses**: OpenAI GPT-4o integration for intelligent, contextual feedback
- **Modern UI**: Clean, medical-themed interface with chat widget
- **Conversation Persistence**: Full chat history saved across sessions
- **Offline Fallback**: Robust fallback system when API is unavailable
- **Comprehensive Testing**: Multiple choice questions with detailed explanations

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/JustInTimeMedicine-Chatbot.git
   cd JustInTimeMedicine-Chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run database migrations:**
   ```bash
   npm run db:push
   ```

5. **Start the application:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:5000`

## 📱 Usage Examples

### Basic Assessment Request
```
User: "Give me a cardiovascular test"
AI: Generates 5 multiple-choice questions about cardiovascular system with explanations
```

### Difficulty-Specific Testing
```
User: "I need a difficult biochemistry assessment"
AI: Creates advanced biochemistry questions appropriate for upper-level medical students
```

### Curriculum Phase Testing
```
User: "MCE level respiratory questions"
AI: Provides Mid-Curricular Exam level respiratory system assessment
```

### Topic Exploration
```
User: "Explain renal physiology"
AI: Provides comprehensive explanation with follow-up assessment questions
```

## 🏗️ Architecture

### Frontend
- **React** with TypeScript
- **shadcn/ui** components with medical blue theme
- **TanStack React Query** for state management
- **Wouter** for routing
- **Tailwind CSS** for styling

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **OpenAI API** integration
- **Zod** for validation
- **RESTful API** design

### Database Schema
- **Users**: Authentication and profiles
- **Conversations**: Chat session tracking
- **Messages**: Individual chat messages with metadata

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for AI responses
- `NODE_ENV`: Development/production environment

### Customization
- Medical topics can be modified in `server/enhanced-knowledge-base.ts`
- UI theme colors in `client/src/index.css`
- Assessment difficulty levels in curriculum configuration

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

For development testing:
```bash
npm run dev
# Application runs on http://localhost:5000
```

## 📚 Medical Content

The system includes comprehensive knowledge bases for:
- **Basic Sciences**: Anatomy, Physiology, Pathology, Pharmacology
- **Clinical Systems**: All major organ systems
- **Specialties**: Internal Medicine, Surgery, Pediatrics, OB/GYN
- **Assessment Types**: NBME-style questions, case-based scenarios

## 🛡️ Fallback Systems

- **Offline Mode**: Pre-generated questions when API unavailable
- **Error Handling**: Graceful degradation with helpful error messages
- **Content Backup**: Local curriculum database for reliability

## 🚀 Deployment

### Replit (Recommended)
1. Import repository to Replit
2. Add environment variables in Secrets
3. Click "Deploy" to publish

### Self-Hosting
1. Build the application: `npm run build`
2. Set up PostgreSQL database
3. Configure environment variables
4. Deploy to your preferred platform (Vercel, Heroku, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 About

Developed for the College of Human Medicine's Shared Discovery Curriculum to enhance medical education through AI-powered assessments and interactive learning.

## 📞 Support

For questions about the medical content or technical issues, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for medical education**