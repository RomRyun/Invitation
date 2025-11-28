# 💒 모바일 청첩장

> 아롬 ♥ 경륜의 결혼을 알리는 모바일 청첩장입니다.

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/Framer_Motion-11.x-FF0055?style=flat-square&logo=framer" />
</p>

---

## ✨ 주요 기능

### 🎨 디자인
- **글래스모피즘 UI** - 모던하고 세련된 반투명 카드 디자인
- **부드러운 애니메이션** - Framer Motion 기반 스크롤/인터랙션 애니메이션
- **컬러 테마 시스템** - 핑크/그린 테마 선택 가능
- **모바일 퍼스트** - 모바일 최적화, PC에서도 깔끔하게 표시

### 📱 기능
- **플로팅 목차** - 원터치로 원하는 섹션으로 이동
- **갤러리** - 스와이프로 사진 넘기기, 탭하면 확대
- **지도 연동** - 네이버/카카오/T맵 바로가기
- **계좌번호 복사** - 원클릭 계좌번호 복사

### 🔤 폰트
- **나눔명조** - 클래식한 제목용 세리프
- **프리텐다드** - 가독성 좋은 본문용 고딕
- **마루부리** - 모던 세리프 (예비용)
- **Cormorant Garamond** - 영문 타이틀

---

## 🚀 시작하기

### 설치
```bash
npm install
```

### 개발 서버
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

---

## ⚙️ 설정

모든 텍스트와 설정은 `src/config.js`에서 관리됩니다.

```javascript
export const config = {
  // 테마: ColorTheme.PINK (1) 또는 ColorTheme.GREEN (2)
  colorTheme: ColorTheme.GREEN,
  
  // 히어로 배경 이미지
  hero: {
    backgroundImage: '/bg.jpg',
    backgroundOpacity: 0.5,
    useBackgroundImage: true,
  },
  
  // 신랑/신부 정보
  groom: { name: '아롬', fullname: '이아롬', ... },
  bride: { name: '경륜', fullname: '신경륜', ... },
  
  // 결혼식 정보
  wedding: { date: '2026-04-18', time: '13:00', ... },
  
  // 예식장 정보
  venue: { name: '에스가든웨딩홀 청주점', ... },
  
  // 갤러리 이미지
  gallery: ['/gallery_1.jpg', '/gallery_2.jpg', ...],
  
  // 계좌 정보
  accounts: { groom: {...}, bride: {...} },
};
```

---

## 📁 이미지 가이드

`public/` 폴더에 이미지를 넣어주세요:

| 파일명 | 용도 | 권장 사이즈 |
|--------|------|-------------|
| `bg.jpg` | 히어로 배경 | 1080×1440 (3:4) |
| `gallery_1.jpg` ~ `gallery_4.jpg` | 갤러리 | 1080×1350 (4:5) |
| `pixel_art.gif` | 픽셀아트 | 자유 |

---

## 🌐 배포

[Vercel](https://vercel.com)에 배포하면 자동으로 HTTPS가 적용됩니다.

```bash
# Vercel CLI로 배포
npx vercel --prod
```

또는 GitHub 연동 후 자동 배포 설정

---

## 📝 라이선스

MIT License

---

<p align="center">
  Made with ♥ by RomRyun
</p>
