import pytest
from httpx import AsyncClient
from .conftest import shared_data

@pytest.mark.asyncio
@pytest.mark.dependency()
async def test_create_user(async_client: AsyncClient, test_user_payload: dict):
    """
    Test creating a new user. This test is marked as a dependency for other tests.
    """
    response = await async_client.post("/users/", json=test_user_payload)
    assert response.status_code == 201, "Expected status code 201 (Created)"
    
    data = response.json()
    assert data["email"] == test_user_payload["email"]
    assert data["name"] == test_user_payload["name"]
    assert "id" in data
    
    # Save the new user's ID to be used by dependent tests
    shared_data["user_id"] = data["id"]


@pytest.mark.asyncio
@pytest.mark.dependency(depends=["test_create_user"])
async def test_list_users(async_client: AsyncClient, test_user_payload: dict):
    """
    Test listing all users and ensure the newly created user is in the list.
    This test depends on 'test_create_user' successfully running first.
    """
    response = await async_client.get("/users/")
    assert response.status_code == 200
    
    users = response.json()
    assert isinstance(users, list)
    
    # Check if our newly created user is present in the list
    emails = [user["email"] for user in users]
    assert test_user_payload["email"] in emails


@pytest.mark.asyncio
@pytest.mark.dependency(depends=["test_create_user"])
async def test_get_user(async_client: AsyncClient, test_user_payload: dict):
    """
    Test fetching a specific user by their ID.
    """
    user_id = shared_data.get("user_id")
    assert user_id is not None, "User ID should have been set by the create_user test"

    response = await async_client.get(f"/users/{user_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == test_user_payload["email"]
