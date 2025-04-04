from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn
from typing import Dict, Any

from database import engine
import models
from routers import concepts, connections, cards, reviews, notes, llm
from config import settings

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# 데이터베이스 테이블 생성
models.Base.metadata.create_all(bind=engine)

# FastAPI 애플리케이션 생성
app = FastAPI(
    title="개념 그래프 학습 시스템 API",
    description="개념 그래프 기반 학습 시스템의 백엔드 API",
    version="1.0.0"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 애플리케이션 상태 확인 엔드포인트
@app.get("/")
def read_root() -> Dict[str, Any]:
    """
    API 루트 엔드포인트: 애플리케이션 상태 확인
    """
    return {
        "status": "online",
        "message": "개념 그래프 학습 시스템 API가 정상적으로 동작 중입니다.",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

# 라우터 등록
app.include_router(concepts.router, prefix="/api/concepts", tags=["concepts"])
app.include_router(connections.router, prefix="/api/connections", tags=["connections"])
app.include_router(cards.router, prefix="/api/cards", tags=["cards"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(llm.router, prefix="/api/llm", tags=["llm"])

# 직접 실행 시 서버 시작
if __name__ == "__main__":
    logger.info(f"서버 시작: {settings.HOST}:{settings.PORT} (DEBUG: {settings.DEBUG})")
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )