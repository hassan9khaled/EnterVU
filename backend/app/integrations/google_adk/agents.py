from google.adk.agents import Agent, LlmAgent, SequentialAgent
from google.adk.tools import google_search, AgentTool
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
    instruction=prompts.RESEARCHER_INSTRUCTION,
    generate_content_config=types.GenerateContentConfig(
      response_mime_type="application/json"
    ),
)

researcher_agent = LlmAgent(
    name="ResearcherAgent",
    instruction=prompts.RESEARCHER_INSTRUCTION,
    model="gemini-2.0-flash",
    tools=[google_search],
    output_key="research_and_context",
)


question_generation_agent = LlmAgent(
    name="GeneratorAgent",
    instruction=prompts.GENERATOR_INSTRUCTION,
    model="gemini-2.0-flash",
    generate_content_config=types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.3,
    ),
    output_schema=QuestionOutAgent,
    output_key="final_questions",
    tools=[AgentTool(researcher_agent)],
    disallow_transfer_to_parent=True, 
    disallow_transfer_to_peers=True,
)
