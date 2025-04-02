import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta

from app import app
from database import Base, get_db
import models
import schemas

# 테스트용 in-memory 데이터베이스 설정
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 테스트용 데이터베이스 의존성 오버라이드
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# 테스트 클라이언트 생성
client = TestClient(app)

# 테스트 데이터 생성 함수
def setup_test_data(db):
    # 개념 생성
    concept1 = models.Concept(name="소프트웨어 공학", description="소프트웨어 개발 프로세스와 방법론")
    concept2 = models.Concept(name="알고리즘", description="문제 해결을 위한 절차적 방법")
    db.add(concept1)
    db.add(concept2)
    db.commit()

    # 카드 생성
    card1 = models.Card(
        concept_id=concept1.id,
        question="소프트웨어 공학의 주요 목표는?",
        answer="고품질의 소프트웨어를 비용 효율적으로 개발하는 것"
    )
    card2 = models.Card(
        concept_id=concept1.id,
        question="폭포수 모델의 단계는?",
        answer="요구사항 분석, 설계, 구현, 테스트, 유지보수"
    )
    card3 = models.Card(
        concept_id=concept2.id,
        question="퀵 정렬의 평균 시간 복잡도는?",
        answer="O(n log n)"
    )
    db.add(card1)
    db.add(card2)
    db.add(card3)
    db.commit()

    # 복습 기록 생성
    review1 = models.Review(
        card_id=card1.id,
        difficulty=3,
        next_review_date=datetime.now() + timedelta(days=3)
    )
    review2 = models.Review(
        card_id=card2.id,
        difficulty=4,
        next_review_date=datetime.now() + timedelta(days=7)
    )
    review3 = models.Review(
        card_id=card3.id,
        difficulty=2,
        next_review_date=datetime.now() + timedelta(days=1)
    )
    db.add(review1)
    db.add(review2)
    db.add(review3)
    db.commit()

    # 학습 활동 기록 생성
    activity1 = models.LearningHistory(
        concept_id=concept1.id,
        activity_type="learning"
    )
    activity2 = models.LearningHistory(
        concept_id=concept1.id,
        activity_type="review"
    )
    activity3 = models.LearningHistory(
        concept_id=concept2.id,
        activity_type="learning"
    )
    db.add(activity1)
    db.add(activity2)
    db.add(activity3)
    db.commit()

@pytest.fixture(autouse=True)
def setup():
    # 테스트 데이터베이스 초기화
    Base.metadata.create_all(bind=engine)
    
    # 테스트 데이터 설정
    db = TestingSessionLocal()
    setup_test_data(db)
    db.close()
    
    yield
    
    # 테스트 후 정리
    Base.metadata.drop_all(bind=engine)

def test_get_learning_stats():
    response = client.get("/api/stats/learning-stats")
    assert response.status_code == 200
    data = response.json()
    
    # 기본 통계 검증
    assert data["total_concepts"] == 2
    assert data["total_cards"] == 3
    assert data["total_reviews"] == 3
    
    # 난이도 분포 확인
    difficulty_distribution = {item["difficulty"]: item["count"] for item in data["difficulty_stats"]["distribution"]}
    assert difficulty_distribution.get(2, 0) == 1
    assert difficulty_distribution.get(3, 0) == 1
    assert difficulty_distribution.get(4, 0) == 1
    
    # 활동 통계 확인
    activity_counts = {item["type"]: item["count"] for item in data["activity_stats"]}
    assert activity_counts.get("learning", 0) == 2
    assert activity_counts.get("review", 0) == 1

def test_get_concept_stats():
    response = client.get("/api/stats/concept-stats/1")
    assert response.status_code == 200
    data = response.json()
    
    # 개념 정보 확인
    assert data["concept_id"] == 1
    assert data["concept_name"] == "소프트웨어 공학"
    assert data["cards_count"] == 2
    assert data["reviews_count"] == 2
    
    # 평균 난이도 확인 (3과 4의 평균)
    assert data["avg_difficulty"] == 3.5
    
    # 최근 활동 확인
    assert len(data["recent_activities"]) == 2
    activities = {activity["type"] for activity in data["recent_activities"]}
    assert "learning" in activities
    assert "review" in activities

def test_get_review_stats():
    response = client.get("/api/stats/review-stats")
    assert response.status_code == 200
    data = response.json()
    
    # 기본 통계 확인
    assert data["total_reviews"] == 3
    
    # 일별 통계 확인
    assert len(data["daily_stats"]) == 30  # 30일 기록
    today_stats = next((item for item in data["daily_stats"] if item["count"] > 0), None)
    assert today_stats is not None
    assert today_stats["count"] == 3  # 오늘 3개의 복습 생성
    
    # 난이도별 통계 확인
    retention_stats = {item["difficulty"]: item for item in data["retention_stats"]}
    assert retention_stats[2]["count"] == 1
    assert retention_stats[3]["count"] == 1
    assert retention_stats[4]["count"] == 1
    
    # 백분율 확인
    for diff in [2, 3, 4]:
        assert retention_stats[diff]["percentage"] == (1/3) * 100  # 각 난이도별 1개씩, 총 3개

def test_get_progress_stats():
    response = client.get("/api/stats/progress-stats")
    assert response.status_code == 200
    data = response.json()
    
    # 진행 상황 확인
    assert data["total_concepts"] == 2
    assert data["learned_concepts"] == 2  # 두 개념 모두 활동 있음
    assert data["learning_progress"] == 100.0  # 100% 진행
    
    assert data["total_cards"] == 3
    assert data["reviewed_cards"] == 3  # 모든 카드 복습 있음
    assert data["review_progress"] == 100.0  # 100% 진행
    
    # 월별 활동 확인
    assert len(data["monthly_activities"]) == 12  # 12개월 기록
    current_month = data["monthly_activities"][0]  # 가장 최근 달
    assert current_month["learning_count"] == 3  # 모든 학습 활동
    assert current_month["review_count"] == 3  # 모든 복습 활동