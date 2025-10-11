from enum import Enum

class QuestionType(str, Enum):

    SITUATIONAL = "situational"
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"