from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.auth.router import router as auth_router
from src.author.router import router as author_router
from src.book.router import router as book_router
from src.category.router import router as category_router

app = FastAPI(
    title="Bookworm API",
    description="API for NashTech Bookworm Assignment",
    version="0.1.0",
)
"""The main FastAPI application instance."""

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(category_router)
app.include_router(author_router)
app.include_router(book_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handles uncaught exceptions globally.

    Args:
        request: The incoming request.
        exc: The exception that was raised.

    Returns:
        A JSON response with a 500 status code and the exception detail.
    """
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


@app.get("/")
def read_root():
    """Root endpoint providing a welcome message."""
    return {"message": "Welcome to Bookworm API"}


@app.get("/health")
def health_check():
    """Health check endpoint to verify service status."""
    return {"status": "ok"}
