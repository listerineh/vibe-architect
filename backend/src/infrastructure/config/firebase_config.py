"""
Firebase Admin SDK Configuration
"""
import firebase_admin
from firebase_admin import credentials, auth, firestore
from pathlib import Path
from loguru import logger
from src.infrastructure.config.settings import settings

_app = None
_db = None


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global _app, _db
    
    if _app is not None:
        return _app
    
    try:
        # Try to use service account key file
        cred_path = settings.firebase_service_account_key
        
        if cred_path and Path(cred_path).exists():
            cred = credentials.Certificate(cred_path)
            _app = firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized with service account")
        else:
            # Use default credentials (for local development)
            _app = firebase_admin.initialize_app()
            logger.info("Firebase initialized with default credentials")
        
        _db = firestore.client()
        return _app
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise


def get_firestore_client():
    """Get Firestore client instance"""
    global _db
    if _db is None:
        initialize_firebase()
    return _db


def verify_id_token(id_token: str) -> dict:
    """
    Verify Firebase ID token and return decoded token
    
    Args:
        id_token: Firebase ID token from client
        
    Returns:
        Decoded token with user information
        
    Raises:
        ValueError: If token is invalid
    """
    try:
        if _app is None:
            initialize_firebase()
            
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise ValueError(f"Invalid token: {str(e)}")


def get_user(uid: str):
    """Get user by UID"""
    try:
        if _app is None:
            initialize_firebase()
        return auth.get_user(uid)
    except Exception as e:
        logger.error(f"Failed to get user {uid}: {e}")
        raise
