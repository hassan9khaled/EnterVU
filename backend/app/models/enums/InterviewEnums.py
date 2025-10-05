from enum import Enum
import random

class InterviewStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class InterviewDecision(str, Enum):
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    NEEDS_IMPROVEMENT = "needs_improvement"


class InterviewMode(str, Enum):
    """
    Enum to define the difficulty modes for an interview.
    Each mode corresponds to a specific range for the number of questions.
    """
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

    def get_question_count(self) -> int:
        """
        Returns a random number of questions based on the selected mode.
        """
        if self == self.EASY:
            return random.randint(3, 5)
        elif self == self.MEDIUM:
            return random.randint(6, 10)
        elif self == self.HARD:
            return random.randint(11, 15)
