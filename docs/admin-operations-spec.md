# 관리자 운영 페이지 기능 스펙 (v0.1)

작성일: 2026-03-27

## 0. 목적
운영자가 **스케줄 작업**, **서비스 사용량/장애 지표**, **로그 추적**, **사용자 풀 상태**를 한 곳에서 확인하고 즉시 대응할 수 있도록 관리자 페이지 기능을 확장한다.

---

## 1. IA(정보구조) 제안

현재 요청 항목(1~4)을 기준으로 아래처럼 재분류한다.

### A. Operations (운영 작업)
- 스케줄 작업 현황
- 수동 작업 실행
- 작업 이력

### B. Observability (관측/모니터링)
- 서비스 헬스 체크
- 처리량, 실패율, 비용 추정
- 이상 사용 탐지

### C. Logs & Trace (로그 탐색)
- OpenAI request/response 조회
- 필터, 검색, 트레이스 연계

### D. Users (사용자 관리)
- 가입/활성/이탈 추이
- 제재(일시정지 등)
- 피드백 수집/조회

> 결정: 2번과 3번은 완전 통합이 아니라, **B(메트릭 대시보드) + C(원본 로그 탐색)** 으로 분리하고 상호 링크를 제공한다.

---

## 2. 기능 스펙 상세

## 2.1 스케줄 작업 현황 및 수동 작업 실행

### 2.1.1 고아 이미지 파일 삭제

#### 화면 요구사항
1) **현황 카드**
- 고아 이미지 수 (예: `orphaned_count`)
- 총 용량 추정 (예: `orphaned_bytes`)
- 마지막 탐지 시각

2) **스케줄 뷰**
- 다음 실행 예정 시각
- 최근 N회 실행 결과 (성공/실패, 처리 건수, 소요 시간)

3) **처리 기록 뷰**
- 구분: `scheduled` / `manual`
- 실행자(`system` 또는 admin user id)
- 삭제된 파일 수, 실패 수, 에러 요약

4) **수동 실행 버튼**
- Dry-run 옵션 (삭제 없이 대상만 계산)
- 실행 잠금(동시 실행 방지)
- 실행 후 작업 ID 반환 및 상태 폴링

#### API 초안
- `GET /api/admin/storage-cleanup/summary`
- `GET /api/admin/storage-cleanup/runs?type=&status=&cursor=`
- `POST /api/admin/storage-cleanup/run`  
  body: `{ dryRun: boolean }`

#### 서버 처리 규칙
- idempotency key 지원(중복 클릭 방지)
- 실행 중 재실행 요청 시 `409 Conflict`
- 상세 에러는 내부 로그 저장, UI에는 요약 메시지 노출

---

## 2.2 서비스 이용 현황

### 2.2.1 서비스 헬스 체크

#### 체크 항목
- API 응답 성공률 (5xx, timeout)
- DB 연결/쿼리 지연
- OpenAI API 연결성/지연
- 백그라운드 작업 큐 정체 여부

#### 상태 기준
- `healthy` / `degraded` / `down`
- 최근 5분 기준으로 계산, 임계치 설정 가능

### 2.2.2 시간당 처리량 + 비용 추정

#### 조회 단위 권장안
운영 관점에서 아래 버킷을 제공:
- **15분**: 장애/급증 탐지
- **1시간**: 일일 운영 기본 단위
- **6시간**: 추세 확인(노이즈 완화)
- **1일**: 주간/월간 리포트
- **1주**: 월간 추세 비교

> 3시간/4시간은 UX 복잡도를 높이는 대비 효용이 낮아 1차 제외.

#### 지표
- 요청 수, 성공 수, 실패 수, 평균/95p 지연
- 토큰 사용량(prompt/completion/total)
- 추정 비용(USD, KRW 환산 선택)

#### 예산/비용
- 주간/월간 Budget 설정
- 현재 사용량 대비 예상 소진일(Projection)
- Budget 70/90/100% 알림 상태

### 2.2.3 작업 실패 건수/비율

실패 사유 분리:
- `openai_request_failure` (네트워크, timeout, rate limit, 5xx)
- `openai_response_failure` (파싱 실패, schema 불일치, 안전필터 결과)
- `internal_processing_failure` (DB, 내부 로직)

메트릭:
- 실패 건수
- 실패율 = 실패/전체
- Top error code/message

---

## 2.3 이상 사용 탐지

### 2.3.1 사용자/IP 과다 요청 탐지

#### 정책 레벨
1) Soft limit: 경고 + 지연 증가
2) Hard limit: 일정 기간 차단(예: 10분)
3) 반복 위반: 수동 심사 큐로 이동

#### 권장 구현
- 사용자 + IP 이중 키 기반 rate limit
- Sliding window (예: 1분, 10분)
- 즉시 차단보다 **quota + 점진적 제한** 우선

### 2.3.2 프롬프트 주입 시도

#### 탐지
- 규칙 기반 키워드 + 패턴 스코어
- 모델 출력/요청 내 안전 이벤트 플래그

#### 대응
- 낮은 위험: 경고 이벤트 기록
- 중간 위험: 응답 제한(안전 템플릿)
- 높은 위험: 요청 차단 + 관리자 알림

---

## 2.4 로그 검색 및 조회

### 목적
메트릭에서 이상을 발견했을 때 원본 이벤트로 즉시 Drill-down 가능해야 한다.

### 조회 대상
- OpenAI request/response (민감정보 마스킹)
- correlation id / user id / ip / model / route
- latency, token usage, error class

### UI 기능
- 시간 범위 필터(기본 최근 24h)
- 다중 필터(user, ip, status, error type)
- 전문 검색(요청/응답 본문 일부)
- row 클릭 시 상세 패널
- Observability 화면과 상호 링크

---

## 2.5 사용자 풀 관리

### 2.5.1 사용자 지표
- 가입자 수(일/주/월)
- 활성 사용자(DAU/WAU/MAU)
- 휴면/이탈 추정
- 코호트 리텐션(2차)

### 2.5.2 제재 관리
- 사용자 상태: `active`, `suspended`, `deleted`
- 제재 사유 및 종료 시각
- 작업 로그(누가 언제 변경했는지)

### 2.5.3 사용자 의견
- 인앱 피드백 수집(유형/내용/스크린샷 optional)
- 관리자 목록/상태 변경(`new`, `in_review`, `resolved`)
- 이메일 전달 연동(옵션)

---

## 3. 데이터 모델(초안)

### 3.1 운영 작업
- `admin_job_runs`
  - `id`, `job_type`, `run_type(scheduled|manual)`, `status`, `started_at`, `finished_at`
  - `triggered_by`, `target_count`, `processed_count`, `failed_count`, `error_summary`

### 3.2 메트릭 집계
- `metric_time_buckets`
  - `bucket_start`, `bucket_size`, `metric_name`, `value`, `tags(jsonb)`

### 3.3 이상 탐지 이벤트
- `abuse_events`
  - `id`, `user_id`, `ip_hash`, `event_type`, `risk_level`, `action_taken`, `created_at`

### 3.4 로그 인덱스
- `ai_logs`
  - `id`, `timestamp`, `correlation_id`, `user_id`, `ip_hash`, `route`, `model`
  - `request_excerpt`, `response_excerpt`, `latency_ms`, `status`, `error_type`, `token_usage`

### 3.5 사용자 관리
- `user_admin_events`
  - `id`, `user_id`, `action`, `reason`, `actor_id`, `created_at`
- `user_feedback`
  - `id`, `user_id`, `category`, `message`, `status`, `created_at`

---

## 4. 권한/보안/개인정보
- 관리자 Role 기반 접근 통제(RBAC)
- 민감 텍스트 마스킹(이메일, 전화번호, 주소, 토큰)
- IP는 원문 저장 대신 해시 저장 권장
- 로그 상세 조회는 감사 로그 남김
- export 기능은 1차 제외(2차 검토)

---

## 5. API/화면 구현 우선순위 (MVP → Phase 2)

### MVP (2~3주)
1. 고아 이미지 정리 운영뷰 + 수동 실행 + 실행 이력
2. 서비스 헬스 + 처리량(15m/1h/1d) + 실패율 대시보드
3. OpenAI 로그 조회(기본 필터 + 상세)

### Phase 2
1. 예산/비용 projection + 경고 알림
2. 이상 사용 탐지 자동 제재(soft/hard)
3. 사용자 풀 지표/제재/피드백 통합

---

## 6. KPI / 완료 기준
- 운영자가 5분 내 장애 원인 후보를 식별 가능
- 고아 이미지 수동 실행 성공률 99%+
- OpenAI 실패 유형 분류율 95%+
- 비정상 요청 탐지 후 자동 대응 latency < 1분

---

## 7. 오픈 이슈
1. 비용 추정 환율 기준(실시간 vs 일 단위 고정)
2. 로그 보관기간(예: 30/90/180일)
3. 피드백 채널(이메일 단독 vs 티켓 시스템 연동)
4. 제재 정책의 법무/개인정보 검토 필요

---

## 8. 구현 시 권장 라우트 구조(Next.js)
- `/app/admin/operations`
- `/app/admin/observability`
- `/app/admin/logs`
- `/app/admin/users`

기존 `/app/admin/ai-logs`는 `/app/admin/logs`로 통합하고, 하위 탭으로 `AI Logs`를 두는 방안을 권장.
