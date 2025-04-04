from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models
import schemas
import crud

# APIRouter 생성
router = APIRouter()

@router.post("/", response_model=schemas.Connection)
def create_connection(
    connection: schemas.ConnectionCreate, 
    db: Session = Depends(get_db)
):
    """
    새로운 개념 간 연결을 생성합니다.
    """
    # 소스 개념과 타겟 개념이 존재하는지 확인
    source_concept = crud.get_concept(db, connection.source_id)
    if not source_concept:
        raise HTTPException(status_code=404, detail=f"Source concept with id {connection.source_id} not found")
    
    target_concept = crud.get_concept(db, connection.target_id)
    if not target_concept:
        raise HTTPException(status_code=404, detail=f"Target concept with id {connection.target_id} not found")
    
    # 자기 자신을 연결하려는 경우 예외 처리
    if connection.source_id == connection.target_id:
        raise HTTPException(status_code=400, detail="Cannot create a connection to itself")
    
    # 이미 동일한 연결이 존재하는지 확인
    existing_connection = db.query(models.Connection).filter(
        models.Connection.source_id == connection.source_id,
        models.Connection.target_id == connection.target_id
    ).first()
    
    if existing_connection:
        raise HTTPException(status_code=400, detail="Connection already exists")
    
    # 연결 생성
    return crud.create_connection(db=db, connection=connection)

@router.get("/", response_model=List[schemas.Connection])
def read_connections(
    source_id: Optional[int] = None,
    target_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    모든 연결을 조회하거나 소스/타겟 개념 ID로 필터링합니다.
    """
    if source_id and target_id:
        # 소스와 타겟 ID 모두로 필터링
        connections = db.query(models.Connection).filter(
            models.Connection.source_id == source_id,
            models.Connection.target_id == target_id
        ).offset(skip).limit(limit).all()
    elif source_id:
        # 소스 ID로만 필터링
        connections = db.query(models.Connection).filter(
            models.Connection.source_id == source_id
        ).offset(skip).limit(limit).all()
    elif target_id:
        # 타겟 ID로만 필터링
        connections = db.query(models.Connection).filter(
            models.Connection.target_id == target_id
        ).offset(skip).limit(limit).all()
    else:
        # 필터 없이 모든 연결 조회
        connections = crud.get_connections(db, skip=skip, limit=limit)
    
    return connections

@router.get("/{connection_id}", response_model=schemas.Connection)
def read_connection(connection_id: int, db: Session = Depends(get_db)):
    """
    특정 ID의 연결을 조회합니다.
    """
    connection = crud.get_connection(db, connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail=f"Connection with id {connection_id} not found")
    return connection

@router.put("/{connection_id}", response_model=schemas.Connection)
def update_connection(
    connection_id: int, 
    connection_update: schemas.ConnectionUpdate, 
    db: Session = Depends(get_db)
):
    """
    특정 ID의 연결을 업데이트합니다.
    """
    # 연결이 존재하는지 확인
    connection = crud.get_connection(db, connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail=f"Connection with id {connection_id} not found")
    
    # 연결 업데이트
    updated_connection = db.query(models.Connection).filter(models.Connection.id == connection_id)
    
    # 업데이트할 필드 지정
    update_data = connection_update.dict(exclude_unset=True)
    
    # 연결 업데이트
    updated_connection.update(update_data)
    db.commit()
    
    # 업데이트된 연결 반환
    return crud.get_connection(db, connection_id)

@router.delete("/{connection_id}")
def delete_connection(connection_id: int, db: Session = Depends(get_db)):
    """
    특정 ID의 연결을 삭제합니다.
    """
    connection = crud.get_connection(db, connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail=f"Connection with id {connection_id} not found")
    
    # 연결 삭제
    db.delete(connection)
    db.commit()
    
    return {"message": "Connection deleted successfully"}

@router.get("/concept/{concept_id}", response_model=List[schemas.Connection])
def get_connections_by_concept(concept_id: int, db: Session = Depends(get_db)):
    """
    특정 개념과 관련된 모든 연결을 가져옵니다.
    """
    # 개념이 존재하는지 확인
    concept = crud.get_concept(db, concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail=f"Concept with id {concept_id} not found")
    
    # 개념이 소스 또는 타겟인 모든 연결 가져오기
    connections = crud.get_connections_by_concept(db, concept_id)
    
    return connections