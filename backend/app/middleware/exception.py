import traceback
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle FastAPI / Starlette HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": str(request.url),
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic request validation errors — return readable messages."""
    errors = []
    for err in exc.errors():
        field = " → ".join(str(e) for e in err["loc"])
        errors.append({"field": field, "message": err["msg"]})

    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "status_code": 422,
            "detail": "Validation failed",
            "errors": errors,
            "path": str(request.url),
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all for unexpected server errors — never leak tracebacks to client."""
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "status_code": 500,
            "detail": "Internal server error. Please try again.",
            "path": str(request.url),
        },
    )
