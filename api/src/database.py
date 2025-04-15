import os

from dotenv import load_dotenv
from sqlmodel import Session, create_engine

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))


def get_session():
    with Session(engine) as session:
        yield session
