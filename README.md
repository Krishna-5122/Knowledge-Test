# 🧠 AI Teacher Quiz App

A full-stack quiz application where an admin can add questions and answers, and students can take a quiz with automatic evaluation.

## ⚙️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Axios, Lucide Icons, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)

## 📁 Project Structure
```text
/
├── backend/
│   ├── .env               # Backend environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Express server and API logic
└── frontend/
    ├── src/
    │   ├── components/    # AdminPanel, QuizPage, ResultsPage
    │   ├── App.jsx        # Main routing and layout
    │   ├── main.jsx       # Entry point
    │   └── index.css      # Tailwind & global styles
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js     # Proxy setup for API
    └── package.json       # Frontend dependencies
```

## 🚀 Deployment Guide

### Option 1: Render (Recommended)
1. **Prepare your code:**
   - Push your code to a GitHub/GitLab repository.
   - Ensure your `MONGO_URI` in Render's environment variables points to a **MongoDB Atlas** database (not localhost).

2. **Create a new Web Service on Render:**
   - **Build Command:** `npm run render-postbuild`
   - **Start Command:** `npm start`
   - **Root Directory:** (Leave empty, use the root of the repo)

3. **Add Environment Variables in Render:**
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `PORT`: 5000 (Render will provide this automatically, but good to have a default).
   - `NODE_ENV`: production

### Option 2: Vercel (Frontend) + Render (Backend)
If you prefer separate deployments:
- **Frontend (Vercel):**
  - Set the `VITE_API_URL` environment variable to your backend's URL.
  - You would need to update `axios` calls in the frontend to use `import.meta.env.VITE_API_URL`.
- **Backend (Render):**
  - Just deploy the `backend/` folder.
  - Update CORS settings in `server.js` to allow your Vercel URL.

### 🗄️ Database: MongoDB Atlas
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new Cluster and a Database User.
3. Whitelist all IP addresses (`0.0.0.0/0`) for the initial setup.
4. Copy the connection string and use it as `MONGO_URI`.

---

## 🚀 Local Setup Instructions

### 1. Prerequisites
- Node.js (v16+) installed
- MongoDB installed locally or a MongoDB Atlas URI

### 2. Backend Setup
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/quizapp
   ```
4. Start the backend server:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

## ⭐ Key Features
- **Admin Panel:** Add new questions and answers securely.
- **Quiz Mode:** Take a quiz with a 5-minute timer and randomized question order.
- **Auto-Evaluation:** Instant scoring with case-insensitive and space-trimmed matching.
- **Detailed Feedback:** Review each answer with marks (✅/❌) and see correct answers for mistakes.
- **Responsive Design:** Clean, modern UI that works on all devices.

## 🔌 API Endpoints
- `GET /questions`: Fetch all questions (answers hidden).
- `POST /questions`: Add a new question (requires `question` and `answer`).
- `POST /submit`: Evaluate quiz (requires `userAnswers` array).
