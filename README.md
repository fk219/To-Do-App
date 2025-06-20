# Full-Stack AI-Powered Todo Application

This is a modern, full-stack Todo application featuring a React frontend and a Node.js/Express backend with MongoDB. It integrates the Gemini API for AI-powered features like smart todo suggestions, auto-prioritization, and motivational quotes.

## Features

**General:**
*   Full-stack application (React frontend, Node.js/Express backend, MongoDB).
*   Responsive and user-friendly UI built with Tailwind CSS.
*   User authentication (JWT-based) ensuring private todos for each user.

**Frontend (React):**
*   Display todos with title, description, due date, priority, and completion status.
*   Add, edit, delete, and mark todos as complete/incomplete.
*   Filter todos by status (All, Active, Completed) and priority.
*   Search todos by title or description.
*   Dark/Light mode toggle.
*   **AI-Powered Features (Connected to Backend):**
    *   Smart Suggestions: Get AI-optimized titles/descriptions when adding todos.
    *   Auto-Prioritization: AI suggests priority levels based on todo content.
    *   Motivational Quotes: Display AI-generated quotes upon task completion.
*   **Additional Frontend Features:**
    *   Analytics Dashboard: View stats like total todos, completion rate, and priority distribution.
    *   Due Date Reminders: Browser notifications for upcoming due dates (requires user permission).
    *   Export Todos: Download todos as JSON or CSV files.
    *   Offline Support: Basic app shell caching using a Service Worker for faster loads and offline access to the application structure. (Todo data is not fully offline-synced yet).

**Backend (Node.js/Express & MongoDB):**
*   RESTful API for CRUD operations on todos.
*   Mongoose ODM for MongoDB interactions.
*   Secure user registration and login with password hashing (bcryptjs) and JWT authentication.
*   Protected API routes ensuring users can only access their own data.
*   **Gemini API Integration:**
    *   Endpoints to provide AI suggestions for todos and generate motivational quotes.
    *   In-memory caching for Gemini API responses to optimize performance.
*   Centralized error handling.

## Tech Stack

*   **Frontend:** React (via CDN), JSX, Tailwind CSS, JavaScript (ES6+)
*   **Backend:** Node.js, Express.js, MongoDB, Mongoose
*   **AI:** Google Gemini API (via `@google/generative-ai` SDK)
*   **Authentication:** JSON Web Tokens (JWT), bcryptjs
*   **Dev Tools (Backend):** nodemon (for auto-restarting server during development)

## Project Structure

```
.
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   └── errorHandler.js   # Centralized error handler
├── models/
│   ├── Todo.js           # Mongoose schema for Todos
│   └── User.js           # Mongoose schema for Users
├── routes/
│   ├── api.js            # CRUD routes for Todos (protected)
│   ├── auth.js           # User registration and login routes
│   └── ai.js             # Routes for Gemini API interactions (protected)
├── .env                    # Environment variables (ignored by Git)
├── .env.example            # Template for .env file
├── .gitignore              # Specifies intentionally untracked files
├── app.js                  # Main frontend React application logic (served by index.html)
├── index.html              # Main HTML file for the frontend
├── package.json            # Backend dependencies and scripts
├── README.md               # This file
├── server.js               # Backend Express server setup
└── sw.js                   # Service Worker for basic offline support (if implemented)
```

## Setup and Installation

**Prerequisites:**
*   Node.js (v14.x or later recommended)
*   npm (usually comes with Node.js)
*   MongoDB instance (local or cloud-hosted like MongoDB Atlas)
*   Google Gemini API Key

**1. Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

**2. Backend Setup:**
   *   Navigate to the project root (if not already there).
   *   Install backend dependencies:
     ```bash
     npm install
     ```
   *   Create a `.env` file in the project root by copying `.env.example` (or creating it manually if `.env.example` is not present):
     ```bash
     # If .env.example exists:
     cp .env.example .env
     # Otherwise, create .env manually and add the following:
     ```
   *   Edit the `.env` file and provide your specific configurations:
     ```
     MONGODB_URI=your_mongodb_connection_string # e.g., mongodb://localhost:27017/ai_todo_app or your Atlas URI
     PORT=5000                                  # Port for the backend server
     JWT_SECRET=your_very_strong_jwt_secret_please_change     # A strong, random string for JWT signing
     GEMINI_API_KEY=your_google_gemini_api_key    # Your Gemini API key
     NODE_ENV=development                       # Set to 'production' for deployment
     ```
     **Important:** Ensure `JWT_SECRET` is a strong, unique random string for any production or publicly accessible deployment. `NODE_ENV=development` enables more detailed error messages. Set to `production` for deployed versions.

**3. Frontend Setup:**
   *   The frontend is primarily contained within `index.html` and `app.js`.
   *   `index.html` uses CDN-hosted React, ReactDOM, Babel (for JSX transpilation in browser), and Tailwind CSS.
   *   No separate build step is required for the frontend as `app.js` (containing React code) is directly included and transpiled by the browser.

**4. Running the Application:**
   *   **Start the Backend Server:**
     ```bash
     npm start
     ```
     Or for development with auto-reloading (if nodemon is configured and installed):
     ```bash
     npm run dev
     ```
     The backend server will typically run on `http://localhost:5000` (or the port specified in `.env`). Check console output for the exact URL.
   *   **Open the Frontend:**
     *   Simply open the `index.html` file in your web browser (e.g., by dragging it to the browser window or using `File > Open`).
     *   The frontend application in `app.js` will attempt to communicate with the backend server running at `http://localhost:PORT` (as configured).
     *   Ensure your browser can make requests to the backend server (CORS is enabled on the backend by default for all origins).

## API Documentation

The backend exposes the following RESTful API endpoints. All endpoints under `/api/todos` and `/api/ai` require authentication (a JWT in the `x-auth-token` header).

**Authentication (`/api/auth`)**
*   `POST /register`
    *   Description: Registers a new user.
    *   Body: `{ "username": "testuser", "password": "password123" }`
    *   Response (201): `{ "token": "jwt_token", "user": { "id": "user_id", "username": "testuser" } }`
*   `POST /login`
    *   Description: Logs in an existing user.
    *   Body: `{ "username": "testuser", "password": "password123" }`
    *   Response (200): `{ "token": "jwt_token", "user": { "id": "user_id", "username": "testuser" } }`

**Todos (`/api/todos`)** (Requires Authentication)
*   `POST /`
    *   Description: Creates a new todo for the authenticated user.
    *   Body: `{ "title": "New Todo Title", "description": "Optional description...", "dueDate": "YYYY-MM-DD", "priority": "Medium" }` (description, dueDate, priority are optional)
    *   Response (201): The created todo object.
*   `GET /`
    *   Description: Retrieves all todos for the authenticated user, sorted by creation date (newest first).
    *   Response (200): Array of todo objects.
*   `GET /:id`
    *   Description: Retrieves a specific todo by its ID.
    *   Response (200): The todo object. (Returns 404 if not found, 401 if not owned by user).
*   `PUT /:id`
    *   Description: Updates an existing todo.
    *   Body: Fields to update (e.g., `{ "title": "Updated Title", "completed": true }`). Only provided fields are updated.
    *   Response (200): The updated todo object.
*   `DELETE /:id`
    *   Description: Deletes a todo by its ID.
    *   Response (200): `{ "msg": "Todo removed successfully", "id": "deleted_todo_id" }`.

**AI Services (`/api/ai`)** (Requires Authentication)
*   `POST /suggest`
    *   Description: Gets AI-powered suggestions for a todo's title, description, and priority.
    *   Body: `{ "title": "Meeting notes", "description": "Discuss Q3 roadmap" }` (title and/or description)
    *   Response (200): `{ "suggestedTitle": "Finalize Q3 Roadmap Discussion Points", "suggestedDescription": "Compile detailed notes from the meeting to finalize the Q3 roadmap, including key decisions and action items.", "suggestedPriority": "High" }` (Fields are optional in response; only suggested changes are returned).
*   `POST /motivational-quote`
    *   Description: Gets an AI-generated motivational quote.
    *   Body: (Empty)
    *   Response (200): `{ "quote": "The future depends on what you do today." }`

## Showcasing Interview-Ready Skills

This project demonstrates a range of skills valuable for full-stack and AI-focused roles:

*   **Full-Stack Development:** Proficiency in both frontend (React, Tailwind CSS, modern JavaScript using ES6+ features) and backend (Node.js, Express, MongoDB) technologies.
*   **RESTful API Design & Implementation:** Creation of well-structured and conventional API endpoints for CRUD operations and specialized services, including versioning considerations (e.g., `/api/...`).
*   **Database Management & ODM:** Effective use of MongoDB with Mongoose for data modeling (schemas with validation, defaults, and references), data persistence, and querying.
*   **Authentication & Authorization:** Robust implementation of JWT-based user authentication (registration, login, token generation) and authorization (protecting routes and ensuring users access only their own data). Secure password handling using `bcryptjs`.
*   **AI Integration (Google Gemini):** Practical application of a leading generative AI model (Gemini Pro) for enhancing application functionality. This includes:
    *   Crafting effective prompts (prompt engineering) to elicit desired responses (e.g., structured JSON).
    *   Handling API responses, including parsing (with fallbacks) and error management (e.g., safety filter blocks).
    *   Implementing basic caching for AI responses to manage costs and improve performance.
*   **Modern JavaScript & React (without Create React App):** Direct use of React via CDNs, showcasing an understanding of how React works at a fundamental level, including JSX transpilation in the browser via Babel standalone. Use of React Hooks for state and lifecycle management.
*   **Responsive UI/UX:** Consideration for user experience with features like dark/light mode, dynamic filtering and searching, clear user feedback (notifications, loading states), and responsive design principles using Tailwind CSS.
*   **Advanced Frontend Features:** Implementation of browser APIs like Notifications API for due date reminders and file download for data export.
*   **Problem Solving & Feature Development:** Design and development of a comprehensive set of features (CRUD, AI, auth, analytics, export, reminders) that go beyond a basic application.
*   **Code Quality & Maintainability:** Modular project structure (separating routes, models, middleware), use of middleware for centralized concerns (authentication, error handling), and commented code for clarity.
*   **Software Development Lifecycle Awareness:** Understanding of setup (dependency management with npm, environment configuration with `.env`), development (use of `nodemon`), and considerations for deployment (e.g., `NODE_ENV` variable).
*   **Error Handling:** Implementation of a centralized error handling middleware for consistent and informative error responses on the backend.
*   **Innovation & User Engagement:** Leveraging AI to create a more intelligent, helpful, and engaging user experience compared to standard utility applications.

This project serves as a strong portfolio piece, highlighting the ability to build a complete, modern, and intelligent web application from scratch, integrating cutting-edge AI technologies.
```
