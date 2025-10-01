import uuid

from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types

from dotenv import load_dotenv
load_dotenv()

_session_service = InMemorySessionService()


async def run_agent(agent: Agent, query: str, user_id: str) -> str:
    """
    A reusable async function to run any ADK agent.

    Handles session creation and the async iteration loop.
    """
    APP_NAME = "ai_interview_app"
    session_id = str(uuid.uuid4()) # Create a new session for each distinct task

    # The runner is created on-the-fly for the specific agent
    runner = Runner(
        agent=agent,
        app_name=APP_NAME,
        session_service=_session_service
    )

    await _session_service.create_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )

    content = types.Content(role='user', parts=[types.Part(text=query)])

    # The async loop to get the final response
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response_text = event.content.parts[0].text
                return final_response_text
    
    # Fallback in case the loop finishes without a final response
    return ""