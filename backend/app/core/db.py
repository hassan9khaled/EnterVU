from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base



DATABASE_URL = "sqlite+pysqlite:////data/ai_interview.db"

engine = create_engine(
    DATABASE_URL, 
    # It allows the app to make multiple calls at the same time
    connect_args={"check_same_thread": False} 
)

SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

Base = declarative_base()

def get_db():

    db = SessionLocal()

    try: 
        yield db

    finally:
        db.close()