from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
import crud
from database import SessionLocal, engine
import logging

# 라우터 모듈 임포트
from routers import reviews
from routers import connections
from routers import llm

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# DB 테이블 생성
models.Base.metadata.create_all(bind=engine)

# FastAPI 인스턴스 생성
app = FastAPI(title="개념 그래프 학습 시스템 API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용 (개발 환경)
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

# 기본 라우터 정의
router = APIRouter()

# 루트 경로 핸들러 - API 상태 확인용
@app.get("/")
def read_root():
    return {"status": "online", "message": "개념 그래프 학습 시스템 API가 정상적으로 동작 중입니다."}

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

# 라우터 등록
app.include_router(router, prefix="/api")
app.include_router(connections.router, prefix="/api/connections")
app.include_router(reviews.router, prefix="/api/reviews")
app.include_router(llm.router, prefix="/api/llm")

