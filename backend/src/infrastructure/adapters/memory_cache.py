"""Simple in-memory cache for boilerplate previews"""
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional
from io import BytesIO
from src.domain.entities.project import Boilerplate


class MemoryCache:
    """Thread-safe in-memory cache with TTL"""
    
    def __init__(self, ttl_minutes: int = 30):
        self._cache: Dict[str, tuple[Boilerplate, BytesIO, datetime]] = {}
        self._ttl = timedelta(minutes=ttl_minutes)
    
    def set(self, boilerplate: Boilerplate, zip_buffer: BytesIO = None) -> str:
        """
        Store boilerplate (and optionally ZIP) and return session ID
        
        Args:
            boilerplate: The boilerplate to cache
            zip_buffer: Optional pre-generated ZIP file
            
        Returns:
            str: Unique session ID
        """
        session_id = str(uuid.uuid4())
        expiry = datetime.now() + self._ttl
        self._cache[session_id] = (boilerplate, zip_buffer, expiry)
        self._cleanup_expired()
        return session_id
    
    def get(self, session_id: str) -> Optional[Boilerplate]:
        """
        Retrieve boilerplate by session ID
        
        Args:
            session_id: The session ID to look up
            
        Returns:
            Boilerplate if found and not expired, None otherwise
        """
        if session_id not in self._cache:
            return None
        
        boilerplate, _, expiry = self._cache[session_id]
        
        if datetime.now() > expiry:
            del self._cache[session_id]
            return None
        
        return boilerplate
    
    def get_zip(self, session_id: str) -> Optional[BytesIO]:
        """
        Retrieve ZIP buffer by session ID
        
        Args:
            session_id: The session ID to look up
            
        Returns:
            BytesIO if found and not expired, None otherwise
        """
        if session_id not in self._cache:
            return None
        
        _, zip_buffer, expiry = self._cache[session_id]
        
        if datetime.now() > expiry:
            del self._cache[session_id]
            return None
        
        return zip_buffer
    
    def _cleanup_expired(self):
        """Remove expired entries from cache"""
        now = datetime.now()
        expired_keys = [
            key for key, (_, _, expiry) in self._cache.items()
            if now > expiry
        ]
        for key in expired_keys:
            del self._cache[key]
    
    def clear(self):
        """Clear all cached data"""
        self._cache.clear()
