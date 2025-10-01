from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types

from app.integrations.templates import CV_PARSING_SYSTEM_PROMPT

from dotenv import load_dotenv
load_dotenv()


MODEL = "gemini-2.0-flash"
APP_NAME = "parsing_app"
instruction = CV_PARSING_SYSTEM_PROMPT.template
translation_agent = Agent(
    name="parsing_agent",
    model=MODEL, 
    description="A parsing agent to extract the relevant information from this CV." ,
    instruction=instruction,
    generate_content_config=types.GenerateContentConfig(
      response_mime_type="application/json"
    ),
)

session_service = InMemorySessionService() 
runner = Runner(
    agent=translation_agent,
    app_name=APP_NAME,
    session_service=session_service 
)

async def call_agent(query: str, user_id: str, session_id: str):
    """
    Call the agent and extract it's response
    """
    await session_service.create_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
    
    content = types.Content(role='user', parts=[types.Part(text=query)])

    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response_text = event.content.parts[0].text
                return final_response_text
             
    
async def parse_cv(raw_text: str, user_id: str, session_id: str):

    return await call_agent(query=raw_text, user_id=user_id, session_id=session_id)

