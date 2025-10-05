from sqlalchemy import Table, Column, Integer, ForeignKey
from app.core.db import Base


question_topic_table = Table(
    'question_topics',
    Base.metadata,

    Column(
        "question_id",
        Integer,
        ForeignKey("questions.id"),
        primary_key=True
    ),

    Column(
        "topic_id",
        Integer,
        ForeignKey("topics.id"),
        primary_key=True
    )
)