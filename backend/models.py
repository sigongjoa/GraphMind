from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계 정의
    source_connections = relationship("Connection", foreign_keys="Connection.source_id", back_populates="source")
    target_connections = relationship("Connection", foreign_keys="Connection.target_id", back_populates="target")
    cards = relationship("Card", back_populates="concept")
    notes = relationship("Note", back_populates="concept")

class Connection(Base):
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("concepts.id", ondelete="CASCADE"))
    target_id = Column(Integer, ForeignKey("concepts.id", ondelete="CASCADE"))
    relation = Column(String)
    strength = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 정의
    source = relationship("Concept", foreign_keys=[source_id], back_populates="source_connections")
    target = relationship("Concept", foreign_keys=[target_id], back_populates="target_connections")

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id", ondelete="CASCADE"))
    question = Column(Text)
    answer = Column(Text)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계 정의
    concept = relationship("Concept", back_populates="cards")
    reviews = relationship("Review", back_populates="card")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id", ondelete="CASCADE"))
    difficulty = Column(Integer)  # 1-5 난이도 평가
    next_review_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 정의
    card = relationship("Card", back_populates="reviews")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id", ondelete="CASCADE"))
    title = Column(String)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계 정의
    concept = relationship("Concept", back_populates="notes")

class LearningHistory(Base):
    __tablename__ = "learning_history"

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id", ondelete="CASCADE"))
    activity_type = Column(String)  # "learning", "review", "note"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 정의
    concept = relationship("Concept")
