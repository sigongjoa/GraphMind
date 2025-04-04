# LM Studio 통합 가이드

이 가이드는 개념 그래프 학습 시스템에 LM Studio를 사용하여 로컬 LLM(Large Language Model)을 통합하는 방법을 설명합니다.

## 1. LM Studio 설치 및 설정

### 1.1 LM Studio 다운로드 및 설치

1. [LM Studio 웹사이트](https://lmstudio.ai/)에서 운영체제에 맞는 버전을 다운로드합니다.
2. 설치 프로그램의 지시에 따라 LM Studio를 설치합니다.

### 1.2 모델 다운로드

1. LM Studio를 실행합니다.
2. 메인 화면에서 "Browse Models" 탭을 선택합니다.
3. 다음 중 하나의 모델을 선택하여 다운로드합니다(권장 모델):
   - Mistral 7B Instruct
   - Llama 2 7B Chat
   - Phi-2
   - Neural Chat 7B
   - 또는 다른 선호하는 모델

### 1.3 로컬 서버 실행

1. 다운로드한 모델을 선택합니다.
2. "Local Server" 탭을 선택합니다.
3. "Start Server" 버튼을 클릭하여 서버를 시작합니다.
4. 서버가 성공적으로 시작되면 다음과 유사한 URL이 표시됩니다: `http://localhost:1234/v1`

## 2. 백