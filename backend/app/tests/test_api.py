import pytest
from fastapi.testclient import TestClient
from app.main import app
from backend.app.core import db

client = TestClient(app)



@pytest.fixture(autouse=True)
def setup_and_teardown():
    db.Base.metadata.drop_all(bind=db.engine)
    db.Base.metadata.create_all(bind=db.engine)
    yield
    db.Base.metadata.drop_all(bind=db.engine)


def test_full_api_flow():



    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


    res = client.get("/")
    assert res.status_code == 200
    assert "Welcome" in res.json()["message"]

    
    user_payload = {"email": "test@example.com", "name": "Test User"}
    user_res = client.post("/users", json=user_payload)
    assert user_res.status_code == 200
    user_id = user_res.json()["id"]

   
    cv_payload = {"user_id": user_id, "raw_text": "Python developer CV text"}
    cv_res = client.post("/cvs", json=cv_payload)
    assert cv_res.status_code == 200
    cv_id = cv_res.json()["id"]

    
    interview_payload = {"user_id": user_id, "cv_id": cv_id, "job_title": "AI Engineer"}
    interview_res = client.post("/interviews", json=interview_payload)

    assert interview_res.status_code == 200
    data = interview_res.json()


    assert data["user_id"] == user_id
    assert data["cv_id"] == cv_id
    assert data["job_title"] == "AI Engineer"
    assert "score" in data
    assert "decision" in data
    assert data["decision"] == "needs_improvement" 


def test_interview_with_wrong_cv():
 
    user1_res = client.post("/users", json={"email": "u1@example.com", "name": "User One"})
    user1_id = user1_res.json()["id"]

   
    user2_res = client.post("/users", json={"email": "u2@example.com", "name": "User Two"})
    user2_id = user2_res.json()["id"]

    
    cv_payload = {"user_id": user1_id, "raw_text": "CV for user 1"}
    cv_res = client.post("/cvs", json=cv_payload)
    cv_id = cv_res.json()["id"]

    
    interview_payload = {"user_id": user2_id, "cv_id": cv_id, "job_title": "Backend Developer"}
    interview_res = client.post("/interviews", json=interview_payload)

    assert interview_res.status_code == 400  
    assert "signal" in interview_res.json()
    assert interview_res.json()["signal"] == "Cv not found for this user"
