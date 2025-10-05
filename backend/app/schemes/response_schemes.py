from pydantic import BaseModel
from typing import Any, Dict, Optional


class OperationResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None