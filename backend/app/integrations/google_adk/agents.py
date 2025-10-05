from google.adk.agents import Agent
from google.adk.tools import google_search
from google.genai import types
from app.schemes.questions_schemes import QuestionOutAgent
from . import prompts

from dotenv import load_dotenv
load_dotenv()

MODEL = "gemini-2.0-flash"

cv_parsing_agent = Agent(
    name="cv_parsing_agent",
    model=MODEL, 
    description="A parsing agent to extract the relevant information from this CV." ,
    instruction=prompts.CV_PARSING_SYSTEM_PROMPT.template,
    generate_content_config=types.GenerateContentConfig(
      response_mime_type="application/json"
    ),
)

question_generation_agent = Agent(
    name="question_generation_agent",
    model=MODEL,
    description="Generates interview questions based on a parsed CV and a job description.",
    instruction=prompts.QUESTION_GENERATION_SYSTEM_PROMPT.template,
    generate_content_config=types.GenerateContentConfig(
        response_mime_type="application/json",
        
    ),
    output_schema=QuestionOutAgent,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True
)

