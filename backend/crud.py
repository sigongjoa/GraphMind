from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timedelta
import models
import schemas
import math

# 개념 CRUD 함수
def get_concept(db: Session, concept_id: int):
    return db.query(models.Concept).filter(models.Concept.id == concept_id).first()

def get_concept_by_name(db: Session, name: str):
    return db.query(models.Concept).filter(models.Concept.name == name).first()

def get_concepts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Concept).offset(skip).limit(limit).all()

def create_concept(db: Session, concept: schemas.ConceptCreate):
    db_concept = models.Concept(name=concept.name, description=concept.description)
    db.add(db_concept)
    db.commit()
    db.refresh(db_concept)
    return db_concept

def update_concept(db: Session, concept_id: int, concept: schemas.ConceptUpdate):
    db_concept = get_concept(db, concept_id)
    update_data = concept.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_concept, key, value)
    db.commit()
    db.refresh(db_concept)
    return db_concept

def delete_concept(db: Session, concept_id: int):
    db_concept = get_concept(db, concept_id)
    db.delete(db_concept)
    db.commit()
    return db_concept

# 연결 CRUD 함수
def get_connection(db: Session, connection_id: int):
    return db.query(models.Connection).filter(models.Connection.id == connection_id).first()

def get_connections(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Connection).offset(skip).limit(limit).all()

def get_connections_by_concept(db: Session, concept_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Connection).filter(
        or_(
            models.Connection.source_id == concept_id,
            models.Connection.target_id == concept_id
        )
    ).offset(skip).limit(limit).all()

def create_connection(db: Session, connection: schemas.ConnectionCreate):
    db_connection = models.Connection(
        source_id=connection.source_id,
        target_id=connection.target_id,
        relation=connection.relation,
        strength=connection.strength
    )
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    return db_connection

def delete_connection(db: Session, connection_id: int):
    db_connection = get_connection(db, connection_id)
    db.delete(db_connection)
    db.commit()
    return db_connection

# 카드 CRUD 함수
def get_card(db: Session, card_id: int):
    return db.query(models.Card).filter(models.Card.id == card_id).first()

def get_cards(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Card).offset(skip).limit(limit).all()

def get_cards_by_concept(db: Session, concept_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Card).filter(models.Card.concept_id == concept_id).offset(skip).limit(limit).all()

def create_card(db: Session, card: schemas.CardCreate):
    db_card = models.Card(
        concept_id=card.concept_id,
        question=card.question,
        answer=card.answer,
        explanation=card.explanation
    )
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

def update_card(db: Session, card_id: int, card: schemas.CardUpdate):
    db_card = get_card(db, card_id)
    update_data = card.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_card, key, value)
    db.commit()
    db.refresh(db_card)
    return db_card

def delete_card(db: Session, card_id: int):
    db_card = get_card(db, card_id)
    db.delete(db_card)
    db.commit()
    return db_card

# 복습 CRUD 함수
def get_review(db: Session, review_id: int):
    return db.query(models.Review).filter(models.Review.id == review_id).first()

def get_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Review).offset(skip).limit(limit).all()

def get_reviews_by_card(db: Session, card_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Review).filter(models.Review.card_id == card_id).offset(skip).limit(limit).all()

def get_due_reviews(db: Session, skip: int = 0, limit: int = 100):
    now = datetime.now()
    return db.query(models.Review).filter(models.Review.next_review_date <= now).offset(skip).limit(limit).all()

def create_review(db: Session, review: schemas.ReviewCreate):
    db_review = models.Review(
        card_id=review.card_id,
        difficulty=review.difficulty,
        next_review_date=review.next_review_date
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

# SM-2 알고리즘을 사용한 다음 복습 날짜 계산
def calculate_next_review_date(difficulty: int, repetitions: int = 0):
    if difficulty < 3:
        repetitions = 0
    else:
        repetitions += 1
    
    easiness = max(1.3, 2.5 - 0.8 * difficulty + 0.2)
    interval = 1
    
    if repetitions == 1:
        interval = 1
    elif repetitions == 2:
        interval = 6
    else:
        interval = math.ceil(interval * easiness)
    
    return datetime.now() + timedelta(days=interval)

# 노트 CRUD 함수
def get_note(db: Session, note_id: int):
    return db.query(models.Note).filter(models.Note.id == note_id).first()

def get_notes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Note).offset(skip).limit(limit).all()

def get_notes_by_concept(db: Session, concept_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Note).filter(models.Note.concept_id == concept_id).offset(skip).limit(limit).all()

def create_note(db: Session, note: schemas.NoteCreate):
    db_note = models.Note(
        concept_id=note.concept_id,
        title=note.title,
        content=note.content
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def update_note(db: Session, note_id: int, note: schemas.NoteUpdate):
    db_note = get_note(db, note_id)
    update_data = note.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    db.commit()
    db.refresh(db_note)
    return db_note

def delete_note(db: Session, note_id: int):
    db_note = get_note(db, note_id)
    db.delete(db_note)
    db.commit()
    return db_note

# 학습 이력 CRUD 함수
def create_learning_history(db: Session, history: schemas.LearningHistoryCreate):
    db_history = models.LearningHistory(
        concept_id=history.concept_id,
        activity_type=history.activity_type
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

def get_learning_history_by_concept(db: Session, concept_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.LearningHistory).filter(
        models.LearningHistory.concept_id == concept_id
    ).order_by(models.LearningHistory.created_at.desc()).offset(skip).limit(limit).all()
