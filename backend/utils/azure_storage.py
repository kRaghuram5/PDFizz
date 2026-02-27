"""
Azure Blob Storage utility functions for PDFizz
Handles file uploads, downloads, and cleanup
"""

import os
from typing import BinaryIO, Optional
import logging

try:
    from azure.storage.blob import BlobServiceClient, BlobClient
    from azure.core.exceptions import AzureError
    HAVE_AZURE = True
except ImportError:
    HAVE_AZURE = False

logger = logging.getLogger(__name__)


class AzureStorageManager:
    """Manages file operations with Azure Blob Storage"""
    
    def __init__(self):
        """Initialize Azure Blob Storage client"""
        try:
            connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
            self.container_name = os.getenv('AZURE_STORAGE_CONTAINER_NAME', 'pdfizz-uploads')
            
            if not connection_string:
                raise ValueError("AZURE_STORAGE_CONNECTION_STRING not set")
            
            self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            self.container_client = self.blob_service_client.get_container_client(self.container_name)
            logger.info(f"Azure Storage initialized for container: {self.container_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Azure Storage: {str(e)}")
            raise

    def upload_file(self, file_path: str, blob_name: str) -> str:
        """
        Upload a file to Azure Blob Storage
        
        Args:
            file_path: Local file path
            blob_name: Name/path in blob storage (e.g., 'uploads/file.pdf')
            
        Returns:
            Blob name (path in storage)
        """
        try:
            with open(file_path, 'rb') as data:
                self.container_client.upload_blob(name=blob_name, data=data, overwrite=True)
            logger.info(f"Uploaded {blob_name} to Azure")
            return blob_name
        except AzureError as e:
            logger.error(f"Azure error uploading {blob_name}: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise

    def download_file(self, blob_name: str, local_path: str) -> None:
        """
        Download a file from Azure Blob Storage
        
        Args:
            blob_name: Name/path in blob storage
            local_path: Local path to save file
        """
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name, 
                blob=blob_name
            )
            
            with open(local_path, 'wb') as file:
                file.write(blob_client.download_blob().readall())
            
            logger.info(f"Downloaded {blob_name} from Azure")
        except AzureError as e:
            logger.error(f"Azure error downloading {blob_name}: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error downloading file: {str(e)}")
            raise

    def download_blob_to_bytes(self, blob_name: str):
        """
        Download a blob and return as bytes
        
        Args:
            blob_name: Name/path in blob storage
            
        Returns:
            BytesIO object containing blob data
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name, 
                blob=blob_name
            )
            
            blob_data = blob_client.download_blob().readall()
            logger.info(f"Downloaded {blob_name} from Azure to memory")
            return blob_data
        except AzureError as e:
            logger.error(f"Azure error downloading {blob_name}: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error downloading blob to bytes: {str(e)}")
            raise

    def delete_file(self, blob_name: str) -> None:
        """
        Delete a file from Azure Blob Storage
        
        Args:
            blob_name: Name/path in blob storage
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            blob_client.delete_blob()
            logger.info(f"Deleted {blob_name} from Azure")
        except AzureError as e:
            logger.error(f"Azure error deleting {blob_name}: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            raise

    def file_exists(self, blob_name: str) -> bool:
        """Check if file exists in Azure Blob Storage"""
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            return blob_client.exists()
        except Exception as e:
            logger.error(f"Error checking if file exists: {str(e)}")
            return False

    def list_blobs(self, prefix: str = "") -> list:
        """
        List all blobs in container with optional prefix
        
        Args:
            prefix: Optional prefix to filter blobs
            
        Returns:
            List of blob names
        """
        try:
            blobs = self.container_client.list_blobs(name_starts_with=prefix)
            return [blob.name for blob in blobs]
        except Exception as e:
            logger.error(f"Error listing blobs: {str(e)}")
            return []

    def get_blob_url(self, blob_name: str) -> str:
        """Get the URL for a blob (without SAS token - private access)"""
        account_name = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
        return f"https://{account_name}.blob.core.windows.net/{self.container_name}/{blob_name}"


# Global instance
_azure_storage = None


def get_azure_storage() -> Optional[AzureStorageManager]:
    """Get or create Azure Storage instance"""
    global _azure_storage
    if _azure_storage is None:
        use_azure = os.getenv('USE_AZURE_STORAGE', 'false').lower() == 'true'
        if use_azure:
            if not HAVE_AZURE:
                logger.warning(
                    "USE_AZURE_STORAGE=true but azure-storage-blob is not installed. "
                    "Install it with:  pip install azure-storage-blob"
                )
                return None
            try:
                _azure_storage = AzureStorageManager()
            except Exception as e:
                logger.error(f"Failed to initialize Azure Storage: {str(e)}")
                return None
    return _azure_storage
