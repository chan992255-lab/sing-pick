# 싱픽 (SingPick) 🎤

대한민국 국민 노래방 필수 웹앱. TJ·금영 곡번호 검색부터 연령대별 인기차트, 상황별 추천,
랜덤 선곡 룰렛, 내 키·메모 애창곡, 오늘의 셋리스트 공유, 가사, 녹음 스튜디오까지 한 곳에 담았습니다.

- 라이브: Vercel 배포 (아래 "배포" 참고)
- 스택: React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + PWA
- 서버: Vercel Serverless Functions (`api/*`) — 외부 노래방 사이트는 CORS 가 막혀 있어 서버에서 대신 조회합니다.

## 기능

| 영역 | 내용 |
| --- | --- |
| 전체 곡 검색 | 곡명·가수·**TJ/금영 곡번호**로 실시간 검색. 내장 DB 즉시 검색 + `api/search` 실시간 결과를 합쳐 보여 주고, 실시간이 막히면 내장 DB로 자동 폴백 |
| 인기 차트 | **TJ미디어 공식 HOT100**을 실시간으로 받아 표시(`api/chart`), 실패 시 싱픽 대표곡으로 폴백. 차트마다 기준을 화면에 명시 |
| 연령대 TOP | 전체 / 10대 / 20대 / 30대 / 40대 / 50대+ 큐레이션 차트(각 15곡, TJ·금영 실제 번호 포함) |
| 상황별 추천 | 혼코노 · 친구들이랑 · 떼창 · 썸·데이트 · 고음 해소 · 회식·가족 |
| 랜덤 룰렛 | 분위기 선택 후 8칸 룰렛 → 오늘 부를 한 곡 추천 |
| 애창곡 | 곡마다 내 키(-6~+6), 템포(±20%), 팁 메모, 부른 횟수 저장 (localStorage) |
| 셋리스트 | 오늘 부를 곡을 순서대로 담고, **로그인 없이 열리는 공유 링크** 생성(URL 해시에 곡 정보 인코딩) |
| 18번 찾기 | 3문항(목 상태·분위기·동행)으로 오늘의 노래 3곡 추천 |
| 노래 듣기 | 곡 상세·녹음 스튜디오에서 **반주(MR)/원곡** 유튜브 영상을 앱 안에서 바로 재생(`api/youtube`). 임베드 제한 시 '유튜브에서 열기'·'Apple Music 검색' 링크 제공 |
| 가사 | 공개 가사 DB [LRCLIB](https://lrclib.net) 프록시(`api/lyrics`). 없으면 "등록된 가사를 찾지 못했어요" + 네이버 가사 검색 버튼 (가사를 지어내지 않음) |
| 녹음 스튜디오 | MediaRecorder + Web Audio API. 타이머·입력 레벨 미터, 카운트다운(끔/3/5초), 노래방 에코(Delay+피드백), 입력 게인, 음질(96/192kbps), IndexedDB 저장·다시 듣기·다운로드, 녹음 중 가사 보기 |
| PWA | 홈 화면 설치(manifest·아이콘·서비스 워커), Open Graph/검색 메타태그 |

## 데이터 출처

- **TJ 곡번호·가수·제목**: TJ미디어 공식 사이트(반주곡 검색·차트) 실시간 조회 (`api/_lib/tj.js`)
- **금영 곡번호**: 공개 노래방 DB `api.manana.kr` (`/karaoke/song/{제목}.json`)
- **내장 곡 DB(180곡)**: `scripts/songs.source.mjs` 의 큐레이션 목록을 `npm run songs` 로 실행해
  위 두 소스에서 **실제 번호를 조회해** `src/data/songs.ts` 로 굽습니다. (곡번호를 손으로 적지 않습니다)
- **가사**: LRCLIB 공개 API

> TJ·금영 곡번호는 각 사의 실제 수록 정보를 조회한 값입니다. 노래방 기기 버전에 따라 번호가 다를 수 있어요.

## 개발

```bash
npm install
npm run dev       # http://localhost:5173 (Vite)
npm run build     # tsc --noEmit && vite build
npm run preview   # 빌드 결과 미리보기
npm run songs     # 내장 곡 DB 재생성 (네트워크 필요)
node scripts/test-api.mjs   # 서버리스 함수 로컬 호출 테스트
```

`api/*.js` 는 Vercel Node 함수입니다. 로컬에서 API까지 함께 보고 싶으면 `vercel dev` 를 쓰세요.

## 배포

- GitHub: `chan992255-lab/sing-pick`
- Vercel: 프로젝트 `sing-pick` (Root `./`, Framework Vite, Build `npm run build`, Output `dist`)
- `vite.config.ts` 는 Vercel(`VERCEL` 환경변수)에서는 `base = '/'`, GitHub Pages 백업 배포에서는 `/sing-pick/` 로 동작합니다.
- 라우팅은 해시 방식(`#/search`)이라 별도 rewrite 없이 정적 호스팅에서도 새로고침이 안전합니다.
