import os
import json
import logging
import spacy
from threading import Thread
from kafka import KafkaConsumer, KafkaProducer
from textblob import TextBlob
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import asynccontextmanager
from fastapi import FastAPI
from datetime import datetime

# Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Spacy
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("Spacy model loaded.")
except Exception as e:
    logger.warning(f"Failed to load Spacy model: {e}")
    nlp = None

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
    entities = Column(JSON, default=[])
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Auto-migration
def run_migrations():
    with engine.connect() as conn:
        try:
            conn.execute("ALTER TABLE sentiment_history ADD COLUMN author_followers INTEGER DEFAULT 0")
        except Exception: pass
        
        try:
            conn.execute("ALTER TABLE sentiment_history ADD COLUMN impact_score FLOAT DEFAULT 0.0")
        except Exception: pass

        try:
            # Add entities JSON column
            conn.execute("ALTER TABLE sentiment_history ADD COLUMN entities JSONB DEFAULT '[]'")
            print("Added column entities")
        except Exception: pass

run_migrations()

# ... (Kafka Setup)

def analyze_sentiment():
    consumer = KafkaConsumer(
        "social-mentions",
        bootstrap_servers=os.getenv("KAFKA_BROKER", "localhost:9092"),
        auto_offset_reset='latest',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    logger.info("Analyzer Service started consuming...")

    for message in consumer:
        try:
            data = message.value
            text = data.get("content", "")
            
            # 1. Sentiment Analysis
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            # 2. NER Analysis
            entities = []
            if nlp:
                doc = nlp(text)
                # Keep only PERSON, ORG, GPE (Location)
                allowed_labels = {"PERSON", "ORG", "GPE"}
                entities = [
                    {"text": ent.text, "label": ent.label_} 
                    for ent in doc.ents 
                    if ent.label_ in allowed_labels
                ]
            
            logger.info(f"Analyzed: '{text[:20]}...' Score: {polarity} Entities: {len(entities)}")

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
                entities=entities,
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
