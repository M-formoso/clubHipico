from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.api import api_router
import json

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler para errores de validación 422"""
    import sys

    errors = exc.errors()

    # Log a stderr para que aparezca en los logs
    sys.stderr.write("=" * 80 + "\n")
    sys.stderr.write("VALIDATION ERROR 422:\n")
    sys.stderr.write(f"URL: {request.url}\n")
    sys.stderr.write(f"Method: {request.method}\n")
    sys.stderr.write(f"Validation errors:\n")
    sys.stderr.write(json.dumps(errors, indent=2) + "\n")
    sys.stderr.write("=" * 80 + "\n")
    sys.stderr.flush()

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": errors},
    )

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Sistema de Gestión Club Ecuestre API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
