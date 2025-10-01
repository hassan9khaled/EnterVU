from google.adk.agents import Agent
from google.genai import types

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