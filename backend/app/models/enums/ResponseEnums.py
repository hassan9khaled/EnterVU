from enum import Enum

class OperationStatus(str, Enum):

    SUCCESS = "completed successfully"
    CREATED = "created successfully"
    UPDATED = "updated successfully"
    DELETED = "deleted successfully"
    RENAMED = "renamed successfully"