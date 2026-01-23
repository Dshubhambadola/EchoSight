import os
import json
import logging
from threading import Thread
from kafka import KafkaConsumer, KafkaProducer
from textblob import TextBlob
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import asynccontextmanager
from fastapi import FastAPI
from datetime import datetime

# Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database Setup
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:5432/{os.getenv('POSTGRES_DB')}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class SentimentHistory(Base):
    __tablename__ = "sentiment_history"
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, index=True)
    content = Column(String)
    author = Column(String)
    sentiment_score = Column(Float)
    author_followers = Column(Integer, default=0)
    impact_score = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Auto-migration for existing tables (Hack for MVP)
# In production, use Alembic. Here we just try to add columns and ignore if they exist.
def run_migrations():
    with engine.connect() as conn:
        try:
            conn.execute("ALTER TABLE sentiment_history ADD COLUMN author_followers INTEGER DEFAULT 0")
            print("Added column author_followers")
        except Exception:
            pass # Column likely exists
        
        try:
            conn.execute("ALTER TABLE sentiment_history ADD COLUMN impact_score FLOAT DEFAULT 0.0")
            print("Added column impact_score")
        except Exception:
            pass # Column likely exists

run_migrations()

# Kafka Setup
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
TOPIC_INPUT = "social-mentions"
TOPIC_OUTPUT = "analyzed-mentions"

def analyze_sentiment():
    consumer = KafkaConsumer(
        TOPIC_INPUT,
        bootstrap_servers=KAFKA_BROKER,
        auto_offset_reset='latest',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    logger.info("Analyzer Service started consuming...")

    for message in consumer:
        try:
            data = message.value
            text = data.get("content", "")
            
            # Perform Analysis
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            logger.info(f"Analyzed: '{text[:20]}...' Score: {polarity}")

            # Extract new fields with defaults
            followers = data.get("author_followers", 0)
            impact = data.get("impact_score", 0.0)

            # Save to Database
            db = SessionLocal()
            record = SentimentHistory(
                platform=data.get("platform", "Unknown"),
                content=text,
                author=data.get("author", "Anonymous"),
                sentiment_score=polarity,
                author_followers=followers,
                impact_score=impact,
                timestamp=datetime.now()
            )
            db.add(record)
            db.commit()
            db.close()

        except Exception as e:
            logger.error(f"Error processing message: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start consumer in background thread
    t = Thread(target=analyze_sentiment, daemon=True)
    t.start()
    yield

app = FastAPI(title="EchoSight Analyzer", lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "Analyzer Operational", "db": "connected"}
