# 개념 그래프 기반 학습 시스템 - 데이터베이스 스키마

## 1. 개요

개념 그래프 기반 학습 시스템의 데이터베이스는 다음과 같은 주요 엔티티를 관리합니다:

- 개념 (Concept)
- 개념 간 연결 (Connection)
- 학습 카드 (Card)
- 복습 기록 (ReviewHistory)
- 사용자 (User)

## 2. ER 다이어그램

```
+-------------+       +-------------+       +-------------+
|    User     |       |   Concept   |       |    Card     |
+-------------+       +-------------+       +-------------+
| id          |<----->| id          |<----->| id          |
| username    |       | name        |       | concept_id  |
| email       |       | description |       | question    |
| created_at  |       | user_id     |       | answer      |
| updated_at  |       | created_at  |       | explanation |
+-------------+       | updated_at  |       | created_at  |
                      +-------------+       | updated_at  |
                           ^ ^              +-------------+
                           | |
                      +----+ +----+
                      |           |
               +-------------+    |
               | Connection  |    |
               +-------------+    |
               | id          |    |
               | source_id   |----+
               | target_id   |
               | relation    |
               | strength    |
               | created_at  |
               | updated_at  |
               +-------------+
                      ^
                      |
               +-------------+
               |ReviewHistory|
               +-------------+
               | id          |
               | card_id     |
               | user_id     |
               | score       |
               | next_review |
               | reviewed_at |
               | created_at  |
               | updated_at  |
               +-------------+
```

## 3. 테이블 정의

### 3.1 User 테이블

사용자 정보를 저장합니다.

| 필드명      | 타입         | 설명                     | 제약 조건        |
|------------|-------------|--------------------------|-----------------|
| id         | INTEGER     | 사용자 고유 식별자         | PRIMARY KEY     |
| username   | VARCHAR(50) | 사용자 이름               | NOT NULL, UNIQUE|
| email      | VARCHAR(100)| 이메일 주소               | NOT NULL, UNIQUE|
| created_at | TIMESTAMP   | 생성 시간                 | NOT NULL        |
| updated_at | TIMESTAMP   | 수정 시간                 | NOT NULL        |

### 3.2 Concept 테이블

학습 개념 정보를 저장합니다.

| 필드명      | 타입         | 설명                     | 제약 조건                      |
|------------|-------------|--------------------------|-------------------------------|
| id         | INTEGER     | 개념 고유 식별자           | PRIMARY KEY                   |
| name       | VARCHAR(100)| 개념 이름                 | NOT NULL                      |
| description| TEXT        | 개념 설명                 |                               |
| user_id    | INTEGER     | 생성한 사용자 ID          | FOREIGN KEY REFERENCES User(id)|
| created_at | TIMESTAMP   | 생성 시간                 | NOT NULL                      |
| updated_at | TIMESTAMP   | 수정 시간                 | NOT NULL                      |

### 3.3 Connection 테이블

개념 간의 연결 관계를 저장합니다.

| 필드명      | 타입         | 설명                     | 제약 조건                         |
|------------|-------------|--------------------------|----------------------------------|
| id         | INTEGER     | 연결 고유 식별자           | PRIMARY KEY                      |
| source_id  | INTEGER     | 출발 개념 ID              | FOREIGN KEY REFERENCES Concept(id)|
| target_id  | INTEGER     | 도착 개념 ID              | FOREIGN KEY REFERENCES Concept(id)|
| relation   | VARCHAR(50) | 관계 유형(선행, 후행 등)    | NOT NULL                         |
| strength   | FLOAT       | 연결 강도(0.0~1.0)        | NOT NULL, DEFAULT 0.5           |
| created_at | TIMESTAMP   | 생성 시간                 | NOT NULL                         |
| updated_at | TIMESTAMP   | 수정 시간                 | NOT NULL                         |

### 3.4 Card 테이블

학습 카드(문제, 답변) 정보를 저장합니다.

| 필드명      | 타입         | 설명                     | 제약 조건                         |
|------------|-------------|--------------------------|----------------------------------|
| id         | INTEGER     | 카드 고유 식별자           | PRIMARY KEY                      |
| concept_id | INTEGER     | 연관된 개념 ID            | FOREIGN KEY REFERENCES Concept(id)|
| question   | TEXT        | 문제 내용                 | NOT NULL                         |
| answer     | TEXT        | 답변 내용                 | NOT NULL                         |
| explanation| TEXT        | 설명/해설                 |                                  |
| created_at | TIMESTAMP   | 생성 시간                 | NOT NULL                         |
| updated_at | TIMESTAMP   | 수정 시간                 | NOT NULL                         |

### 3.5 ReviewHistory 테이블

복습 기록을 저장합니다.

| 필드명      | 타입         | 설명                     | 제약 조건                      |
|------------|-------------|--------------------------|-------------------------------|
| id         | INTEGER     | 기록 고유 식별자           | PRIMARY KEY                   |
| card_id    | INTEGER     | 카드 ID                  | FOREIGN KEY REFERENCES Card(id)|
| user_id    | INTEGER     | 사용자 ID                | FOREIGN KEY REFERENCES User(id)|
| score      | INTEGER     | 복습 점수(0-5)           | NOT NULL                      |
| next_review| TIMESTAMP   | 다음 복습 예정 시간        | NOT NULL                      |
| reviewed_at| TIMESTAMP   | 복습 시간                 | NOT NULL                      |
| created_at | TIMESTAMP   | 생성 시간                 | NOT NULL                      |
| updated_at | TIMESTAMP   | 수정 시간                 | NOT NULL                      |

## 4. 인덱스

성능 최적화를 위한 인덱스 정의:

| 테이블명      | 인덱스명                | 필드                     | 설명                           |
|--------------|------------------------|--------------------------|--------------------------------|
| Concept      | idx_concept_user       | user_id                  | 사용자별 개념 조회 최적화        |
| Connection   | idx_connection_source  | source_id                | 출발 개념별 연결 조회 최적화     |
| Connection   | idx_connection_target  | target_id                | 도착 개념별 연결 조회 최적화     |
| Card         | idx_card_concept       | concept_id               | 개념별 카드 조회 최적화          |
| ReviewHistory| idx_review_card        | card_id                  | 카드별 복습 기록 조회 최적화     |
| ReviewHistory| idx_review_user        | user_id                  | 사용자별 복습 기록 조회 최적화   |
| ReviewHistory| idx_review_next        | next_review              | 다음 복습 일정 조회 최적화       |

## 5. SQL 스키마 정의

```sql
-- 사용자 테이블
CREATE TABLE User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 개념 테이블
CREATE TABLE Concept (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id)
);

-- 개념 연결 테이블
CREATE TABLE Connection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    relation VARCHAR(50) NOT NULL,
    strength FLOAT NOT NULL DEFAULT 0.5,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES Concept(id),
    FOREIGN KEY (target_id) REFERENCES Concept(id)
);

-- 학습 카드 테이블
CREATE TABLE Card (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    concept_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (concept_id) REFERENCES Concept(id)
);

-- 복습 기록 테이블
CREATE TABLE ReviewHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    next_review TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES Card(id),
    FOREIGN KEY (user_id) REFERENCES User(id)
);

-- 인덱스 생성
CREATE INDEX idx_concept_user ON Concept(user_id);
CREATE INDEX idx_connection_source ON Connection(source_id);
CREATE INDEX idx_connection_target ON Connection(target_id);
CREATE INDEX idx_card_concept ON Card(concept_id);
CREATE INDEX idx_review_card ON ReviewHistory(card_id);
CREATE INDEX idx_review_user ON ReviewHistory(user_id);
CREATE INDEX idx_review_next ON ReviewHistory(next_review);
```

## 6. 데이터 관계 및 제약 조건

1. **사용자와 개념**: 일대다 관계 (한 사용자가 여러 개념을 생성할 수 있음)
2. **개념과 카드**: 일대다 관계 (한 개념에 여러 학습 카드가 연결될 수 있음)
3. **개념 간 연결**: 다대다 관계 (한 개념이 여러 개념과 연결될 수 있음)
4. **카드와 복습 기록**: 일대다 관계 (한 카드에 대해 여러 복습 기록이 생성될 수 있음)
5. **사용자와 복습 기록**: 일대다 관계 (한 사용자가 여러 복습 기록을 가질 수 있음)

## 7. 데이터 마이그레이션 및 초기 데이터

시스템 초기 설정을 위한 샘플 데이터:

```sql
-- 샘플 사용자 추가
INSERT INTO User (username, email) VALUES ('test_user', 'test@example.com');

-- 샘플 개념 추가
INSERT INTO Concept (name, description, user_id) VALUES 
('소프트웨어 공학', '소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문', 1),
('요구사항 분석', '소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정', 1),
('유지보수', '소프트웨어를 인도한 후에 결함을 수정하고, 성능을 개선하며, 변화된 환경에 적응시키는 과정', 1);

-- 샘플 연결 추가
INSERT INTO Connection (source_id, target_id, relation, strength) VALUES 
(2, 1, '하위 개념', 0.8),
(3, 1, '하위 개념', 0.7);

-- 샘플 카드 추가
INSERT INTO Card (concept_id, question, answer, explanation) VALUES 
(1, '소프트웨어 공학의 주요 목표는 무엇인가?', '고품질의 소프트웨어를 비용 효율적으로 개발하는 것', '소프트웨어 공학은 체계적이고 규율적인 접근 방식을 통해 신뢰성 있고 효율적인 소프트웨어를 개발하는 것을 목표로 합니다.'),
(3, '유지보수의 4가지 유형은 무엇인가?', '수정 유지보수, 적응 유지보수, 완전 유지보수, 예방 유지보수', '수정 유지보수는 결함 수정, 적응 유지보수는 환경 변화 대응, 완전 유지보수는 기능 개선, 예방 유지보수는 미래 문제 예방을 위한 것입니다.');
```
