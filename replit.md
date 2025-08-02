# Overview

This is a medical education chat application called "JustInTimeMedicine" designed for the College of Human Medicine's Shared Discovery Curriculum. The application provides an AI-powered chatbot interface that helps medical students navigate curriculum resources, learning societies, and academic support materials. It features a React frontend with shadcn/ui components, an Express.js backend with OpenAI integration, and PostgreSQL database with Drizzle ORM for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for conversations and chat functionality
- **Data Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling middleware
- **Development Setup**: Hot reload with Vite integration in development mode

## Data Storage Solutions
- **Database**: PostgreSQL with connection via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations for database versioning
- **In-Memory Fallback**: MemStorage class for development/testing without database

## Database Schema
- **Users**: Authentication and user management
- **Conversations**: Chat session tracking with timestamps
- **Messages**: Individual chat messages with role (user/assistant) and metadata support

## Authentication and Authorization
- Currently uses a basic storage interface pattern, ready for future authentication implementation
- Session management prepared through storage layer abstraction

## Chat System
- **AI Integration**: OpenAI GPT-4o for generating contextual responses
- **Knowledge Base**: Structured medical education content including learning societies, curriculum information, and resources
- **Context Management**: Conversation history tracking for improved AI responses
- **Response Enhancement**: Structured responses with suggestions and resource recommendations

# External Dependencies

## Core Technologies
- **Database**: Neon PostgreSQL serverless database
- **AI Service**: OpenAI API for chat completions using GPT-4o model
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach

## Development Tools
- **Build System**: Vite for fast development and production builds
- **Package Manager**: npm with lockfile for dependency management
- **TypeScript**: Type safety across frontend and backend
- **Development Environment**: Replit-specific plugins and runtime error handling

## Third-Party Integrations
- **OpenAI**: Chat completion API for AI-powered responses
- **Neon**: Serverless PostgreSQL hosting and connection management
- **Replit**: Development environment integration with cartographer and runtime error modal plugins

The application is designed to be easily deployable on Replit with proper environment variable configuration for database and OpenAI API access.