# // 백엔드 API 구현: app.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
import crud
from database import SessionLocal, engine

# 데이터베이스 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="개념 그래프 학습 시스템 API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 시에는 특정 도메인으로 제한해야 함
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 의존성 주입: 데이터베이스 세션
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 개념 관련 API
@app.post("/concepts/", response_model=schemas.Concept)
def create_concept(concept: schemas.ConceptCreate, db: Session = Depends(get_db)):
    return crud.create_concept(db=db, concept=concept)

@app.get("/concepts/", response_model=List[schemas.Concept])
def read_concepts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    concepts = crud.get_concepts(db, skip=skip, limit=limit)
    return concepts

@app.get("/concepts/{concept_id}", response_model=schemas.ConceptDetail)
def read_concept(concept_id: int, db: Session = Depends(get_db)):
    db_concept = crud.get_concept(db, concept_id=concept_id)
    if db_concept is None:
        raise HTTPException(status_code=404, detail="Concept not found")
    return db_concept

@app.put("/concepts/{concept_id}", response_model=schemas.Concept)
def update_concept(concept_id: int, concept: schemas.ConceptUpdate, db: Session = Depends(get_db)):
    db_concept = crud.get_concept(db, concept_id=concept_id)
    if db_concept is None:
        raise HTTPException(status_code=404, detail="Concept not found")
    return crud.update_concept(db=db, concept_id=concept_id, concept=concept)

@app.delete("/concepts/{concept_id}")
def delete_concept(concept_id: int, db: Session = Depends(get_db)):
    db_concept = crud.get_concept(db, concept_id=concept_id)
    if db_concept is None:
        raise HTTPException(status_code=404, detail="Concept not found")
    crud.delete_concept(db=db, concept_id=concept_id)
    return {"message": "Concept deleted successfully"}

# 개념 연결 관련 API
@app.post("/connections/", response_model=schemas.Connection)
def create_connection(connection: schemas.ConnectionCreate, db: Session = Depends(get_db)):
    return crud.create_connection(db=db, connection=connection)

@app.get("/connections/", response_model=List[schemas.Connection])
def read_connections(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    connections = crud.get_connections(db, skip=skip, limit=limit)
    return connections

@app.delete("/connections/{connection_id}")
def delete_connection(connection_id: int, db: Session = Depends(get_db)):
    db_connection = crud.get_connection(db, connection_id=connection_id)
    if db_connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")
    crud.delete_connection(db=db, connection_id=connection_id)
    return {"message": "Connection deleted successfully"}

# 학습 카드 관련 API
@app.post("/cards/", response_model=schemas.Card)
def create_card(card: schemas.CardCreate, db: Session = Depends(get_db)):
    return crud.create_card(db=db, card=card)

@app.get("/cards/", response_model=List[schemas.Card])
def read_cards(concept_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if concept_id:
        cards = crud.get_cards_by_concept(db, concept_id=concept_id, skip=skip, limit=limit)
    else:
        cards = crud.get_cards(db, skip=skip, limit=limit)
    return cards

@app.get("/cards/{card_id}", response_model=schemas.Card)
def read_card(card_id: int, db: Session = Depends(get_db)):
    db_card = crud.get_card(db, card_id=card_id)
    if db_card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return db_card

@app.put("/cards/{card_id}", response_model=schemas.Card)
def update_card(card_id: int, card: schemas.CardUpdate, db: Session = Depends(get_db)):
    db_card = crud.get_card(db, card_id=card_id)
    if db_card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return crud.update_card(db=db, card_id=card_id, card=card)

@app.delete("/cards/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db)):
    db_card = crud.get_card(db, card_id=card_id)
    if db_card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    crud.delete_card(db=db, card_id=card_id)
    return {"message": "Card deleted successfully"}

# 복습 기록 관련 API
@app.post("/reviews/", response_model=schemas.Review)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    return crud.create_review(db=db, review=review)

@app.get("/reviews/", response_model=List[schemas.Review])
def read_reviews(card_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if card_id:
        reviews = crud.get_reviews_by_card(db, card_id=card_id, skip=skip, limit=limit)
    else:
        reviews = crud.get_reviews(db, skip=skip, limit=limit)
    return reviews

# 노트 관련 API
@app.post("/notes/", response_model=schemas.Note)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    return crud.create_note(db=db, note=note)

@app.get("/notes/", response_model=List[schemas.Note])
def read_notes(concept_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if concept_id:
        notes = crud.get_notes_by_concept(db, concept_id=concept_id, skip=skip, limit=limit)
    else:
        notes = crud.get_notes(db, skip=skip, limit=limit)
    return notes

@app.get("/notes/{note_id}", response_model=schemas.Note)
def read_note(note_id: int, db: Session = Depends(get_db)):
    db_note = crud.get_note(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return db_note

@app.put("/notes/{note_id}", response_model=schemas.Note)
def update_note(note_id: int, note: schemas.NoteUpdate, db: Session = Depends(get_db)):
    db_note = crud.get_note(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return crud.update_note(db=db, note_id=note_id, note=note)

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = crud.get_note(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    crud.delete_note(db=db, note_id=note_id)
    return {"message": "Note deleted successfully"}

# LLM 통합 API
@app.post("/llm/explain", response_model=schemas.LLMResponse)
def explain_concept(request: schemas.LLMRequest):
    # 실제 구현에서는 LLM API 호출
    # 여기서는 목업 응답 반환
    concept = request.concept
    response = f"{concept}은(는) 중요한 개념입니다. 이 개념은 다양한 분야에서 활용됩니다."
    return {"response": response}

@app.post("/llm/generate-question", response_model=schemas.LLMQuestionResponse)
def generate_question(request: schemas.LLMRequest):
    # 실제 구현에서는 LLM API 호출
    # 여기서는 목업 응답 반환
    concept = request.concept
    return {
        "question": f"{concept}의 주요 특징은 무엇인가요?",
        "answer": f"{concept}의 주요 특징은 확장성, 유연성, 그리고 적응성입니다.",
        "explanation": f"{concept}은(는) 다양한 상황에 적용할 수 있는 유연한 개념입니다."
    }

@app.post("/llm/suggest-concepts", response_model=schemas.LLMConceptsResponse)
def suggest_related_concepts(request: schemas.LLMRequest):
    # 실제 구현에서는 LLM API 호출
    # 여기서는 목업 응답 반환
    concept = request.concept
    return {
        "concepts": [
            {"name": f"{concept}의 기초", "relation": "선행 개념"},
            {"name": f"{concept}의 응용", "relation": "후행 개념"},
            {"name": f"{concept}의 확장", "relation": "관련 개념"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
