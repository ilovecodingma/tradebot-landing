# 🤖 업비트 전략 테스트 봇 - Beta 랜딩페이지

백테스트와 실거래 괴리를 해결하는 투명한 트레이딩 봇의 Beta 테스터 모집 랜딩페이지입니다.

## 🚀 빠른 시작

### 로컬 개발 환경

```bash
# 의존성 설치
npm install


npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## ☁️ Cloudflare Pages 배포

### 방법 1: Cloudflare Dashboard (GUI)

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com 로그인
   - "Workers & Pages" 메뉴 클릭

2. **새 프로젝트 생성**
   - "Create application" → "Pages" → "Connect to Git" 선택
   - GitHub 저장소 연결

3. **빌드 설정**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   ```

4. **환경 변수 (선택사항)**
   - 필요 시 Settings → Environment variables 추가

5. **배포 완료**
   - `https://tradebot-landing.pages.dev` 형식의 URL 자동 생성

### 방법 2: Wrangler CLI (터미널)

```bash
# Wrangler 설치 (전역)
npm install -g wrangler

# Cloudflare 로그인
wrangler login

# 프로젝트 빌드
npm run build

# Cloudflare Pages에 배포
wrangler pages deploy dist --project-name=tradebot-landing
```

### 커스텀 도메인 연결

1. Cloudflare Dashboard → Pages → 프로젝트 선택
2. "Custom domains" → "Set up a custom domain"
3. 도메인 입력 (예: `beta.yourdomain.com`)
4. DNS 레코드 자동 설정 (Cloudflare DNS 사용 시)

## 📋 섹션 구성

1. **Hero** - 메인 헤드라인 + CTA
2. **PainPoints** - 4가지 주요 문제점
3. **Solution** - 감사 로그 시스템 소개
4. **Features** - 핵심 기능 5가지
5. **TargetUsers** - 3가지 페르소나
6. **Comparison** - 경쟁사 대비 차별점 표
7. **Demo** - 스크린샷 및 SQL 쿼리 예시
8. **BetaBenefits** - Beta 테스터 혜택
9. **CTA** - 신청 폼 (Google Form 연동)
10. **Footer** - 링크 및 법적 고지

## 🎨 커스터마이징

### 색상 변경
`tailwind.config.js`에서 primary 색상 수정

### Google Form 연동
`src/components/CTA.jsx`의 googleFormUrl 및 entry ID 수정

### 연락처 정보
Footer.jsx와 CTA.jsx에서 이메일/Discord 링크 수정

## 🛠️ 기술 스택

- React 18 + Vite
- Tailwind CSS
- Cloudflare Pages

---

**Beta 모집 기간**: 2025-01-16 ~ 2025-01-23 (선착순 30명)
