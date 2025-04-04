from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
import crud
from database import SessionLocal, engine

from routers.statistics import router as statistics_router
from routers.reviews import router as reviews_router
from routers.connections import router as connections_router
from routers.llm_service import router as llm_router

# DB 테이블 생성
models.Base.metadata.create_all(bind=engine)

# FastAPI 인스턴스 생성
app = FastAPI(title="개념 그래프 학습 시스템 API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 세션 의존성

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Router 정의
router = APIRouter()

# ------------------------ 개념 API ------------------------
@router.post("/concepts/", response_model=schemas.Concept)
def create_concept(concept: schemas.ConceptCreate, db: Session = Depends(get_db)):
    return crud.create_concept(db=db, concept=concept)

@router.get("/concepts/", response_model=List[schemas.Concept])
def read_concepts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_concepts(db, skip=skip, limit=limit)

@router.get("/concepts/{concept_id}", response_model=schemas.ConceptDetail)
def read_concept(concept_id: int, db: Session = Depends(get_db)):
    concept = crud.get_concept(db, concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    return concept

@router.put("/concepts/{concept_id}", response_model=schemas.Concept)
def update_concept(concept_id: int, concept: schemas.ConceptUpdate, db: Session = Depends(get_db)):
    db_concept = crud.get_concept(db, concept_id)
    if not db_concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    return crud.update_concept(db, concept_id, concept)

@router.delete("/concepts/{concept_id}")
def delete_concept(concept_id: int, db: Session = Depends(get_db)):
    db_concept = crud.get_concept(db, concept_id)
    if not db_concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    crud.delete_concept(db, concept_id)
    return {"message": "Concept deleted successfully"}

# ------------------------ 연결 API ------------------------
@router.post("/connections/", response_model=schemas.Connection)
def create_connection(connection: schemas.ConnectionCreate, db: Session = Depends(get_db)):
    return crud.create_connection(db=db, connection=connection)

@router.get("/connections/", response_model=List[schemas.Connection])
def read_connections(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_connections(db, skip=skip, limit=limit)

@router.delete("/connections/{connection_id}")
def delete_connection(connection_id: int, db: Session = Depends(get_db)):
    db_conn = crud.get_connection(db, connection_id)
    if not db_conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    crud.delete_connection(db, connection_id)
    return {"message": "Connection deleted successfully"}

# ------------------------ 카드 API ------------------------
@router.post("/cards/", response_model=schemas.Card)
def create_card(card: schemas.CardCreate, db: Session = Depends(get_db)):
    return crud.create_card(db=db, card=card)

@router.get("/cards/", response_model=List[schemas.Card])
def read_cards(concept_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if concept_id:
        return crud.get_cards_by_concept(db, concept_id, skip, limit)
    return crud.get_cards(db, skip, limit)

@router.get("/cards/{card_id}", response_model=schemas.Card)
def read_card(card_id: int, db: Session = Depends(get_db)):
    card = crud.get_card(db, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

@router.put("/cards/{card_id}", response_model=schemas.Card)
def update_card(card_id: int, card: schemas.CardUpdate, db: Session = Depends(get_db)):
    db_card = crud.get_card(db, card_id)
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    return crud.update_card(db, card_id, card)

@router.delete("/cards/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db)):
    db_card = crud.get_card(db, card_id)
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    crud.delete_card(db, card_id)
    return {"message": "Card deleted successfully"}

# ------------------------ 복습 API ------------------------
@router.post("/reviews/", response_model=schemas.Review)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    return crud.create_review(db=db, review=review)

@router.get("/reviews/", response_model=List[schemas.Review])
def read_reviews(card_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if card_id:
        return crud.get_reviews_by_card(db, card_id, skip, limit)
    return crud.get_reviews(db, skip, limit)

# ------------------------ 노트 API ------------------------
@router.post("/notes/", response_model=schemas.Note)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    return crud.create_note(db=db, note=note)

@router.get("/notes/", response_model=List[schemas.Note])
def read_notes(concept_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if concept_id:
        return crud.get_notes_by_concept(db, concept_id, skip, limit)
    return crud.get_notes(db, skip, limit)

@router.get("/notes/{note_id}", response_model=schemas.Note)
def read_note(note_id: int, db: Session = Depends(get_db)):
    db_note = crud.get_note(db, note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    return db_note

@router.put("/notes/{note_id}", response_model=schemas.Note)
def update_note(note_id: int, note: schemas.NoteUpdate, db: Session = Depends(get_db)):
    db_note = crud.get_note(db, note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    return crud.update_note(db, note_id, note)

@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = crud.get_note(db, note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    crud.delete_note(db, note_id)
    return {"message": "Note deleted successfully"}

# ------------------------ LLM API ------------------------
@router.post("/llm/explain", response_model=schemas.LLMResponse)
def explain_concept(request: schemas.LLMRequest):
    return {"response": f"{request.concept}은(는) 중요한 개념입니다."}

@router.post("/llm/generate-question", response_model=schemas.LLMQuestionResponse)
def generate_question(request: schemas.LLMRequest):
    return {
        "question": f"{request.concept}의 주요 특징은 무엇인가요?",
        "answer": f"{request.concept}의 주요 특징은 확장성, 유연성입니다.",
        "explanation": f"{request.concept}은 다양한 상황에 적용할 수 있는 개념입니다."
    }

@router.post("/llm/suggest-concepts", response_model=schemas.LLMConceptsResponse)
def suggest_concepts(request: schemas.LLMRequest):
    return {
        "concepts": [
            {"name": f"{request.concept} 기초", "relation": "선행"},
            {"name": f"{request.concept} 응용", "relation": "후행"},
        ]
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 또는 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 라우터 등록 (prefix="/api")
# ✅ 라우터 등록 (prefix="/api")
app.include_router(router, prefix="/api")  # 이건 그대로 (직접 정의한 router)
app.include_router(connections_router, prefix="/api/connections")
app.include_router(statistics_router, prefix="/api/stats")
app.include_router(reviews_router, prefix="/api/reviews")
app.include_router(llm_router, prefix="/api/llm")

