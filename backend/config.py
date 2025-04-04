import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    애플리케이션 설정
    """
    # 데이터베이스 설정
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./concept_graph.db")
    
    # LLM 서비스 설정
    USE_MOCK_LLM: bool = os.getenv("USE_MOCK_LLM", "false").lower() == "true"
    LLM_API_URL: str = os.getenv("LLM_API_URL", "http://localhost:1234/v1")
    
    # 서버 설정
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # CORS 설정
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")
    
    class Config:
        env_file = ".env"

# 설정 인스턴스 생성
settings = Settings()