import pytest_asyncio
import httpx
from typing import AsyncGenerator, Dict
from app.main import app 

# This dictionary will act as a simple in-memory cache to share data between tests
# For example, storing the ID of a user created in one test to be used in another.
shared_data = {}

@pytest_asyncio.fixture(scope="session")
def base_url() -> str:
    """The base URL for the running API service."""
    return "http://127.0.0.1:5000/api/v2"

@pytest_asyncio.fixture(scope="function")
async def async_client(base_url: str) -> AsyncGenerator[httpx.AsyncClient, None]:
    """A shared asynchronous HTTP client for all tests."""
    async with httpx.AsyncClient(base_url=base_url) as client:
        yield client

@pytest_asyncio.fixture(scope="session")
def test_user_payload() -> Dict:
    """A consistent payload for creating a new user."""
    # Using a timestamp to ensure the email is unique for each test run
    from datetime import datetime
    timestamp = int(datetime.now().timestamp())
    return {
        "email": f"testuser_{timestamp}@example.com",
        "name": "Test User"
    }
