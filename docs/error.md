# 🛠️ 에러 해결 기록 (Error Log & Fixes)

이 문서는 개념 그래프 학습 시스템을 개발하면서 발생한 주요 에러들과 해결 방법을 기록한 문서입니다.  
향후 유지보수 및 디버깅에 도움이 되도록 정리되었습니다.

---

## ✅ 1. 콘솔 로그 출력 안됨

- **에러 현상**  
  `console.log("✅ 개념 응답:", concepts)`가 찍히지 않음.  
  useEffect 내부 fetch 함수가 실행되지 않는 것으로 의심됨.

- **원인**  
  `useEffect` 안에서 `fetchGraphData()` 호출을 놓침 or 잘못된 위치에 선언함.

- **해결 방법**
  ```tsx
  useEffect(() => {
    const fetchGraphData = async () => {
      // fetch 로직...
    };
    fetchGraphData(); // ← 호출 필수!!
  }, [retryCount]);

--- 
✅ 2. 개념, 연결 데이터는 존재하나 화면이 빈 상태
**에러 현상**
GET /api/concepts/, GET /api/connections/ 응답은 200인데 UI에는 아무것도 안 보임.

**원인**
graphData.nodes.length === 0 / graphData.links.length === 0 조건에서 분기 처리 안 되어 있음.
연결이 없는 상태일 때 표시되는 UI가 없음.

**해결 방법**
```tsx
{isLoading ? (
  <Loader />
) : graphData.nodes.length === 0 ? (
  <p>첫 개념 추가하기 버튼</p>
) : graphData.links.length === 0 ? (
  <p>첫 연결 추가하기 버튼</p>
) : (
  <GraphVisualization />
)}
```

---
3. Uncaught ReferenceError: concepts is not defined
**에러 현상**
브라우저 콘솔에서 console.log("✅ 개념 응답:", concepts); 실행 시 ReferenceError 발생

**원인**
콘솔에서 변수 직접 사용 → 해당 범위 밖에 있음

**해결 방법**

콘솔은 React 컴포넌트 내부의 로컬 변수에 접근 불가
로그는 코드 안에 삽입하여 확인 필요

---
✅ 4. 빈 연결 추가 모달에서 개념이 표시되지 않음
에러 현상
"새 연결 추가" 모달에서 출발 개념 드롭다운에 아무것도 안 뜸

**원인**
연결 추가 버튼 클릭 시 source, target 값이 초기화되지 않음
혹은 연결된 노드를 선택한 상태가 아님

**해결 방법**
```tsx
복사
편집
const handleLinkAdd = (source, target) => {
  setNewLinkForm({
    source: source.id.toString(),
    target: target.id.toString(),
    relation: ''
  });
  setIsModalOpen(true);
};
```
