# Advanced Analysis Design Group Project – React (Client) + FastAPI (Server) + PostgreSQL
This project folder includes the architectural design of how our advanced analysis and design
A concise, monorepo-style setup for a React (Vite) frontend, a FastAPI backend, and a PostgreSQL database.

## Folders

```
.
├─ client/   # React + Vite + Tailwind + Vitest + Cypress (+ Docker)
└─ server/   # FastAPI app (uvicorn)
```

## Prerequisites

* **Node.js** ≥ 20 and **npm** ≥ 10 (or **yarn**)
* **Python** ≥ 3.10 and **pip**
* **PostgreSQL** (running locally or remotely)
* **Docker** (optional, for the client container)

---

## Quick Start

### 1) Clone

```bash
git clone <YOUR_REPO_URL>.git
cd <YOUR_REPO_FOLDER>
```

### 2\) Run the Backend (FastAPI)

Before running the backend, you should **install and activate a virtual environment** to isolate the project's dependencies.

1.  **Create and Activate a Virtual Environment**

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

    > **Note:** On Windows,you can just type python without the 3 and you would typically use `.\venv\Scripts\activate` to activate the virtual environment.

2.  **Install Dependencies and Run the Server**

    Now that your environment is active, you can install the packages and run the application.

    ```bash
    cd server
    pip3 install -r requirements.txt
    uvicorn src.main:app --reload
    ```
     > **Note:** On Windows, you would typically use `pip install -r requirements.txt` to activate the virtual environment.


* Server runs on **[http://localhost:8000/](http://localhost:8000/)**
* Interactive API docs at **[http://localhost:8000/docs](http://localhost:8000/docs)**

> **Database:** Ensure PostgreSQL is available. If your app expects a connection string, set it (e.g. via `.env`) like:
>
> ```
> DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME
> ```

### 3) Run the Frontend (React + Vite)

```bash
cd ../client
npm install
npm run dev
```

* Vite dev server on **[http://localhost:5173/](http://localhost:5173/)**

> If the frontend calls the API, make sure any API base URL points to `http://localhost:8000` (e.g. via an env var like `VITE_API_URL` if your client uses it).

---

## Testing (Client)

* **Unit tests (Vitest):**

  ```bash
  npm run test        # or: npm run test:ui
  ```
* **E2E tests (Cypress):**

  ```bash
  npm run cy:open
  ```

## Docker (Client, optional)

From `client/`:

```bash
docker build -t react-vite-app .
docker run -p 5173:5173 react-vite-app
```

Or with Compose (if `docker-compose.yml` is present):

```bash
docker-compose up        # add -d for detached
docker-compose down
```

---

## Notes

* **Ports:** client `5173`, server `8000`, PostgreSQL default `5432`.
* **Tech stack:** React + Vite + Tailwind + Vitest + Cypress (client), FastAPI + Uvicorn (server), PostgreSQL (DB).
* Keep API and client running in separate terminals: **`server/`** for FastAPI, **`client/`** for React.
