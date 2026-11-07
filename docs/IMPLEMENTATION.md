# ÉPURE ATELIER — 개발/배포·운영 가이드

## 기술 구조
- 프레임워크 미사용, HTML5/CSS3/Vanilla JS 기반, 정적 배포.
- 이미지 자산: 생성형 AI 화보 사진 JPEG, SVG 워드마크와 심볼.
- 반응형: 1440/768/390 뷰포트 최적화, 마우스 질감 확대, 모바일 메뉴, 키보드 접근.
- SEO: 각 페이지 고유 title/description/canonical/OG; sitemap.xml, feed.xml, robots.txt.
- 크론 자동화: Node.js 20+의 Blogger API v3 OAuth refresh + 중복 방지.

## 로컬 실행
```sh
python3 -m http.server 8080
# open http://localhost:8080
node --test scripts/*.test.mjs
```

## 실제 연동 전 필수
- 외부 결제/실주문/재고/POS 기능은 연결하지 않았습니다. 제품·가격은 시안입니다.
- salon.html 예약과 newsletter는 사용자의 **localStorage** 데모입니다. 실제 예약 데이터는 전송되지 않습니다. 개인 데이터가 민감하다면 데모 입력을 피하십시오.
- 예약 백엔드(Neon DB, 서버 검증, 스팸 차단, 이메일 발송, 개인정보 처리방침 등)는 운영 확정 시 추가 구축해야 합니다.
- 실제 구매 전 전자상거래 법정 고지, 이용약관, 개인정보처리방침, 환불/배송 정책, PG 승인 필요.
- 3초 WebM 원본 AI 이미지 기반 **카메라 무브먼트 루프**를 구성했습니다. 실제 모델 워킹/원단 드레이프 시뮬레이션 영상이 아니며, 고도화 시 별도 촬영 영상을 적용해야 합니다.
- OG URL `epure.lexid.site`는 목표 주소이며 실제 DNS/SSL 등록 상태는 배포 완료 후 확인해야 합니다.

## Google Blogger 양방향 콘텐츠 전략
1. 사이트의 `content/articles.json`을 RSS와 고유 canonical HTML로 발행합니다.
2. `node scripts/blogger-sync.mjs`로 미리보기 (쓰기 없음).
3. 운영자 OAuth 인증 정보를 환경변수로 설정한 후 `--apply`로 **비공개 임시글** 동기화합니다. 명시적으로 `--publish`를 더해야 공개합니다.
4. 외부 포스트는 `scripts/blogger-pull.mjs`로 RSS 읽기 → `content/blogger-cache.json` 생성하여 사이트/별도 배포 빌드에 반영할 수 있습니다.
5. 순환 게시 방지: 사이트에서 생성한 글은 태그 `epure-origin` 부착, title 기반 중복 체크, 자동 생성 글의 canonical은 사이트 원문을 안내합니다.
6. 운영 채널 URL과 실제 인증이 없어 Blogger 실계정 연결은 아직 완료되지 않았습니다.

### 환경변수(절대 커밋 금지)
`BLOGGER_BLOG_ID`, `BLOGGER_CLIENT_ID`, `BLOGGER_CLIENT_SECRET`, `BLOGGER_OAUTH_REFRESH_TOKEN`; 선택: `BLOGGER_URL`.

## 배포/품질 점검
- 각 HTML 화면 5종/블로그 화면 5종은 `previews/`에 저장합니다.
- 배포 시 기존 프로젝트/도메인과 충돌하지 않도록 Vercel 프로젝트 중복 확인.
- 이미지 교체 전 기존 파일 백업 및 비교, 원본 이미지 삭제 금지.
