# QuickBrain AI

QuickBrain AI is a full-stack quiz generation and analytics platform powered by generative AI. It allows users to generate quizzes based on selected topics and difficulty levels using advanced AI models like Google Gemini, track their performance, and view analytics.

---

## 🚀 Project Features

- ✍️ AI-generated quiz questions using LangChain + Gemini API
- ⌚ Real-time performance tracking
- 📊 Admin dashboard with quiz insights and trends
- ⚖️ Difficulty-level adaptation based on user responses
- 🔢 Intelligent analytics via Pinecone + PostgreSQL

---

## 🔧 Tech Stack

### Frontend ([Repo](https://github.com/jyotishankar04/quickBrainAI-frontend))
- React 19 + Vite
- Tailwind CSS v4
- TypeScript
- ShadCN UI
- Zustand (state management)
- React Router DOM

### Backend ([Repo](https://github.com/jyotishankar04/quickBrainAI-backend))
- Node.js, Express.js
- Prisma ORM
- PostgreSQL
- LangChain + Google Gemini API
- Pinecone Vector DB
- TypeScript

---

## 📊 Architecture Overview

```
User → Frontend → Backend (Express)
    └→ LangChain + Gemini (Quiz Generation)
    └→ Pinecone (Vector DB)
    └→ PostgreSQL (Quiz Metadata, User Activity)
```

---

## 🔄 Workflow

1. **User logs in**
2. **Chooses topic and difficulty**
3. **Frontend sends request to backend**
4. **LangChain + Gemini generates quiz**
5. **Quiz is returned and rendered to user**
6. **User answers are submitted and stored**
7. **Analytics are updated**
8. **Admin can view reports and performance**

---

## 🎓 AI Data Flow (Simplified)

- **PDF Upload** → Text Extraction → Embedding to Pinecone
- **User Query** → Embedding → Pinecone Search → Gemini Response
- Store User Notes + Quiz Data in PostgreSQL

---

## ⚖️ Local Setup

### Backend
```bash
git clone https://github.com/jyotishankar04/quickBrainAI-backend
cd quickBrainAI-backend
pnpm install
cp .env.example .env # update values
pnpm dev
```

### Frontend
```bash
git clone https://github.com/jyotishankar04/quickBrainAI-frontend
cd quickBrainAI-frontend
pnpm install
pnpm dev
```

---

## 🌐 Live Deployment (Optional)

> Coming soon: Deployed via Vercel (Frontend) + Render/EC2 (Backend)

---

## 🌟 Future Enhancements

- Add PDF-based question generation
- GPT-4 support
- Adaptive difficulty using user history
- User leaderboard and gamification

---

## 🙌 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a pull request

---

## 🚀 Author

**Suvam (Jyotishankar Patra)**  
[GitHub](https://github.com/jyotishankar04) | [LinkedIn](https://linkedin.com/in/jyotishankar04)

---

> "Making quiz learning smarter with AI."

