# Cricket Pitch Management System

(WebSocket, Express.js, PostgreSQL, Redis, ReactJS, TailwindCSS)

Cricket Pitch Management System allows users to book available cricket pitch slots in real time.

---

# Project Structure

There are two separate repositories:

1. `pitch-frontend`
2. `pitch-backend`

---

# Frontend Setup

To run the frontend application, make sure Node.js is installed on your system.

## Steps

### 1. Clone the repository

```bash
git clone <frontend-repository-url>
```

### 2. Navigate to frontend directory

```bash
cd pitch-frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Modify the `.env` file according to your frontend configuration.

Example:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### 5. Start the development server

```bash
npm run dev
```

The frontend application will start on:

```bash
http://localhost:5173
```

---

# Backend Setup

To run the backend application, make sure the following are installed:

* Node.js
* PostgreSQL
* Redis

## Steps

### 1. Clone the repository

```bash
git clone <backend-repository-url>
```

### 2. Navigate to backend directory

```bash
cd pitch-backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create or modify the `.env` file. you can use .env.example.

Example:

```env
PORT=3000

DATABASE_URL=postgresql://username:password@localhost:5432/pitch_management

REDIS_URL=redis://localhost:6379

SECRET_KEY=your_secret_key
```

### 5. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 6. Generate Prisma client

```bash
npx prisma generate
```

### 7. Run Prisma Seed to add sample pitches in the db

```bash
npx prisma db seed
```

### 7. Generate Prisma client

```bash
npx prisma generate
```

### 7. Start the backend server

```bash
npm run dev
```

The backend server will start on:

```bash
http://localhost:3000
```

---

# Tech Stack

## Frontend

* ReactJS
* TailwindCSS
* Socket.IO Client

## Backend

* Express.js
* PostgreSQL
* Prisma ORM
* Redis
* Socket.IO

---

# Features

* Real-time slot booking
* Live booking updates using WebSocket
* Pitch availability management
* Temporary slot reservation
* Booking expiration handling
* Redis caching 

---
