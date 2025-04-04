# 업데이트
기능 업데이트 정리

1. 빈 그래프 대응 UI 추가  
* 개념 데이터(nodes)가 없거나, 연결 데이터(links)가 없을 때를 구분해서 다음 UI 표시:
  개념 없음 → "첫 개념 추가하기" 버튼
  연결 없음 → "첫 연결 추가하기" 버튼
  isLoading, graphData.nodes.length, graphData.links.length에 따른 조건 분기 추가

2. 개념 추가 후 정상 반영 확인
* 모달을 통해 개념 추가 기능 테스트
* 정상적으로 setGraphData로 새 노드 반영됨 확인

3. 연결 추가 모달 개선
* 기존에는 출발 개념만 보여졌음 → 도착 개념(target) 셀렉트 박스 추가
* graphData.nodes에서 출발/도착 모두 선택 가능하도록 구성

4. 추가 버튼 비활성화 문제 해결
* 원인: relation 값이 비어 있어서 버튼이 disabled 상태

해결:

* 관계 설명 input 필드를 추가해서 newLinkForm.relation 값 입력 유도
사용자 입력에 따라 버튼 활성화되도록 정상 작동 확인

5. 전체 시각적 확인
* 상태 로그 출력(isLoading, 노드 수, 링크 수)으로 디버깅 보완
* 관계를 가진 연결까지 시각적으로 확인 완료

---

카드 학습 기능
개념별 학습은 LearningMode 컴포넌트를 통해 이루어집니다:

시작 방법:

개념 상세 페이지에서 "이 개념 학습하기" 버튼 클릭
URL: /learning/[개념ID]로 접근


학습 모드 기능:

개념 설명 표시: 해당 개념의 기본 설명 제공
LLM 상호작용: LLM과의 대화를 통해 개념 심화 학습
문제 생성: "문제 생성" 버튼을 통해 즉석에서 개념 관련 문제 생성
관련 개념 추천: 함께 학습하면 좋은 관련 개념 목록 표시


구현 세부사항:

LearningMode 컴포넌트는 개념 ID를 URL 파라미터로 받아 해당 개념 데이터를 로드
LLMInteraction 컴포넌트를 통해 대화형 학습 인터페이스 제공
LLM 모델은 현재 목업으로 구현되어 있어 실제 데이터를 활용한 기본 응답 제공



카드 복습 기능
복습은 ReviewMode 컴포넌트를 통해 간격 반복(Spaced Repetition) 방식으로 이루어집니다:

시작 방법:

대시보드의 "복습 시작하기" 버튼 클릭
개념 상세 페이지의 "이 개념 복습하기" 버튼 클릭
URL: /review 또는 /review?concept=[개념ID]로 접근


복습 모드 기능:

복습 예정 카드 표시: 오늘 복습해야 할 카드 순차적 표시
정답 확인: 카드 문제 확인 후 "정답 확인" 버튼으로 답변 확인
난이도 평가: 1~5점 척도로 난이도 평가 (매우 어려움 → 매우 쉬움)
복습 일정 조정: 평가에 따라 SM-2 알고리즘 기반으로 다음 복습 일정 자동 조정
개념별 필터링: 특정 개념의 카드만 복습 가능


구현 세부사항:

ReviewMode 컴포넌트에서 복습 예정 카드를 로드
ReviewCard 컴포넌트로 카드 내용 표시
DifficultyRating 컴포넌트로 난이도 평가 UI 제공
ReviewProgress 컴포넌트로 복습 진행 상황 표시
난이도 평가 시 reviewsApi.create()를 호출하여 복습 기록 저장 및 다음 복습 일정 설정
---
# 프로젝트 오류 및 해결 정리

## 1. 모듈 중복 및 import/export 오류

### 문제
- `Module not found`, `export default` 충돌
- `useState`, `CardItem`, `Button` 등의 중복 선언 발생

### 해결
- 파일 간 `export default`, `import` 정리
- 컴포넌트별 파일 분리
- `CardItem.tsx`, `CardList.tsx` 등의 구조 정상화

---

## 2. 무한 렌더링 및 handleShowAnswer 오류

### 문제
- `CardItem` 내 버튼 클릭 시 `Too many re-renders` 오류 발생
- `handleShowAnswer is not defined` 오류

### 원인
- 클릭 이벤트에서 `setShowAnswer(true)`를 함수가 아닌 **즉시 실행**으로 작성

### 해결
```tsx
// 수정 전
<Button onClick={setShowAnswer(true)}>정답 보기</Button>

// 수정 후
<Button onClick={() => setShowAnswer(true)}>정답 보기</Button>
```

---

1. 데이터 로딩/에러 처리 일관성 개선

useDataFetch 훅을 구현하여 모든 컴포넌트에서 일관된 방식으로 데이터를 가져올 수 있게 되었습니다.
ErrorContext와 GlobalErrorDisplay 컴포넌트를 구현하여 전역적인 에러 처리 메커니즘을 제공합니다.
이제 에러가 발생하면 사용자에게 일관된 UI로 표시되며, 적절한 조치(새로고침 등)를 제안합니다.

2. 이미지 최적화 개선

Next.js의 Image 컴포넌트를 활용한 OptimizedImage 컴포넌트를 만들어 이미지 로딩 최적화를 구현했습니다.
이미지 로딩 상태, 에러 처리, 폴백 이미지 등의 기능을 포함하여 사용자 경험을 향상시켰습니다.
이미지 최적화를 통해 페이지 로딩 속도가 향상되고 대역폭 사용이 감소합니다.

3. 반응형 디자인 개선

ResponsiveContainer 컴포넌트를 만들어 일관된 레이아웃과 반응형 디자인을 구현했습니다.
useMediaQuery 훅을 구현하여 스크린 크기에 따른 UI 조정을 쉽게 할 수 있게 되었습니다.
이제 모바일 디바이스부터 대형 화면까지 다양한 화면 크기에 최적화된 UI를 제공할 수 있습니다.

4. 상태 관리 개선

AppContext를 구현하여 전역 상태 관리를 위한 기반을 마련했습니다.
주요 기능(개념 선택, 학습 세션, LLM 상태)에 대한 중앙 집중식 상태 관리가 가능해졌습니다.
컴포넌트 간 상태 공유가 용이해져 데이터 일관성 문제를 해결했습니다.
다크 모드 등의 사용자 설정이 앱 전체에 일관되게 적용됩니다.


---

