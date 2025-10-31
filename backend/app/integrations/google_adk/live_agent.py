import json
import base64

from google.adk.runners import InMemoryRunner
from google.adk.agents import LiveRequestQueue
from google.adk.agents.run_config import RunConfig

from google.genai import types
from google.genai.types import Part
from google.adk.agents import LlmAgent
from google.adk.tools.openapi_tool.openapi_spec_parser.openapi_toolset import OpenAPIToolset


from prompts import LIVE_AGENT_SYSTEM_PROMPT

from dotenv import load_dotenv
load_dotenv()

MODEL = "gemini-2.0-flash"

with open("ApiScheme.json", "r") as f:
    openapi_spec_dict = json.load(f)

toolset = OpenAPIToolset(spec_dict=openapi_spec_dict)

interview_agent = LlmAgent(
   name="Interview_Prep_Coach",
   model="gemini-2.0-flash-live-001",
   description="This agent acts as a personal interview coach.",
   instruction=LIVE_AGENT_SYSTEM_PROMPT,
   tools=[toolset]
)

APP_NAME = "ai_interview_app"

async def start_agent_session(user_id: str, interview_id: int):
    """Starts an agent session"""

    # Create a Runner
    runner = InMemoryRunner(
        app_name=APP_NAME,
        agent=interview_agent,
    )
    # Create a Session
    session = await runner.session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        state={
            "user:interview_id": interview_id
        }
    )


    run_config = RunConfig(
        response_modalities=["AUDIO"],
        session_resumption=types.SessionResumptionConfig()
    )

    # Create a LiveRequestQueue for this session
    live_request_queue = LiveRequestQueue()

    # Start agent session
    live_events = runner.run_live(
        session=session,
        live_request_queue=live_request_queue,
        run_config=run_config,
    )
    return live_events, live_request_queue


async def agent_to_client_sse(live_events):
    """Agent to client communication via SSE"""
    async for event in live_events:
        
        if event.turn_complete or event.interrupted:
            message = {
                "turn_complete": event.turn_complete,
                "interrupted": event.interrupted,
            }
            yield f"data: {json.dumps(message)}\n\n"
            print(f"[AGENT TO CLIENT]: {message}")
            continue

        
        part: Part = (
            event.content and event.content.parts and event.content.parts[0]
        )
        if not part:
            continue

        
        is_audio = part.inline_data and part.inline_data.mime_type.startswith("audio/pcm")
        if is_audio:
            audio_data = part.inline_data and part.inline_data.data
            if audio_data:
                message = {
                    "mime_type": "audio/pcm",
                    "data": base64.b64encode(audio_data).decode("ascii")
                }
                yield f"data: {json.dumps(message)}\n\n"
                print(f"[AGENT TO CLIENT]: audio/pcm: {len(audio_data)} bytes.")
                continue
