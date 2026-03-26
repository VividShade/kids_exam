# Refactoring Roadmap

작성일: 2026-03-27
범위: `src/components`, `src/lib`, `src/app/api`, `src/app/dashboard`

## 우선순위 기준
- `P0 (Critical)`: 중복/결합으로 인해 장애 가능성 또는 변경 리스크가 즉시 큰 항목
- `P1 (High)`: 유지보수 비용이 빠르게 누적되는 항목
- `P2 (Medium)`: 품질 개선 효과는 있으나 즉시 리스크가 낮은 항목
- `P3 (Low)`: 구조 개선/가독성 중심 항목

## 리팩토링 항목

### 1) API/백그라운드 Job의 Zod 스키마 중복 통합
- 개선방향: `exam generation`, `save exam`, `image upload` 요청/응답 스키마를 공용 모듈로 통합
- 이유: 현재 동일 구조가 여러 파일에 중복되어 변경 시 누락 위험이 큼
- 중요도: `P0`
- 기대 효과: 검증 정책 일관성 확보, 변경 포인트 감소, 버그/회귀 위험 감소
- 구체적 구현 방식 및 내용:
  - `src/lib/schemas.ts` 신설
  - `examBuilderConfig`, `examQuestion`, `examSourceImage`, `generatedExamSet`, `examGenerationJobPayload/result`, `saveExamSet`, `directGenerate`, `imageUpload` 스키마 집약
  - 기존 라우트/잡 처리 로직에서 공통 스키마 import로 교체

### 2) 생성 결과 JSON 파싱 로직 통합
- 개선방향: `responseJson`에서 `generated/outputKeywords/questions`를 읽는 파서를 유틸로 분리
- 이유: 현재 `exam-builder.tsx`, `repository.ts`에서 유사 파싱이 중복
- 중요도: `P1`
- 기대 효과: 포맷 변경 대응 비용 축소, 파싱 실패 케이스 일관 처리
- 구체적 구현 방식 및 내용:
  - `src/lib/generated-exam-parser.ts` 신설
  - `extractGeneratedExamSet`, `extractOutputKeywords`, `extractQuestionsSignature` 제공
  - 기존 중복 함수 제거 후 공통 유틸 사용

### 3) `exam-builder`의 시그니처 계산/저장 상태 로직 분리
- 개선방향: 서명(signature) 계산과 unsaved 상태 판정 로직을 별도 모듈로 분리
- 이유: 1500+ 라인 단일 컴포넌트로 책임이 과도하게 집중
- 중요도: `P1`
- 기대 효과: 컴포넌트 복잡도 감소, 테스트 용이성 향상, 회귀 범위 축소
- 구체적 구현 방식 및 내용:
  - `src/lib/exam-builder-signature.ts` 신설
  - `createBuilderSignature`로 입력 정규화/문자열화 일원화
  - 컴포넌트 내 중복 서명 생성 제거

### 4) `exam-builder` 이미지 처리 파이프라인 훅/유틸 분리
- 개선방향: 이미지 압축/thumbnail 생성/용량 검증을 독립 모듈로 이동
- 이유: UI 상태 관리와 이미지 처리가 혼재되어 가독성 저하
- 중요도: `P1`
- 기대 효과: 이미지 처리 로직 재사용성 확보, 브라우저별 이슈 디버깅 용이
- 구체적 구현 방식 및 내용:
  - `src/lib/image-processing.ts` 또는 `src/hooks/useImageUploadPipeline.ts` 분리
  - 상수(`MAX_IMAGE_BYTES`, `QUALITY_STEPS`)와 처리 함수 캡슐화

### 5) Repository 계층의 JSON 파싱/레거시 변환 책임 분리
- 개선방향: DB row 변환 함수와 레거시 fallback 변환을 분리
- 이유: `repository.ts`가 800+ 라인으로 응집도가 낮음
- 중요도: `P1`
- 기대 효과: DB 스키마 변경 대응성 개선, 함수 단위 테스트 범위 명확화
- 구체적 구현 방식 및 내용:
  - `src/lib/repository-mappers.ts` 분리
  - `parseExamSet`, `parseAttempt`, `parseOpenAiLog` 등 이동

### 6) Job 상태 폴링 로직 공통화
- 개선방향: 대시보드 폴러와 빌더 폴러의 공통 전략(지연/타임아웃)을 유틸화
- 이유: 폴링 정책 상수와 제어 로직이 분산되어 동기화 어려움
- 중요도: `P2`
- 기대 효과: 상태 전이 처리 일관성, polling UX 회귀 방지
- 구체적 구현 방식 및 내용:
  - `src/lib/job-polling.ts` 신설
  - `nextDelay`, `shouldStopAutoPolling` 등 정책 함수화

### 7) 생성/저장/발행 API 에러 응답 포맷 통일
- 개선방향: API 에러 shape를 공통화 (`{ error, code? }`)
- 이유: 라우트별 에러 메시지/상태코드 처리 기준이 제각각
- 중요도: `P2`
- 기대 효과: 클라이언트 오류 처리 단순화, 로깅 품질 향상
- 구체적 구현 방식 및 내용:
  - `src/lib/api-response.ts` 유틸 추가
  - route handler에서 공통 helper 사용

### 8) 환경 변수 검증 강화
- 개선방향: 런타임에서 env schema 검증 도입
- 이유: 문자열 기본값 기반 방식은 잘못된 설정을 늦게 발견
- 중요도: `P2`
- 기대 효과: 배포 시 설정 오류 조기 감지
- 구체적 구현 방식 및 내용:
  - `zod` 기반 env parser 도입
  - 필수/선택 변수 명확화 및 오류 메시지 표준화

### 9) Dashboard list 렌더링 분할
- 개선방향: `dashboard-exam-sets-section.tsx`에서 카드/시도(trial) 블록 컴포넌트 분리
- 이유: UI와 검색/정렬/강조 로직 결합으로 파일이 비대함
- 중요도: `P2`
- 기대 효과: 렌더링 로직 단순화, 회귀 테스트 포인트 명확화
- 구체적 구현 방식 및 내용:
  - `ExamSetCard`, `AttemptItem`, `SearchHighlightText` 분리

### 10) 도메인 타입-스키마 동기화 전략 도입
- 개선방향: 타입 정의와 검증 스키마를 같은 모듈에서 관리하고 `z.infer` 활용
- 이유: 타입은 `types.ts`, 검증은 여러 route 파일로 분산
- 중요도: `P3`
- 기대 효과: 타입 불일치 예방, 신규 기능 온보딩 속도 향상
- 구체적 구현 방식 및 내용:
  - 핵심 DTO를 스키마 우선으로 선언하고 타입 추론 병행

## 실행 순서 (이번 배치)
1. `P0`: API/Job Zod 스키마 중복 통합
2. `P1`: 생성 결과 JSON 파싱 로직 통합
3. `P1`: exam-builder 시그니처 계산/상태 판단 분리

## 완료 기준
- 타입체크/빌드 통과
- 기존 엔드포인트 동작 회귀 없음
- 리팩토링 단위별 커밋 분리
