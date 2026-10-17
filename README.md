# Mini Applicant Tracking System (ATS)

A full-stack web application built to manage candidates, track hiring stages, search applicant records, and view recruitment dashboard metrics.

## Features

- **Dashboard:** View candidate and recruitment-stage metrics.
- **Candidate Management:** Add, view, edit, and delete candidates.
- **Hiring Pipeline:** Track candidates across Applied, Screening, Interview, Offer, Hired, and Rejected stages.
- **Search and Filtering:** Find candidates using search and filters.
- **Job Openings:** View sample job listings.
- **Interview Tracking:** View candidates in the interview stage.
- **Notifications:** View candidate counts by hiring stage.

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Version Control:** Git and GitHub

## Project Structure

```text
mini-ats/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
└── README.md
```

## Run Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd mini-ats
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create a `backend/.env` file containing your own MongoDB Atlas connection string and port:

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
```

Start the backend using the start script defined in `backend/package.json`.

### 3. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Ensure the frontend API URL points to the running backend at `http://localhost:5000/api/candidates` when running locally.

## Security

Environment variables and database credentials must never be committed to GitHub.

## Project Status

Core candidate management, hiring-stage tracking, search, and dashboard functionality are implemented. Deployment details will be added once the application is hosted.