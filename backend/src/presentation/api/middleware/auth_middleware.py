"""
Authentication Middleware for FastAPI
"""
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from src.infrastructure.config.firebase_config import verify_id_token
from loguru import logger

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify Firebase token and return user info
    
    Args:
        credentials: HTTP Bearer token
        
    Returns:
        Decoded token with user information
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        token = credentials.credentials
        decoded_token = verify_id_token(token)
        return decoded_token
    except ValueError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )


async def get_current_user_optional(request: Request) -> Optional[dict]:
    """
    Get current user if authenticated, None otherwise
    Useful for optional authentication
    
    Args:
        request: FastAPI request
        
    Returns:
        Decoded token or None
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    try:
        token = auth_header.replace("Bearer ", "")
        decoded_token = verify_id_token(token)
        return decoded_token
    except Exception:
        return None
