import os.path
import base64
from google.auth.transport.requests import Request
from email.message import EmailMessage
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build, Resource
from googleapiclient.errors import HttpError

from app.controllers.BaseController import BaseController

from fastapi import HTTPException, status

from typing import Optional

SCOPES = ["https://mail.google.com/"]

CREDS_PATH = BaseController().creds_dir

TOKEN_FILE = os.path.join(CREDS_PATH, "token.json")
CREDENTIALS_FILE = os.path.join(CREDS_PATH, "credentials.json")

class EmailService:

    def __init__(self):

        self.credentials = self._get_credentials()
        self.service = self._build_service()

    def _get_credentials(self) -> Optional[Credentials]:

        # Authenticates user via token.json or a new OAuth2 flow.
        creds = None
        try:
            if os.path.exists(TOKEN_FILE):
                creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        CREDENTIALS_FILE, SCOPES
                    )
                    creds = flow.run_local_server(port=0)

                with open(TOKEN_FILE, "w") as token:
                    token.write(creds.to_json())
            return creds
        except Exception as e:
            print(f"Error during authentication: {e}")
            return None

    def _build_service(self) -> Optional[Resource]:

        # Builds the authorized Google Drive API service object.
        if not self.credentials:
            print("Cannot build service without valid credentials.")
            return None
        try:
            return build("gmail", "v1", credentials=self.credentials)
        except HttpError as error:
            print(f"An error occurred while building the service: {error}")
            return None
    
    def send_email(self, user_email: str, subject: str, body: str):

        # Use MIMEText to create the email body
        message = EmailMessage()

        message.set_content(body, subtype='html')
        
        profile = self.service.users().getProfile(userId='me').execute()
        sender_email = profile['emailAddress']

        message["To"] = user_email
        message["From"] = sender_email
        message["Subject"] = subject

        # Encode the message in base64url.
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        create_message = {"raw": encoded_message}

        sent_to_email = (
            self.service.users().messages().send(userId="me", body=create_message).execute()
        )

        if not sent_to_email:
           raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to send the Email")

        return True   