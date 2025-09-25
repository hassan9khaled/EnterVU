import json
from typing import List, Dict




def generate_questions_from_llm(cv_text: str, job_title: str, job_description: str) -> List[str]:
    """
    Calls the Google AI SDK to generate interview questions.
    
    This function is responsible for creating the prompt, calling the external
    API, and parsing the response.
    """
    print("--- Calling LLM to generate questions ---")
    
    prompt = f"""
    Based on the following CV and job description, generate 5 relevant interview questions.
    The questions should cover technical skills, behavioral situations, and cultural fit.
    Return ONLY the questions as a JSON array of strings, with no other text or formatting.

    CV Text: "{cv_text}"

    Job Title: "{job_title}"
    Job Description: "{job_description}"

    Example JSON Output:
    ["What was the most challenging project you worked on and why?", "How do you handle tight deadlines?"]
    """
    
    mock_response_text = json.dumps([
        f"Based on your experience with Python, can you describe a time you optimized a slow algorithm?",
        "How would you approach designing a scalable system for a real-time application?",
        "Tell me about a time you had a disagreement with a team member. How did you resolve it?",
        f"What interests you about the {job_title} role at our company?",
        "Where do you see yourself in five years?"
    ])
    
    return json.loads(mock_response_text)


def evaluate_answer(question: str, answer: str) -> Dict:

    return {
        "score": 8.1,
        "feedback": "Great Answer"
    }

def generate_final_report(questions: List, answers: List, feedbacks: List) -> str:
    return "here is the report"