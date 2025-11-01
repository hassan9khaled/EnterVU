# EnterVU: AI-Powered Interview System

<p align="center">
  <img src="frontend/src/assets/EnterVU_full_logo.png" alt="EnterVU Project Logo" width="200">
</p>

---
An **AI-powered Interview Preparation & Evaluation System** that helps candidates practice job interviews. Users can upload their CV and specify a job title, then the system generates interview questions, evaluates answers, and provides a detailed feedback report.

-----

## Features

  * **User Authentication:** Secure user registration and login system.
  * **CV Management:** Upload, store, and manage multiple PDF CVs.
  * **AI-Powered CV Parsing:** Automatically extracts and structures key information from uploaded CVs using Google's AI.
  * **Customizable Interviews:** Start new interviews based on a CV, job title, description, specific skills, and difficulty level.
  * **Multiple Interview Modes:**
      * **Text-Based:** A classic chat-style interview where you type your answers.
      * **Live Voice:** A real-time, voice-to-voice conversation with an AI interviewer.
  * **Dynamic Question Generation:** AI generates a unique set of technical, behavioral, and situational questions tailored to your profile.
  * **Comprehensive Reporting:** Receive a detailed report with an overall score, decision, strengths, weaknesses, and a full transcript.
  * **Email Notifications:** Receive your final report via email, powered by the Gmail API.
  * **API Documentation:** A built-in frontend page to browse and understand the system's API endpoints.

-----

## Tech Stack

  * **Backend:**
      * **Framework:** **FastAPI**
      * **AI:** **Google AI (Gemini)** via the **Google Agent Development Kit (ADK)**
      * **Database:** **SQLAlchemy** with **SQLite**
      * **Schema:** **Pydantic**
      * **Email:** **Gmail API**
  * **Frontend:**
      * **Framework:** **React**
      * **Bundler:** **Vite**
      * **Styling:** **Tailwind CSS**
      * **API Client:** **Axios**
      * **Audio:** Browser-native **AudioWorklets** for real-time audio processing

-----

## Quick Start with Docker

This is the recommended way to run the project. It builds and orchestrates all three services (frontend, backend API, and backend live agent).

### Prerequisites

1.  **Docker & Docker Compose:** You must have a recent version of [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed. This includes the `docker compose` command.

2.  **Google API Key:** You need a **Google API Key** with the "Generative Language API" (Gemini) enabled.

      * Get one here: [Google AI Studio](https://aistudio.google.com/app/apikey)

3.  **Google Cloud & Gmail API:**

      * Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
      * Enable the **Gmail API** for that project.
      * Go to "Credentials", create an "OAuth 2.0 Client ID", select "Desktop app", and download the `credentials.json` file.

### Setup

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/hassan9khaled/ai-interview-system.git
    cd ai-interview-system
    ```

2.  **Configure Environment Files:**

      * **Main Backend:** Copy the example `.env` file.
        ```bash
        cp backend/app/.env.example backend/app/.env
        ```
      * **Google ADK:** Copy the example and add your API key.
        ```bash
        cp backend/app/integrations/google_adk/.env.example backend/app/integrations/google_adk/.env
        ```
        Now, edit `backend/app/integrations/google_adk/.env` and add your key:
        ```env
        GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY_HERE"
        ```

3.  **Add Google Credentials:**

      * Place the `credentials.json` file you downloaded from Google Cloud into the credentials folder:
        `backend/app/assets/creds/credentials.json`

4.  **Create and Permission Data Directories (Linux/macOS):**

      * The Docker container needs a persistent, writable directory for the database.

    <!-- end list -->

    ```bash
    mkdir -p backend/data
    chmod -R 777 backend/data
    ```

      * *(This step is necessary on Linux hosts to prevent Docker permission errors.)*

### Run the Application

1.  **Build and Start All Containers:**

      * From the project's root directory (where `docker-compose.yml` is), run:

    <!-- end list -->

    ```bash
    docker compose up --build -d
    ```

      * This will build the frontend and backend images and start all three services in the background.

2.  **First-Time Gmail Authentication:**

      * The application needs you to grant it permission to send emails on your behalf. This is a **one-time setup**.
      * Open the logs for the `backend-api` container:
        ```bash
        docker compose logs -f entervu-api
        ```
      * Now, use the app in your browser and **complete your first interview**.
      * When you click "Finish Interview", look at the terminal logs. You will see a Google authentication URL.
      * **Copy that URL** and paste it into your browser.
      * Log in to the Google account you used for the Gmail API, and grant the requested permissions.
      * This will save a `token.json` file in your `backend/app/assets/creds/` directory. The app will use this token for all future email sending.

3.  **Access the Application:**

      * You're all set\! Open your browser and go to:
      * **[http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)**

### Stopping the Application

```bash
docker compose down
```

-----

## API Documentation

The backend exposes a full v2 REST API. You can explore all endpoints in two ways:

1.  **Postman:** Import the collection from `backend/app/assets/EnterVU_API_V2.json`.
2.  **Live Docs:** Run the app and navigate to the `/docs` page on the frontend.

## License

This project is licensed under the **Apache License 2.0**. See the `LICENSE` file for details.