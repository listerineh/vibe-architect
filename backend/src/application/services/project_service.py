"""
Project Service - Business logic for project management
"""
from datetime import datetime
from typing import List, Dict, Optional
from loguru import logger
from src.infrastructure.config.firebase_config import get_firestore_client
from src.infrastructure.config.storage_config import upload_to_storage, download_from_storage, delete_from_storage, generate_presigned_url


class ProjectService:
    """Service for managing user projects"""
    
    def __init__(self):
        self.db = get_firestore_client()
    
    async def save_project(
        self,
        user_id: str,
        session_id: str,
        project_name: str,
        framework: str,
        architecture: str,
        zip_data: bytes,
        metadata: Dict,
        file_count: int
    ) -> str:
        """
        Save project to Firestore and R2
        
        Args:
            user_id: Firebase user ID
            session_id: Generation session ID
            project_name: Name of the project
            framework: Framework used (nextjs, react, astro)
            architecture: Architecture pattern used
            zip_data: ZIP file content as bytes
            metadata: Project metadata (focus_areas, limitations, etc.)
            file_count: Number of files in project
            
        Returns:
            Project ID
        """
        try:
            # Generate Storage key
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            storage_key = f"users/{user_id}/projects/{session_id}_{timestamp}.zip"
            
            # Upload ZIP to Firebase Storage
            upload_to_storage(zip_data, storage_key)
            logger.info(f"Uploaded project ZIP to Firebase Storage: {storage_key}")
            
            # Get ZIP size correctly (BytesIO or bytes)
            if hasattr(zip_data, 'getbuffer'):
                zip_size = zip_data.getbuffer().nbytes
            else:
                zip_size = len(zip_data)
            
            # Save metadata to Firestore
            project_data = {
                'session_id': session_id,
                'name': project_name,
                'framework': framework,
                'architecture': architecture,
                'file_count': file_count,
                'zip_size': zip_size,
                'storage_key': storage_key,
                'metadata': metadata,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # Add to Firestore
            doc_ref = self.db.collection('users').document(user_id).collection('projects').document()
            doc_ref.set(project_data)
            
            project_id = doc_ref.id
            logger.info(f"Saved project {project_id} for user {user_id}")
            
            return project_id
            
        except Exception as e:
            logger.error(f"Failed to save project: {e}")
            raise
    
    async def get_user_projects(self, user_id: str, limit: int = 50) -> List[Dict]:
        """
        Get all projects for a user
        
        Args:
            user_id: Firebase user ID
            limit: Maximum number of projects to return
            
        Returns:
            List of project metadata
        """
        try:
            projects_ref = self.db.collection('users').document(user_id).collection('projects')
            query = projects_ref.order_by('created_at', direction='DESCENDING').limit(limit)
            
            projects = []
            for doc in query.stream():
                project = doc.to_dict()
                project['id'] = doc.id
                # Convert datetime to ISO string
                if 'created_at' in project:
                    project['created_at'] = project['created_at'].isoformat()
                if 'updated_at' in project:
                    project['updated_at'] = project['updated_at'].isoformat()
                projects.append(project)
            
            logger.info(f"Retrieved {len(projects)} projects for user {user_id}")
            return projects
            
        except Exception as e:
            logger.error(f"Failed to get projects: {e}")
            raise
    
    async def get_project(self, user_id: str, project_id: str) -> Optional[Dict]:
        """
        Get a specific project
        
        Args:
            user_id: Firebase user ID
            project_id: Project ID
            
        Returns:
            Project metadata or None if not found
        """
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('projects').document(project_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            project = doc.to_dict()
            project['id'] = doc.id
            
            # Convert datetime to ISO string
            if 'created_at' in project:
                project['created_at'] = project['created_at'].isoformat()
            if 'updated_at' in project:
                project['updated_at'] = project['updated_at'].isoformat()
            
            return project
            
        except Exception as e:
            logger.error(f"Failed to get project {project_id}: {e}")
            raise
    
    async def get_download_url(self, user_id: str, project_id: str, expiration: int = 3600) -> str:
        """
        Generate presigned download URL for project ZIP
        
        Args:
            user_id: Firebase user ID
            project_id: Project ID
            expiration: URL expiration in seconds (default 1 hour)
            
        Returns:
            Presigned download URL
        """
        try:
            project = await self.get_project(user_id, project_id)
            if not project:
                raise ValueError(f"Project {project_id} not found")
            
            storage_key = project.get('storage_key')
            if not storage_key:
                raise ValueError("Project has no storage key")
            
            url = generate_presigned_url(storage_key, expiration=expiration)
            logger.info(f"Generated download URL for project {project_id}")
            
            return url
            
        except Exception as e:
            logger.error(f"Failed to generate download URL: {e}")
            raise
    
    async def delete_project(self, user_id: str, project_id: str) -> bool:
        """
        Delete a project (Firestore + R2)
        
        Args:
            user_id: Firebase user ID
            project_id: Project ID
            
        Returns:
            True if successful
        """
        try:
            # Get project to find R2 key
            project = await self.get_project(user_id, project_id)
            if not project:
                raise ValueError(f"Project {project_id} not found")
            
            # Delete from Firebase Storage
            storage_key = project.get('storage_key')
            if storage_key:
                delete_from_storage(storage_key)
                logger.info(f"Deleted ZIP from Firebase Storage: {storage_key}")
            
            # Delete from Firestore
            doc_ref = self.db.collection('users').document(user_id).collection('projects').document(project_id)
            doc_ref.delete()
            logger.info(f"Deleted project {project_id} from Firestore")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete project {project_id}: {e}")
            raise
