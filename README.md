# Hivon Blog - AI-Powered Blogging Platform

A futuristic, full-stack blogging platform built for the Hivon Automations Internship Assignment. This application leverages Next.js, Supabase, and Google Gemini AI to provide a premium writing and reading experience.

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router)
- **Styling**: Vanilla CSS with a focus on Glassmorphism and modern design principles.
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **AI Integration**: Google Gemini 2.0 Flash (via `@google/generative-ai`)
- **Icons**: Lucide React
- **Deployment**: Prepared for Vercel/Netlify

## ✨ Key Features

### 1. Role-Based Access Control (RBAC)
- **Viewer**: Can read posts, view AI summaries, and comment.
- **Author**: Can create and edit their own posts, and view comments.
- **Admin**: Has full moderation power over all posts and comments via a dedicated dashboard.

### 2. AI Post Summarization
When a post is published, the platform automatically:
1. Sends the content to **Gemini 2.0 Flash**.
2. Generates a concise, professional ~200-word summary.
3. Stores and displays the summary to enhance the reader's experience.

### 3. Media Management
- Integrated **Supabase Storage** for custom cover image uploads.
- Real-time image previews during the creation/edit flow.

### 4. Advanced Discovery
- **Real Search**: Server-side filtering by title and body content.
- **Pagination**: Efficient content delivery for large post collections.
- **Interactive Discussion**: Robust comments system with user attribution.

## 🧠 AI Tool Usage Disclosure

This project was developed using **Antigravity**, an agentic AI coding assistant.

### Why Antigravity?
- **Speed**: Accelerated the transition from static mockups to full-stack logic.
- **Quality**: Ensured the implementation of premium design patterns (glassmorphism, smooth animations).
- **Efficiency**: Handled complex integrations like Gemini 2.0 and Supabase RBAC seamlessly.

### How it helped:
- Assisted in architecting the database schema and Row Level Security (RLS) policies.
- Streamlined the implementation of Server Actions for secure backend operations.
- Optimized the AI prompt engineering for the Gemini summarization feature.

## 🛠️ Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd hivon-blog
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   GOOGLE_AI_API_KEY=your_gemini_key
   ```

4. **Initialize Database**:
   Run the contents of `supabase_setup.sql` in your Supabase SQL Editor.

5. **Run Locally**:
   ```bash
   npm run dev
   ```

## 🐞 Challenges & Solutions

- **Gemini Upgrade**: Initially implemented with Gemini 1.5, I upgraded to **Gemini 2.0 Flash** during development to leverage the latest performance improvements and lower latency in summarization.
- **RBAC Sync**: To ensure the application roles synced perfectly with the database, I implemented a `fetchProfile` trigger in the `AuthContext` to ensure the UI always reflects the user's latest permissions.

---
**Built with ❤️ by Raghav Parasher for Hivon Automations.**
