# Git 컨벤션

다믿어? 프론트 레포(UniD_8_FE)에서 쓰는 브랜치, 커밋, 이슈, PR 규칙입니다.
백엔드 레포의 CONTRIBUTING.md와 같은 규칙을 쓰고, 프론트에 맞지 않는 부분만 바꿨습니다.
이 규칙은 초기 설정 커밋(`init: Vite + React 프로젝트 생성`) 이후 커밋부터 적용합니다.

## 1. 브랜치 전략

```
main  ← 배포 브랜치
 └─ dev  ← 통합 브랜치 (모든 작업 PR이 여기로 감)
     └─ feat/…, fix/…, refactor/…, chore/…  ← 작업 브랜치
```

| 브랜치 | 용도 | 규칙 |
| --- | --- | --- |
| main | 배포 | dev → main PR로만 들어감. 담당자 한 명만 머지함 |
| dev | 개발 통합 | 작업 브랜치 PR로만 들어감. 직접 push 금지 |
| 작업 브랜치 | 기능 하나, 버그 하나 | dev에서 따고, dev로 PR 보냄. 머지 후 삭제 |

직접 push를 금지하는 이유: CI(린트·빌드)는 dev와 main으로 가는 PR에서만 돈다. dev에 직접 push하면 검사 없이 코드가 들어간다. GitHub 브랜치 보호(PR 필수, CI 통과 필수)를 dev와 main에 켠다.

> 레포 관리자가 할 일: 기본 브랜치를 dev로 바꾸고, dev와 main에 브랜치 보호를 켠다.

## 2. 브랜치 이름

`{타입}/{이슈번호}-{짧은-영어-설명}`

| 타입 | 언제 | 예시 |
| --- | --- | --- |
| feat | 새 화면, 새 컴포넌트, API 연동 | feat/3-game-play |
| fix | 버그, 잘못된 동작, 문구·스타일 수정 | fix/12-reveal-sheet-scroll |
| refactor | 동작은 그대로, 구조만 정리 | refactor/15-api-client |
| chore | 빌드, 설정, 배포, 템플릿, 의존성 | chore/1-vite-proxy |

- 소문자와 하이픈만 쓴다.
- 이슈가 있으면 번호를 꼭 넣는다. 이슈 없이 하는 작은 작업만 번호를 뺀다. 예: fix/typo-home

## 3. 커밋 메시지

`[{타입}] {한국어 요약} (#{이슈번호})`

| 타입 | 내용 |
| --- | --- |
| feat | 기능 추가 (화면, 컴포넌트, API 연동) |
| fix | 버그 수정, 문구·스타일 수정 |
| test | 테스트 추가, 수정 |
| docs | README, 문서 |
| refactor | 동작 변화 없는 구조 정리 |
| chore | 설정, 빌드, 의존성, 배포 |

예시
```
[feat] 실전 문제 화면과 길게 눌러 고르기 구현 (#3)
[feat] 판 답 제출과 정답 공개 시트 연동 (#3)
[fix] 정답 공개 시트가 하단 탭에 가려지던 문제 수정 (#12)
[docs] README에 로컬 실행 방법 추가 (#3)
[chore] Vite에 /api 프록시 설정 추가 (#1)
```

규칙
- 타입은 대괄호로 감싼다. 예: [feat], [chore]
- 요약은 "~ 추가", "~ 구현", "~ 수정"처럼 끝내고 마침표는 안 찍는다.
- 코드, 테스트, 문서는 커밋을 나눈다. 한 PR 안에서 보통 feat → test → docs 순서가 된다.
- 커밋 하나는 그 시점에 빌드가 깨지지 않게 묶는다. 예: 컴포넌트 변경과 그걸 쓰는 화면은 같은 커밋에 넣는다.
- 의존성 추가는 `package.json`과 `package-lock.json`을 함께, 별도 [chore] 커밋으로 넣는다.
- 커밋에 AI 서명이나 Co-Authored-By 줄을 넣지 않는다.

## 4. 이슈

제목: [Feat] 기능 이름, [Fix] 문제 요약, [Refactor] 대상, [Chore] 작업
라벨: ✨ feature, 🐛 fix, ♻️ refactor, 🔧 chore
본문: 템플릿의 첫 칸(한 줄 요약)과 "👀 자세한 내용" 칸을 채운다. 자세한 내용은 4칸 형식으로 쓴다.

```
[작업 목적]
- 왜 하는지

[작업 내용]
- 무엇을 만들거나 고치는지 (화면, 컴포넌트, 연동할 API 단위로)

[완료 조건]
- 어떤 상태가 되면 끝인지

[참고 사항]
- 결정한 것, 다른 파트에 공유할 것 (쓰는 API, 바꾼 공용 파일)
```

이슈 없이 해도 되는 것: 오타, 문구 한 줄, 색상 값 하나처럼 작고 설명이 필요 없는 작업. 그래도 브랜치와 PR은 쓴다.

## 5. Pull Request

제목: 이슈 제목과 같게 쓴다. 예: [Feat] 실전 문제 화면과 정답 공개
본문: PR 템플릿 헤더를 그대로 살린다.

```
## ❗️ 관련 이슈 링크
Close #3

## 🔁 작업 내용
- 무엇을 바꿨는지 (화면, 컴포넌트, API 연동 단위로)
- 어떻게 확인했는지 (로컬 실행, 실제 백엔드 연결, 휴대폰 화면 등)

## 📸 스크린샷 (Optional)

## 👀 기타 더 이야기해볼 점 (Optional)
- 이슈와 달라진 결정과 그 이유
- 다른 파트(다른 FE, BE)가 알아야 할 변경
```

규칙
- Close #번호를 쓰면 머지할 때 이슈가 자동으로 닫힌다. 이슈가 없으면 "없음"이라고 쓴다.
- 화면을 바꾼 PR은 모바일 화면 스크린샷을 꼭 붙인다.
- CI가 초록불이 된 다음에 머지한다.
- 머지 전에 dev가 앞서 나갔으면 작업 브랜치에서 git pull origin dev로 합치고, 충돌을 풀고, 린트·빌드를 다시 돌린 뒤 push한다.
- 머지 방식은 Merge commit을 쓴다. 작업 브랜치의 커밋이 그대로 남아서 나중에 기능별로 추적하기 쉽다.
- 머지한 뒤 작업 브랜치는 삭제한다.

## 6. 작업 한 번의 명령어 흐름

시작
```
cd UniD_8_FE
git checkout dev
git pull origin dev
npm ci
git checkout -b feat/3-game-play
```

마무리
```
cd UniD_8_FE
npm run lint
npm run build
git add src
git commit -m "[feat] 무엇을 구현 (#3)"
git add README.md
git commit -m "[docs] README에 무엇 안내 추가 (#3)"
git push -u origin feat/3-game-play
```

push 전에 dev가 바뀐 경우
```
git pull origin dev
npm ci
npm run lint
npm run build
git push
```

- zsh에서는 명령어 줄 끝에 # 주석을 붙이지 않는다.
- 린트나 빌드가 실패하면 커밋하지 않는다.
- dev를 받은 뒤 `package-lock.json`이 바뀌었으면 `npm ci`를 다시 한다.

## 7. 폴더 담당과 공용 파일

여러 명이 같은 파일을 고치면 충돌이 난다. 기능은 담당 폴더 안에서 만들고, 공용 파일은 따로 다룬다.

| 위치 | 담당 |
| --- | --- |
| `src/features/game/` | FE A (실전 2지선다, 정답 공개, 연승 챌린지) |
| `src/features/…` (유형 카드, 오답노트, 프로필) | FE B |
| `src/features/…` (홈, 데일리, 랭킹) | FE C |
| `src/shared/` 또는 공용 컴포넌트, 디자인 토큰 | FE C |
| `src/assets/characters/` | 공용 (유형 캐릭터 SVG) |

공용 파일: `App.tsx`, `main.tsx`, `index.css`, `vite.config.ts`, `package.json`, `package-lock.json`, 라우터 설정

- 공용 파일은 기능 PR에 섞지 않고 [chore] PR로 따로 올린다.
- 공용 파일을 바꾸는 PR은 올리기 전에 팀 채팅에 먼저 알린다.
- 의존성(npm 패키지) 추가는 팀에 먼저 말하고 넣는다. 같은 일을 하는 라이브러리를 두 개 넣지 않기 위해서다.

## 8. 레포에 넣지 않는 것

- 빌드 결과물과 설치물: `dist/`, `node_modules/`
- 개인 환경 파일: `.env.local` 등 `*.local`. 필요한 키 이름은 `.env.example`에 적는다.
- `VITE_`로 시작하는 환경변수는 브라우저에 그대로 노출된다. 비밀값(API 키, 비밀번호)은 프론트 환경변수에 넣지 않는다.
- IDE 설정(`.idea/`, `.vscode/` 개인 설정)
- AI 관련 파일, 주석, 서명

## 9. 되돌리면 안 되는 것

- 공유 브랜치(dev, main)에는 push --force를 하지 않는다.
- 머지된 커밋을 고쳐야 하면 revert 커밋이나 새 수정 PR로 처리한다.
- `package-lock.json`은 손으로 고치지 않는다. 충돌이 나면 dev 쪽 파일을 받은 뒤 `npm install`로 다시 만든다.
