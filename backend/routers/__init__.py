# routers/__init__.py
# 기존 코드 (오류 발생)

from backend.config import settings
from routers.llm_service import router as llm_router

__all__ = ["llm_router"]