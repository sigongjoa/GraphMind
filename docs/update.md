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