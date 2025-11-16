# 🚀 Cloudflare Pages 배포 가이드

## 빠른 배포 (5분 완료)

### 사전 준비물
- ✅ Cloudflare 계정 (무료)
- ✅ GitHub 계정 (저장소 연결용)
- ✅ 프로젝트 빌드 완료 (`npm run build`)

---

## 방법 1: GitHub 연동 배포 (추천)

### Step 1: GitHub에 코드 푸시

```bash
cd C:\Users\user\Desktop\tradebot-landing

# Git 초기화 (아직 안 했다면)
git init
git add .
git commit -m "Initial commit: Beta landing page"

# GitHub 저장소 생성 후
git remote add origin https://github.com/yourusername/tradebot-landing.git
git branch -M main
git push -u origin main
```

### Step 2: Cloudflare Dashboard 설정

1. **로그인**
   - https://dash.cloudflare.com 접속
   - 계정 로그인 (없으면 무료 가입)

2. **Pages 프로젝트 생성**
   - 왼쪽 메뉴: `Workers & Pages` 클릭
   - `Create application` 버튼
   - `Pages` 탭 → `Connect to Git` 선택

3. **저장소 연결**
   - GitHub 인증 (처음이면 승인 필요)
   - `tradebot-landing` 저장소 선택
   - `Begin setup` 클릭

4. **빌드 설정 입력**
   ```
   Project name: tradebot-landing
   Production branch: main
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   ```

5. **환경 변수 (선택)**
   - 현재는 설정 불필요
   - 나중에 `Settings > Environment variables`에서 추가 가능

6. **배포 시작**
   - `Save and Deploy` 클릭
   - 약 1-2분 대기
   - ✅ 배포 완료: `https://tradebot-landing.pages.dev`

### Step 3: 자동 배포 확인

이제부터 GitHub에 푸시할 때마다 자동으로 재배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "Update CTA button color"
git push

# → Cloudflare가 자동으로 감지하여 재빌드 & 재배포
```

---

## 방법 2: Wrangler CLI 직접 배포

GitHub 없이 로컬에서 직접 배포하는 방법:

### Step 1: Wrangler 설치

```bash
# 전역 설치
npm install -g wrangler

# 또는 프로젝트 내 설치
npm install -D wrangler
```

### Step 2: Cloudflare 로그인

```bash
wrangler login
```

- 브라우저가 자동으로 열림
- "Allow Wrangler" 클릭하여 인증

### Step 3: 프로젝트 빌드

```bash
npm run build
```

### Step 4: 배포 실행

```bash
# 첫 배포
wrangler pages deploy dist --project-name=tradebot-landing

# 이후 배포 (프로젝트명 생략 가능)
wrangler pages deploy dist
```

### Step 5: 배포 확인

```bash
# 터미널에 출력되는 URL 확인
✨ Success! Uploaded 3 files (1.23 sec)
✨ Deployment complete! Take a peek over at https://abc123.tradebot-landing.pages.dev
```

---

## 커스텀 도메인 연결

### 무료 서브도메인 (예: beta.yourdomain.com)

1. **Cloudflare Dashboard 접속**
   - Pages → `tradebot-landing` 프로젝트 선택
   - `Custom domains` 탭 클릭

2. **도메인 추가**
   - `Set up a custom domain` 버튼
   - 도메인 입력: `beta.yourdomain.com`
   - `Begin DNS setup` 클릭

3. **DNS 설정 (자동 또는 수동)**

   **Option A: Cloudflare DNS 사용 시 (자동)**
   - "Activate domain" 클릭
   - DNS 레코드 자동 생성 완료

   **Option B: 외부 DNS 사용 시 (수동)**
   - CNAME 레코드 추가:
     ```
     Type: CNAME
     Name: beta
     Target: tradebot-landing.pages.dev
     ```

4. **SSL 인증서 (자동)**
   - Cloudflare가 자동으로 Let's Encrypt 인증서 발급
   - 약 5-10분 소요
   - ✅ 완료: `https://beta.yourdomain.com`

---

## 배포 후 체크리스트

### 필수 확인 사항

- [ ] 페이지 로딩 정상 (https://your-url.pages.dev)
- [ ] 모든 섹션 표시 정상 (Hero ~ Footer)
- [ ] CTA 버튼 클릭 시 폼 표시
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] Tailwind 스타일 적용 확인

### Google Form 연동 설정

1. **Google Form 생성**
   - https://forms.google.com 접속
   - 새 폼 생성: "Beta 테스터 신청"
   - 질문 추가:
     ```
     1. 이름/닉네임 (단답형)
     2. 업비트 거래 경력 (객관식)
     3. 현재 사용 중인 봇 (단답형)
     4. 가장 큰 불편점 (장문형)
     5. 연락처 (단답형)
     ```

2. **Entry ID 확인**
   ```bash
   # Google Form에서 "미리 채워진 링크 가져오기"
   # 더미 데이터 입력 후 링크 복사
   # URL 예시:
   # https://docs.google.com/forms/d/e/ABC123/viewform?entry.111=홍길동&entry.222=1to3years...

   # entry.111, entry.222 같은 ID 복사
   ```

3. **CTA.jsx 수정**
   ```js
   // src/components/CTA.jsx 파일 열기
   const googleFormUrl = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';

   // fetch에서 entry ID 매핑
   body: new URLSearchParams({
     'entry.111': formData.name,
     'entry.222': formData.experience,
     'entry.333': formData.currentBot,
     'entry.444': formData.painPoint,
     'entry.555': formData.contact
   })
   ```

4. **재배포**
   ```bash
   git add src/components/CTA.jsx
   git commit -m "Connect Google Form"
   git push  # GitHub 연동 시 자동 배포
   ```

### 연락처 정보 업데이트

#### Footer.jsx
```js
// 이메일
<a href="mailto:beta@example.com">  // → beta@yourdomain.com

// Discord
<a href="https://discord.gg/example">  // → 실제 초대 링크
```

#### CTA.jsx
```js
// Alternative Contact 섹션
<a href="mailto:beta@example.com">
<a href="https://discord.gg/example">
```

### Google Analytics 추가 (선택)

1. **GA4 프로퍼티 생성**
   - https://analytics.google.com 접속
   - 새 프로퍼티 생성 → 측정 ID 복사 (G-XXXXXXXXXX)

2. **index.html 수정**
   ```html
   <!-- public/index.html 또는 index.html -->
   <head>
     <!-- Google tag (gtag.js) -->
     <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
     <script>
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-XXXXXXXXXX');
     </script>
   </head>
   ```

3. **이벤트 추적 (CTA.jsx)**
   ```js
   const handleSubmit = (e) => {
     e.preventDefault();

     // Google Analytics 이벤트
     if (window.gtag) {
       window.gtag('event', 'beta_signup', {
         'event_category': 'engagement',
         'event_label': formData.experience
       });
     }

     // ... 기존 로직
   };
   ```

---

## 성능 최적화 (선택)

### 이미지 최적화

실제 스크린샷 추가 시:

```bash
# 이미지 압축 도구 설치
npm install -D vite-plugin-imagemin

# vite.config.js에 플러그인 추가
import viteImagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    react(),
    viteImagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      webp: { quality: 80 }
    })
  ]
}
```

### 폰트 로딩 최적화

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

---

## 트러블슈팅

### 빌드 실패: "Cannot find module..."

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tailwind 스타일 미적용

1. `src/index.css` 상단 확인:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

2. `tailwind.config.js`의 `content` 경로 확인:
   ```js
   content: ["./index.html", "./src/**/*.{js,jsx}"]
   ```

### Cloudflare 배포 후 404 에러

- SPA 라우팅 설정 필요 (현재는 단일 페이지라 문제 없음)
- 나중에 React Router 추가 시:
  ```bash
  # public/_redirects 파일 생성
  /*    /index.html   200
  ```

### 폼 제출 안 됨

1. 브라우저 개발자 도구 → Console 탭 확인
2. Google Form URL 및 entry ID 재확인
3. CORS 에러 시: `mode: 'no-cors'` 설정 확인

---

## 비용

- **Cloudflare Pages**: 무료 (월 500 빌드 무료)
- **대역폭**: 무제한 (무료)
- **도메인**:
  - .pages.dev 서브도메인: 무료
  - 커스텀 도메인: 도메인 등록비만 (연 $10-15)

---

## 다음 단계

1. ✅ 배포 완료 → URL 확인
2. 📧 Google Form 연동 → Entry ID 설정
3. 📊 Google Analytics 추가 → 트래픽 추적
4. 🔗 커스텀 도메인 연결 → `beta.yourdomain.com`
5. 📣 마케팅 시작 → 네이버 카페/YouTube/Discord

---

**배포 완료 예상 시간**: 10-15분
**월 유지비**: 0원 (Cloudflare Pages 무료 플랜)
