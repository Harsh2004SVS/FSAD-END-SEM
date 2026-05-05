# 🏏 Cricket Match Ticket Booking System

A modern full-stack web application designed for cricket fans to browse matches and book tickets seamlessly. The project features a robust Spring Boot backend and a dynamic React frontend, integrated with an AI-powered "Cricket Guru" chatbot.

## 🚀 Features

- **User Authentication**: Secure Login and Registration using JWT.
- **Match Management**: Browse upcoming matches, venues, and ticket availability.
- **Ticket Booking**: Real-time ticket booking with automated cost calculation and inventory management.
- **AI Cricket Guru**: An intelligent chatbot powered by Google Gemini to answer queries about matches and tickets.
- **Responsive Design**: Premium UI built with React and custom CSS.

## 🛠️ Tech Stack

### Frontend
- **React 19** (Vite)
- **React Router Dom** (Navigation)
- **Axios** (API Requests)
- **Lucide React** (Icons)

### Backend
- **Spring Boot** (Java 17)
- **Spring Data JPA** (Persistence)
- **H2 Database** (File-based database)
- **Spring Security** (Authentication & JWT)
- **Google Gemini API** (AI Chatbot Logic)

---

## 🏃 How to Run

### Prerequisites
- **Java 17** or higher
- **Node.js** & **npm**

### Step 1: Start the Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   The server will start on `http://localhost:5000`.

### Step 2: Start the Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## 🤖 AI Chatbot Configuration
The project uses the **Google Gemini API** for the chatbot. The API key is configured in `backend/src/main/resources/application.properties`.

---

## 📂 Project Structure
- `frontend/`: React application.
- `backend/`: Spring Boot application.
- `backend-node/`: Alternative Node.js/SQLite backend implementation.
