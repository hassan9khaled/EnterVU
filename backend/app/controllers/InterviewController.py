from fastapi import HTTPException, status
from sqlalchemy.orm import Session


from app.schemes.questions_schemes import QuestionOut
from app.services import user_service, cv_service, interview_service, question_service, answer_service, report_service
from app.models.db_schemes import Interview, Question
from app.models import InterviewDecision, InterviewStatus
from app.schemes.interview_schemes import InterviewCreate
from app.schemes.answers_schemes import AnswerCreate
from app.integrations import adk
from app.controllers import DataController


def start_interview(db: Session, interview_data: InterviewCreate) -> Interview:
    """
    This is the main business logic for starting an interview.
    It orchestrates validation, AI question generation, and database saving.
    """
    # 1. Validate the inputs by calling the specialist services
    user = user_service.get_user(db, user_id=interview_data.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    cv = cv_service.get_cv_by_id_and_user(db, cv_id=interview_data.cv_id, user_id=interview_data.user_id)
    if not cv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found for this user")

    # 2. Call the external AI integration to generate questions
    question_texts = adk.generate_questions_from_llm(
        cv_text=cv.raw_text,
        job_title=interview_data.job_title,
        job_description=interview_data.job_description
    )

    # --- Database Transaction Starts Here ---
    # The controller manages the entire transaction.

    # 3. Call the interview service to create the main record
    db_interview = interview_service.create_interview_session(db, interview_data)
    
    # 4. Create the Question objects linked to the interview
    questions_to_add = [
        Question(text=text, order=index + 1) 
        for index, text in enumerate(question_texts)
    ]

    # 5. Append the children to the parent's relationship list.
    #    SQLAlchemy now knows these questions belong to this interview.

    db_interview.questions.extend(questions_to_add)
    db.add(db_interview)
    
    # 6. Commit the transaction ONLY after all steps have succeeded
    db.commit()
    
    # 7. Refresh the object to load the newly created questions
    db.refresh(db_interview)
    
    return db_interview

def get_next_question(db: Session, interview_id: int) -> QuestionOut:

    db_interview = interview_service.get_interview_by_id(db=db,interview_id=interview_id)

    if not db_interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview Not Found")
    
    if db_interview.status == "COMPLETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This interview has already been completed.")
    
    next_question = question_service.get_next_unanswered_question(db=db, interview_id=interview_id)

    if not next_question:
        return {
            "message": "All questions have been answered. Please finish the interview."
        }
    
    return next_question

def submit_answer(db: Session, interview_id: int, answer_data: AnswerCreate):
    
    db_interview = interview_service.get_interview_by_id(db=db,interview_id=interview_id)

    if not db_interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview Not Found")
    
    if db_interview.status == "COMPLETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This interview has already been completed.")
        
    db_question = question_service.get_question_by_id(db = db,
                                                      question_id = answer_data.question_id, 
                                                      interview_id = interview_id)
    
    if not db_question:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question Not Found")
    
    if db_question.interview_id != interview_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This question does not belong to the specified interview.")
    
    if db_question.answer is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This question has already been answered.")


    # Call the AI to evaluate the answer
    evaluation = adk.evaluate_answer(
        question=db_question.text, 
        answer=answer_data.user_answer
    )

    # Create the answer record in the database
    db_answer = answer_service.create_answer(
        db=db,
        question_id=answer_data.question_id,
        user_answer=answer_data.user_answer,
        score=evaluation.get("score"),
        feedback=evaluation.get("feedback")
    )

    db.commit()

    db.refresh(db_answer)


    return db_answer

def finish_interview(db: Session, interview_id: int):
     
    db_interview = interview_service.get_interview_by_id(
         db=db,
         interview_id=interview_id
    )
    if not db_interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview Not Found")
    
    if db_interview.report is not None:
        return db_interview

    db_questions = question_service.get_questions_by_interview_id(db=db, interview_id=interview_id)
    
    db_answers = answer_service.get_all_answers_for_interview(db=db, interview_id=interview_id)

    if not db_questions or len(db_answers) != len(db_questions):
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interview isn't finished yet!")
    
    total_score = sum(answer.score for answer in db_answers if answer.score is not None)
    final_score = total_score / len(db_answers) if db_answers else 0

    if final_score >= 7:
        decision = InterviewDecision.ACCEPTED.value
    elif final_score >= 5:
        decision = InterviewDecision.NEEDS_IMPROVEMENT.value
    else:
        decision = InterviewDecision.REJECTED.value

    report_content = adk.generate_final_report(
        questions=db_questions,
        answers=db_answers,
        feedbacks="feedbacks for each answer"
    )
    data_controller = DataController()

    file_path, res = data_controller.generate_unique_filepath(
        orig_file_name="",
        user_id=db_interview.user_id,
        interview_id=interview_id
    )

    with open(file_path, "w+") as report_file:
        report_file.write(report_content)

    db_interview = interview_service.update_interview_as_completed(
        db=db,
        interview=db_interview,
        score=final_score,
        decision=decision,
    )

    db_report = report_service.create_report(
        db=db,
        interview=db_interview,
        report_content=report_content,
        file_path=file_path
    )

    db.commit()

    db.refresh(db_interview)

    return db_interview



