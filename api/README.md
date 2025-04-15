# Bookworm API

YABS with FastAPI, SQLModel and Postgres.


## Project Structure

The project follows a modular structure with clear separation of concerns, taking inspiration from :

```
fastapi-project
├── alembic/                  # Database migrations
├── src                       # Application source code
│   ├── auth/                 # Authentication module
│   ├── config.py             # Global configuration
│   ├── database.py           # Database connection
│   ├── exceptions.py         # Global exceptions
│   ├── models.py             # Global models
│   ├── pagination.py         # Pagination utilities
│   └── main.py               # Application entry point
├── docker-compose.yml        # Docker compose configuration
├── Dockerfile                # Docker image definition
├── Makefile                  # Common operations
└── requirements.txt          # Python dependencies
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.12 or higher

### Running the API

1. Clone the repository
2. Start the services using Docker Compose:

```bash
make up
```
or
Run the services with Python
```bash
make run
```

This will start the PostgreSQL database and the FastAPI application.

3. The API will be available at http://localhost:8000

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Initial Setup

```bash
make init
```

This will install dependencies and set up the development environment.

### Database Migrations

To run migrations:

```bash
make migrate
```

### Running Tests

```bash
make tests
```

### Formatting Code

```bash
make format
```

## API Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/token` - Get access token
- `GET /auth/me` - Get current user information
- `GET /auth/users` - List all users (admin only)

## License

MIT