"""
Firebase Storage Configuration
"""
from firebase_admin import storage
from datetime import timedelta
from loguru import logger
from src.infrastructure.config.settings import settings

_bucket = None


def get_storage_bucket():
    """Get or create Firebase Storage bucket"""
    global _bucket
    
    if _bucket is not None:
        return _bucket
    
    try:
        bucket_name = settings.firebase_storage_bucket
        _bucket = storage.bucket(bucket_name)
        logger.info(f"Firebase Storage bucket initialized: {bucket_name}")
        return _bucket
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Storage: {e}")
        return None


def upload_to_storage(file_data: bytes, key: str) -> str:
    """
    Upload file to Firebase Storage
    
    Args:
        file_data: File content as bytes
        key: Object path in Storage
        
    Returns:
        Object key if successful
        
    Raises:
        Exception: If upload fails
    """
    bucket = get_storage_bucket()
    if not bucket:
        raise Exception("Firebase Storage not configured")
    
    try:
        blob = bucket.blob(key)
        
        # Convert BytesIO to bytes if needed
        if hasattr(file_data, 'getvalue'):
            file_bytes = file_data.getvalue()
        else:
            file_bytes = file_data
        
        blob.upload_from_string(
            file_bytes,
            content_type='application/zip'
        )
        logger.info(f"Uploaded {key} to Firebase Storage ({len(file_bytes)} bytes)")
        return key
    except Exception as e:
        logger.error(f"Failed to upload to Firebase Storage: {e}")
        raise


def download_from_storage(key: str) -> bytes:
    """
    Download file from Firebase Storage
    
    Args:
        key: Object path in Storage
        
    Returns:
        File content as bytes
        
    Raises:
        Exception: If download fails
    """
    bucket = get_storage_bucket()
    if not bucket:
        raise Exception("Firebase Storage not configured")
    
    try:
        blob = bucket.blob(key)
        return blob.download_as_bytes()
    except Exception as e:
        logger.error(f"Failed to download from Firebase Storage: {e}")
        raise


def delete_from_storage(key: str) -> bool:
    """
    Delete file from Firebase Storage
    
    Args:
        key: Object path in Storage
        
    Returns:
        True if successful
        
    Raises:
        Exception: If deletion fails
    """
    bucket = get_storage_bucket()
    if not bucket:
        raise Exception("Firebase Storage not configured")
    
    try:
        blob = bucket.blob(key)
        blob.delete()
        logger.info(f"Deleted {key} from Firebase Storage")
        return True
    except Exception as e:
        logger.error(f"Failed to delete from Firebase Storage: {e}")
        raise


def generate_presigned_url(key: str, expiration: int = 3600) -> str:
    """
    Generate signed URL for downloading
    
    Args:
        key: Object path in Storage
        expiration: URL expiration in seconds (default 1 hour)
        
    Returns:
        Signed URL
        
    Raises:
        Exception: If URL generation fails
    """
    bucket = get_storage_bucket()
    if not bucket:
        raise Exception("Firebase Storage not configured")
    
    try:
        blob = bucket.blob(key)
        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(seconds=expiration),
            method="GET"
        )
        return url
    except Exception as e:
        logger.error(f"Failed to generate signed URL: {e}")
        raise
