# Pentest Estimator Web Application

A web-based application for estimating penetration testing efforts and costs. This application allows users to calculate estimated mandays based on various factors like application type, number of functions, and testing methodology (Blackbox/Graybox).

## Features

- **Estimation Engine:** Calculate mandays based on input parameters.
- **User Dashboard:** View and manage past estimations.
- **Admin Panel:** Manage system configurations and view all estimations.
- **Feedback System:** Users can submit feedback with attachments.
- **Authentication:** Secure login and registration system.
- **Responsive Design:** Modern UI with dark/light mode support.

## Prerequisites

- **Node.js** (v14 or higher recommended)
- **npm** (Node Package Manager)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Dunkphanpron/Pentest-Estimator.git
    cd Pentest-Estimator
    ```
    *(Or download the ZIP file and extract it)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Initialize the database:**
    This will create the SQLite database file in `data/database.sqlite`.
    ```bash
    node scripts/init_db.js
    ```

4.  **Create an Admin User (Optional but Recommended):**
    Running this script will create a default admin user.
    ```bash
    node scripts/seed_user.js
    ```
    *Check the script output for the default credentials (usually `admin` / `password123` or similar).*

5.  **(Optional) Initialize other data:**
    If you need specific initial data for testing, you can run:
    ```bash
    node scripts/init_feedback.js   # Create feedback table
    node scripts/init_owasp.js      # Initialize OWASP Top 10 data
    ```

## Usage

1.  **Start the server:**
    ```bash
    npm start
    ```
    Or directly:
    ```bash
    node server.js
    ```

2.  **Access the application:**
    Open your web browser and go to:
    `http://localhost:3000`

## Project Structure

- `server.js` - Main entry point of the application.
- `app.js` - Express application setup.
- `controllers/` - Logic for handling requests.
- `models/` - Database models and schema interactions.
- `routes/` - API and page route definitions.
- `views/` - EJS templates for the frontend.
- `public/` - Static files (CSS, JS, Images).
- `scripts/` - Utility scripts for database initialization and maintenance.
- `data/` - SQLite database storage.

## Troubleshooting

- **Database Errors:** If you encounter widespread errors, try deleting `data/database.sqlite` and re-running the initialization scripts.
- **Port In Use:** If port 3000 is occupied, modify the port in `server.js` or `.env` file.
