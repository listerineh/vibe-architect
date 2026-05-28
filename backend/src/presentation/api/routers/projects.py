"""
Project Management API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
from src.presentation.api.middleware.auth_middleware import get_current_user, security
from src.application.services.project_service import ProjectService
from src.infrastructure.adapters.memory_cache import MemoryCache
from loguru import logger

router = APIRouter(prefix="/projects", tags=["projects"])
project_service = ProjectService()
cache = MemoryCache()


# Request/Response Models
class SaveProjectRequest(BaseModel):
    session_id: str
    project_name: str
    framework: str
    architecture: str


class ProjectResponse(BaseModel):
    id: str
    session_id: str
    name: str
    framework: str
    architecture: str
    file_count: int
    zip_size: int
    metadata: dict
    created_at: str
    updated_at: str


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int


class DownloadUrlResponse(BaseModel):
    url: str
    expires_in: int


@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_project(
    request: SaveProjectRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Save a generated project for the authenticated user
    
    Requires:
    - Valid Firebase auth token
    - Session ID from a completed generation
    """
    try:
        user_id = current_user['uid']
        session_id = request.session_id
        
        logger.info(f"💾 Attempting to save project for session: {session_id}")
        logger.info(f"👤 User ID: {user_id}")
        
        # Get ZIP from cache
        zip_data = cache.get_zip(session_id)
        logger.info(f"📦 ZIP data found: {zip_data is not None}")
        if not zip_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No ZIP found for session {session_id}. Generate a project first."
            )
        
        # Get boilerplate from cache
        boilerplate = cache.get(session_id)
        if not boilerplate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No metadata found for session {session_id}"
            )
        
        metadata = {
            'focus_areas': boilerplate.cursor_rules.focus_areas if boilerplate.cursor_rules else [],
            'known_limitations': boilerplate.known_limitations or [],
            'cost_optimizations': boilerplate.cost_optimizations or []
        }
        
        file_count = len(boilerplate.file_structure) if boilerplate.file_structure else 0
        
        # Save project
        project_id = await project_service.save_project(
            user_id=user_id,
            session_id=session_id,
            project_name=request.project_name,
            framework=request.framework,
            architecture=request.architecture,
            zip_data=zip_data,
            metadata=metadata,
            file_count=file_count
        )
        
        return {
            "project_id": project_id,
            "message": "Project saved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to save project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save project: {str(e)}"
        )


@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all projects for the authenticated user
    
    Query params:
    - limit: Maximum number of projects to return (default 50)
    """
    try:
        user_id = current_user['uid']
        projects = await project_service.get_user_projects(user_id, limit=limit)
        
        return {
            "projects": projects,
            "total": len(projects)
        }
        
    except Exception as e:
        logger.error(f"Failed to list projects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list projects: {str(e)}"
        )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific project by ID
    """
    try:
        user_id = current_user['uid']
        project = await project_service.get_project(user_id, project_id)
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project {project_id} not found"
            )
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get project: {str(e)}"
        )


@router.get("/{project_id}/download", response_model=DownloadUrlResponse)
async def get_download_url(
    project_id: str,
    expiration: int = 3600,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a presigned download URL for the project ZIP
    
    Query params:
    - expiration: URL expiration in seconds (default 3600 = 1 hour)
    """
    try:
        user_id = current_user['uid']
        url = await project_service.get_download_url(user_id, project_id, expiration)
        
        return {
            "url": url,
            "expires_in": expiration
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to generate download URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download URL: {str(e)}"
        )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a project (removes from Firestore and R2)
    """
    try:
        user_id = current_user['uid']
        await project_service.delete_project(user_id, project_id)
        
        return Response(status_code=status.HTTP_204_NO_CONTENT)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to delete project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete project: {str(e)}"
        )
