---
name: python-fastapi
description: Python and FastAPI best practices for async APIs, type hints, dependency injection, and project structure. Use when working with Python backend or FastAPI applications.
license: MIT
metadata:
  author: VibeArchitect
  version: "1.0"
---

# Python & FastAPI Development Guide

Modern Python development with FastAPI, async patterns, type hints, and best practices.

## Project Structure

```
project/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings
│   ├── dependencies.py      # DI
│   ├── models/              # Pydantic models
│   │   ├── __init__.py
│   │   └── user.py
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   ├── users.py
│   │   └── auth.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   └── user_service.py
│   └── database/            # DB setup
│       ├── __init__.py
│       └── session.py
├── tests/
├── requirements.txt
└── .env
```

---

## FastAPI Basics

### Application Setup

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, auth
from app.config import settings

app = FastAPI(
    title="My API",
    description="API description",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Configuration

```python
# app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

---

## Pydantic Models

```python
# app/models/user.py
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class UserInDB(UserBase):
    id: int
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # For SQLAlchemy models

class UserResponse(UserInDB):
    pass
```

---

## Routers & Endpoints

```python
# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.models.user import UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService
from app.dependencies import get_db, get_current_user

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user"""
    service = UserService(db)
    return await service.create_user(user)

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List all users (authenticated)"""
    service = UserService(db)
    return await service.get_users(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    service = UserService(db)
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update user"""
    service = UserService(db)
    return await service.update_user(user_id, user_update)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete user"""
    service = UserService(db)
    await service.delete_user(user_id)
```

---

## Dependency Injection

```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.database.session import SessionLocal
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Fetch user from database
    from app.services.user_service import UserService
    service = UserService(db)
    user = await service.get_user(user_id)
    
    if user is None:
        raise credentials_exception
    
    return user
```

---

## Services Layer

```python
# app/services/user_service.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.models.user import UserCreate, UserUpdate
from app.database.models import User
from app.utils.security import hash_password

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        hashed_password = hash_password(user_data.password)
        
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user
    
    async def get_user(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        stmt = select(User).where(User.id == user_id)
        result = self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        stmt = select(User).offset(skip).limit(limit)
        result = self.db.execute(stmt)
        return result.scalars().all()
    
    async def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        """Update user"""
        user = await self.get_user(user_id)
        if not user:
            raise ValueError("User not found")
        
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    async def delete_user(self, user_id: int) -> None:
        """Delete user"""
        user = await self.get_user(user_id)
        if not user:
            raise ValueError("User not found")
        
        self.db.delete(user)
        self.db.commit()
```

---

## Database Setup

```python
# app/database/session.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# app/database/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

---

## Authentication

```python
# app/utils/security.py
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt

# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.utils.security import verify_password, create_access_token
from app.services.user_service import UserService

router = APIRouter()

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    service = UserService(db)
    user = await service.get_user_by_username(form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
```

---

## Error Handling

```python
# app/main.py
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
```

---

## Testing

```python
# tests/test_users.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.session import Base
from app.dependencies import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_user():
    response = client.post(
        "/api/users/",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_get_user():
    response = client.get("/api/users/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
```

---

## Async Best Practices

```python
# ✅ Use async/await consistently
async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()

# ✅ Async database operations
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

async_engine = create_async_engine("postgresql+asyncpg://...")

async def get_user_async(user_id: int, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

# ✅ Background tasks
from fastapi import BackgroundTasks

@router.post("/send-email")
async def send_email(
    email: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email_task, email)
    return {"message": "Email will be sent"}

async def send_email_task(email: str):
    # Send email logic
    pass
```

---

## Common Patterns

```python
# ✅ Repository pattern
class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

# ✅ Use type hints everywhere
from typing import List, Optional, Dict, Any

def process_data(items: List[Dict[str, Any]]) -> Optional[str]:
    if not items:
        return None
    return items[0].get("name")

# ✅ Use dataclasses for simple data structures
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float
    
    def distance_from_origin(self) -> float:
        return (self.x ** 2 + self.y ** 2) ** 0.5
```

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)
