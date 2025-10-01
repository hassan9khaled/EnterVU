"""
A mock client that simulates responses from the Google ADK agents.
"""
import json
from typing import List, Dict


async def parse_cv(raw_text: str, user_id: str) -> str:
    
    mock_response = {
        "profile": "A skilled software engineer with 5 years of experience.",
        "education": [{"institution": "University of Code", "degree": "B.S. in Computer Science", "period": "2015-2019"}],
        "experience": [{"title": "Senior Developer", "company": "Tech Solutions Inc.", "description": "Developed scalable web apps."}],
        "projects": [],
        "skills": ["Python", "FastAPI", "Docker"]
    }
    return json.dumps(mock_response)


async def generate_questions(cv_text: str, job_title: str, job_description: str, user_id: str) -> str:
    
    mock_response = [
        "Based on your experience with Python, can you describe a time you optimized a slow algorithm?",
        "How would you approach designing a scalable system for a real-time application?",
        "Tell me about a time you had a disagreement with a team member. How did you resolve it?",
        f"What interests you about the {job_title} role at our company?",
        "Where do you see yourself in five years?"
    ]
    return mock_response


async def evaluate_answer(question: str, answer: str) -> str:
    
    mock_response = {"score": 8.5, "feedback": "This is a strong, well-structured answer."}
    return mock_response


async def generate_final_report(questions: List, answers: List, feedbacks: List) -> str:
    
    return "This is a detailed final report summarizing the candidate's performance."