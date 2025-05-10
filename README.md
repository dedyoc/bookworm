# Bookworm

Bookworm is a full-stack online bookstore application featuring a FastAPI backend and a React frontend. Browse, search, review, and purchase your favorite books.

## Features

*   User Authentication (Register, Login, Logout)
*   Browse Books with Filtering, Sorting, and Pagination ([`ShopPage.tsx`](/home/cuong/bookworm/fe-client/src/pages/ShopPage.tsx))
*   Detailed Book View Page ([`product.$id.tsx`](/home/cuong/bookworm/fe-client/src/routes/product.$id.tsx))
*   Shopping Cart Functionality ([`CartPage.tsx`](/home/cuong/bookworm/fe-client/src/pages/CartPage.tsx))
*   Book Reviews and Ratings ([`ReviewsSection.tsx`](/home/cuong/bookworm/fe-client/src/components/ReviewsSection.tsx))
*   Homepage sections for "On Sale", "Recommended", and "Popular" books ([`HomePage.tsx`](/home/cuong/bookworm/fe-client/src/pages/HomePage.tsx))

## Tech Stack

*   **Backend:** Python 3.12+, FastAPI, SQLModel, PostgreSQL, Alembic
*   **Frontend:** React, TypeScript, Vite, TanStack Router, TanStack Query, Tailwind CSS, Shadcn UI
*   **Containerization:** Docker, Docker Compose
*   **Tooling:** Make, Bun, Vitest, Prettier

## Project Structure

The project is organized into two main directories:

*   `api/`: Contains the FastAPI backend application. ([`api/README.md`](/home/cuong/bookworm/api/README.md))
*   `fe-client/`: Contains the React frontend application. ([`fe-client/README.md`](/home/cuong/bookworm/fe-client/README.md))

## Getting Started

### Prerequisites

*   Docker & Docker Compose
*   Python 3.12 or higher
*   Node.js (Bun is recommended for the frontend: `npm install -g bun`)

### Running the Backend (API)

1.  Navigate to the backend directory:
    ```bash
    cd api
    ```
2.  **Option 1: Using Docker (Recommended)**
    Start the services (API + Database):
    ```bash
    make up
    ```
3.  **Option 2: Using Local Python Environment**
    a. Set up the environment and install dependencies:
       ```bash
       make init
       ```
    b. Run database migrations:
       ```bash
       make migrate
       ```
    c. Start the API server:
       ```bash
       make run
       ```
4.  The API will be running at `http://localhost:8000`.

### Running the Frontend (Client)

1.  Navigate to the frontend directory:
    ```bash
    cd fe-client
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Start the development server:
    ```bash
    bun dev
    ```
4.  The frontend application will be available at `http://localhost:5173` (or another port indicated by Vite).

## API Documentation

Once the backend is running, you can access the interactive API documentation:

*   **Swagger UI:** `http://localhost:8000/docs`
*   **ReDoc:** `http://localhost:8000/redoc`

## Development

### Backend (`api/` directory)

*   **Initial Setup:** `make init`
*   **Run Migrations:** `make migrate`
*   **Run Tests:** `make tests`
*   **Format Code:** `make format`

(See [`api/README.md`](/home/cuong/bookworm/api/README.md) for more details)

### Frontend (`fe-client/` directory)

*   **Run Tests:** `bun run test`
*   **Build for Production:** `bun run build`
*   **Add Shadcn UI Component:** `pnpx shadcn@latest add <component_name>` (e.g., `button`)
*   **Format Code:** Uses Prettier (often integrated with IDE or run via script)

(See [`fe-client/README.md`](/home/cuong/bookworm/fe-client/README.md) for more details)

## License

This project is licensed under the MIT License.
