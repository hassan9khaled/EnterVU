from google.adk.agents import Agent, LlmAgent
from google.adk.tools import google_search, AgentTool
from google.genai import types

from app.schemes.questions_schemes import QuestionOutAgent
from app.schemes.answers_schemes import AnswerEvaluation
from app.schemes.report_schemas import FinalReportOutput
from . import prompts

from dotenv import load_dotenv
load_dotenv()

MODEL = "gemini-2.0-flash"

# TODO: Add an agent to give some advices about cv
# and export the enhanced version using artifacts

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
    model=MODEL,
    tools=[google_search],
    output_key="research_and_context",
)


question_generation_agent = LlmAgent(
    name="GeneratorAgent",
    instruction=prompts.GENERATOR_INSTRUCTION,
    model=MODEL,
    generate_content_config=types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.3,
    ),
    output_schema=QuestionOutAgent,
    output_key="final_questions",

    # NOTE: We will need to use the agent as tool and not use SequentialAgent
    # because it won't work if you have used `output_scheme`
    tools=[AgentTool(researcher_agent)],

    # NOTE: You must add those parameters if you agent has an `output_scheme`
    disallow_transfer_to_parent=True, 
    disallow_transfer_to_peers=True,
)

answer_evaluation_agent = LlmAgent(
    name="answer_evaluation_agent",
    model=MODEL,
    description="Evaluates a candidate's answer to an interview question.",
    instruction=prompts.ANSWER_EVALUATION_SYSTEM_PROMPT,
    output_schema=AnswerEvaluation,
    generate_content_config=types.GenerateContentConfig(
        response_mime_type="application/json",
    ),
    disallow_transfer_to_parent=True, 
    disallow_transfer_to_peers=True,
)

final_report_agent = LlmAgent(
    name="final_report_agent",
    model=MODEL,
    description="Acts as a hiring manager to make a final decision, write a report summary, and draft an email.",
    instruction=prompts.FINAL_REPORT_SYSTEM_PROMPT,
    output_schema=FinalReportOutput,
    generate_content_config=types.GenerateContentConfig(
        response_mime_type="application/json",
    ),
    disallow_transfer_to_parent=True, 
    disallow_transfer_to_peers=True,
)