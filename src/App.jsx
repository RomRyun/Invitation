import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { config, colorPalettes } from './config';
import './App.css';

// 현재 테마 색상
const theme = colorPalettes[config.colorTheme];

function App() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState({ 
    groom: false, bride: false, 
    groomFather: false, groomMother: false,
    brideFather: false, brideMother: false 
  });
  const [expandedAccount, setExpandedAccount] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [activeMapTab, setActiveMapTab] = useState('naver');
  const [activeCalendarTab, setActiveCalendarTab] = useState('google');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const touchStartTime = useRef(0);
  const touchMoved = useRef(false);

  // 목차 데이터
  const menuItems = [
    { id: 'greeting', label: '인사말' },
    { id: 'story', label: '우리의 이야기' },
    { id: 'gallery', label: '갤러리' },
    { id: 'location', label: '오시는 길' },
    // { id: 'dday', label: 'D-Day' },
    // { id: 'calendar', label: '캘린더' },
    { id: 'account', label: '마음 전하실 곳' },
  ];

  // 메뉴 아이템 클릭 시 스크롤
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // D-Day 카운터
  useEffect(() => {
    const targetDate = new Date(`${config.wedding.date}T${config.wedding.time}:00`).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // 계좌번호 복사 함수
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [type]: true });
      setTimeout(() => {
        setCopied({ ...copied, [type]: false });
      }, 2000);
    });
  };

  // 갤러리 이미지 배열
  const galleryImages = config.gallery.filter(Boolean);

  // 갤러리 스와이프 핸들러 (터치)
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
    touchStartTime.current = Date.now();
    touchMoved.current = false;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = startX - currentX;
    const diffY = startY - currentY;

    // 수평 이동이 수직 이동보다 크면 스와이프로 판단
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 20) {
      touchMoved.current = true;
      // 더 민감한 스와이프 감지 (애플 스타일)
      if (Math.abs(diffX) > 40) {
        if (diffX > 0 && currentImageIndex < galleryImages.length - 1) {
          setCurrentImageIndex(currentImageIndex + 1);
          setIsDragging(false);
        } else if (diffX < 0 && currentImageIndex > 0) {
          setCurrentImageIndex(currentImageIndex - 1);
          setIsDragging(false);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTime.current;
    // 짧은 터치 + 이동 없음 = 탭 (이미지 확대)
    if (touchDuration < 200 && !touchMoved.current) {
      setModalImageIndex(currentImageIndex);
      setShowModal(true);
    }
    setIsDragging(false);
  };

  // 마우스 핸들러 (PC용)
  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsDragging(true);
    touchMoved.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diffX = startX - currentX;

    if (Math.abs(diffX) > 20) {
      touchMoved.current = true;
    }

    // 더 부드러운 마우스 드래그 감지
    if (Math.abs(diffX) > 40) {
      if (diffX > 0 && currentImageIndex < galleryImages.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        setIsDragging(false);
      } else if (diffX < 0 && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
        setIsDragging(false);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 이미지 클릭 (PC용 확대)
  const handleImageClick = (e) => {
    if (!touchMoved.current) {
      setModalImageIndex(currentImageIndex);
      setShowModal(true);
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

  // ICS 파일 다운로드 함수
  const downloadICS = () => {
    const dateFormatted = config.wedding.date.replace(/-/g, '');
    const timeFormatted = config.wedding.time.replace(':', '') + '00';
    
    const event = {
      title: `${config.groom.name} & ${config.bride.name} 결혼식`,
      description: `${config.venue.name}에서 열리는 결혼식에 초대합니다.`,
      location: `${config.venue.name} (${config.venue.address})`,
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//KR
BEGIN:VEVENT
UID:wedding-${config.wedding.date}@invitation
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${dateFormatted}T${timeFormatted}
DTEND:${dateFormatted}T${String(parseInt(config.wedding.time.split(':')[0]) + 2).padStart(2, '0')}0000
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wedding-invitation.ics';
    link.click();
  };

  // 지도 탭 데이터
  const mapTabs = [
    { id: 'naver', label: '네이버 지도', color: '#03C75A' },
    { id: 'kakao', label: '카카오맵', color: '#FEE500' },
    { id: 'tmap', label: 'T맵', color: '#E4002B' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.bgGradient 
    }}>
      <div className="page-container">
      {/* 이미지 확대 모달 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              cursor: 'pointer'
            }}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              src={galleryImages[modalImageIndex]}
              alt="확대 이미지"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '0.5rem',
                cursor: 'default'
              }}
            />
            {/* 닫기 버튼 */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            {/* 이미지 인디케이터 */}
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.5rem'
            }}>
              {galleryImages.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: index === modalImageIndex ? '1.5rem' : '0.5rem',
                    height: '0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: index === modalImageIndex ? 'white' : 'rgba(255, 255, 255, 0.4)',
                    transition: 'all 300ms'
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - 표지 페이지 */}
      <section className="page page-cover" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate'
      }}>
        {/* 배경 이미지 */}
        {config.hero?.useBackgroundImage && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: config.hero.backgroundOpacity || 0.3,
            zIndex: 0
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${config.hero.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              filter: 'blur(0.5px)'
            }}></div>
          </div>
        )}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: theme.bgOverlay,
          zIndex: 1
        }}></div>
        
        {/* 상단: WEDDING INVITATION */}
        {/* 메인 타이틀 영역 */}
        <motion.div
          style={{
            position: 'relative',
            zIndex: 10,
            paddingTop: '3rem',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* 메인 타이틀 - 세련된 도시 스타일 */}
          <motion.div 
            style={{ 
              fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', 
              letterSpacing: '-0.02em', 
              color: theme.textPrimary, 
              fontWeight: 300,
              textAlign: 'center',
              lineHeight: 1.15,
              textShadow: 'none'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {config.hero.titleLine1}
            {config.hero.titleLine2 && (
              <span style={{ display: 'block' }}>{config.hero.titleLine2}</span>
            )}
          </motion.div>
        </motion.div>

        {/* 중앙: 신랑 신부 이름 + 날짜 */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
          padding: '2rem 1.5rem'
        }}>
          {/* 이름 */}
          <motion.div
            style={{ 
              textAlign: 'center',
              marginBottom: '2rem'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ 
                fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)', 
                fontWeight: 400, 
                color: theme.textPrimary, 
                letterSpacing: '0.05em',
                textShadow: 'none'
              }}>{config.groom.name}</span>
              <motion.span 
                style={{ 
                  fontSize: '1.25rem',
                  color: theme.heart
                }}
                animate={{ 
                  scale: [1, 1.15, 1],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: 'loop'
                }}
              >♥</motion.span>
              <span style={{ 
                fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)', 
                fontWeight: 400, 
                color: theme.textPrimary,
                letterSpacing: '0.05em',
                textShadow: 'none'
              }}>{config.bride.name}</span>
            </div>
          </motion.div>

          {/* 날짜 - 세로 배치 */}
          <motion.div
            style={{
              textAlign: 'center'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* 년월일 */}
            <div style={{
              fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 'clamp(0.9375rem, 2.5vw, 1.125rem)',
              fontWeight: 300,
              color: theme.textSecondary,
              letterSpacing: '0.02em',
              marginBottom: '0.375rem',
              textShadow: 'none'
            }}>
              {config.wedding.year} {config.wedding.monthDay}
            </div>
            {/* 요일 시간 */}
            <div style={{ 
              fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 'clamp(0.8125rem, 2vw, 0.9375rem)', 
              fontWeight: 300,
              letterSpacing: '0.02em',
              color: theme.textTertiary,
              textShadow: 'none'
            }}>
              {config.wedding.dayOfWeek} {config.wedding.timeText}
            </div>
          </motion.div>

          {/* 장소 */}
          <motion.div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div style={{ 
              fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 'clamp(0.8125rem, 2vw, 0.9375rem)', 
              color: theme.textSecondary, 
              fontWeight: 300,
              letterSpacing: '0.02em',
              textShadow: 'none'
            }}>
              {config.venue.name} {config.venue.branch}
            </div>
          </motion.div>
        </div>

        {/* 스크롤 화살표 */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <svg style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* 인사말 Section - 페이지 1 */}
      <section id="greeting" className="page page-left">
        <div className="container">
          <motion.div
            style={{
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '1.5rem',
              padding: '3rem 2.5rem',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              maxWidth: '100%'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 style={{
              fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1.5rem',
              fontWeight: 500,
              textAlign: 'center',
              marginBottom: '2.5rem',
              color: theme.textPrimary,
              letterSpacing: '-0.01em'
            }}>{config.sectionTitles.greeting}</h2>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              color: theme.textSecondary,
              lineHeight: 1.75,
              fontSize: '1rem',
              textAlign: 'center',
              fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
            }}>
              <p style={{ fontWeight: 300 }}>
                {config.greeting.message.map((line, i) => (
                  <span key={i}>{line}{i < config.greeting.message.length - 1 && <br />}</span>
                ))}
              </p>
              <p style={{ fontWeight: 300, paddingTop: '0.5rem' }}>
                {config.greeting.subMessage.map((line, i) => (
                  <span key={i}>{line}{i < config.greeting.subMessage.length - 1 && <br />}</span>
                ))}
              </p>
            </div>
            <div style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: `1px solid ${theme.cardBorder}`,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              color: theme.textSecondary,
              fontSize: '0.875rem',
              fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
            }}>
              <p style={{ fontWeight: 300 }}>{config.groom.fatherName} · {config.groom.motherName}의 {config.groom.relation} {config.groom.name}</p>
              <p style={{ fontWeight: 300 }}>{config.bride.fatherName} · {config.bride.motherName}의 {config.bride.relation} {config.bride.name}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 픽셀아트 Section - 페이지 2 */}
      <section id="story" className="page page-right">
        <div className="container">
          <motion.div
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: '0.75rem',
              padding: '4rem 3rem',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
              border: `1px solid ${theme.cardBorder}`,
              overflow: 'hidden',
              maxWidth: '100%'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 style={{
              fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1.5rem',
              fontWeight: 500,
              textAlign: 'center',
              marginBottom: '2.5rem',
              color: theme.textPrimary,
              letterSpacing: '-0.01em'
            }}>{config.sectionTitles.story}</h2>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px'
            }}>
              <img 
                src={config.pixelArt}
                alt="픽셀아트" 
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const errorDiv = e.target.nextElementSibling;
                  if (errorDiv) {
                    errorDiv.style.display = 'block';
                  }
                }}
              />
              <div style={{
                display: 'none',
                textAlign: 'center',
                color: '#6b7280',
                padding: '2rem 0',
                fontSize: '0.875rem',
                fontWeight: 300,
                width: '100%'
              }}>
                <p>픽셀아트 이미지를 준비해주세요</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#9ca3af' }}>/public/pixel-art.gif 파일을 추가하세요</p>
              </div>
            </div>
            
            {/* 우리의 이야기 텍스트 */}
            {config.ourStory && config.ourStory.length > 0 && (
              <div style={{ 
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: `1px solid ${theme.cardBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }}>
                {config.ourStory.map((story, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{ 
                      color: theme.textSecondary, 
                      fontSize: '1rem', 
                      lineHeight: 1.75,
                      fontWeight: 300,
                      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
                    }}>
                      {story.text.map((line, lineIdx) => (
                        <p key={lineIdx}>{line}</p>
                      ))}
                    </div>
                    <p style={{ 
                      marginTop: '1rem', 
                      color: theme.textTertiary, 
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
                    }}>— {story.author}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 갤러리 Section - 페이지 3 */}
      <section id="gallery" className="page page-left">
        <div className="container">
          <h2 style={{
            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '1.5rem',
            fontWeight: 500,
            textAlign: 'center',
            marginBottom: '2.5rem',
            color: theme.textPrimary,
            letterSpacing: '-0.01em'
          }}>{config.sectionTitles.gallery}</h2>
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
            border: `1px solid ${theme.cardBorder}`,
            maxWidth: '100%'
          }}>
            <div 
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '0.75rem',
                cursor: 'pointer'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleImageClick}
            >
              {/* 고정 비율 컨테이너 (4:5 세로 비율) */}
              <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '125%', // 4:5 비율
                overflow: 'hidden',
                borderRadius: '0.75rem',
                backgroundColor: '#f3f4f6'
              }}>
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    transition: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transform: `translateX(-${currentImageIndex * 100}%)`,
                    willChange: 'transform'
                  }}
                >
                  {galleryImages.map((image, index) => (
                    <div key={index} style={{ 
                      minWidth: '100%', 
                      flexShrink: 0,
                      position: 'relative'
                    }}>
                      <img 
                        src={image}
                        alt={`갤러리 ${index + 1}`}
                        draggable={false}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          userSelect: 'none'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorDiv = e.target.nextElementSibling;
                          if (errorDiv) {
                            errorDiv.style.display = 'flex';
                          }
                        }}
                      />
                      <div style={{
                        display: 'none',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: theme.galleryErrorBg
                      }}>
                        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>
                          <svg style={{ width: '3rem', height: '3rem', margin: '0 auto 0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p style={{ fontSize: '0.75rem', fontWeight: 300 }}>사진 {index + 1}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 터치 힌트 */}
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                fontSize: '0.6875rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                pointerEvents: 'none',
                fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 400,
                letterSpacing: '0.01em'
              }}>
                터치하여 확대
              </div>

              {/* 좌우 화살표 */}
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev - 1);
                  }}
                  style={{
                    position: 'absolute',
                    left: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: `1px solid ${theme.cardBorder}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    color: theme.textPrimary,
                    fontSize: '1.25rem',
                    fontWeight: 300,
                    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
                  }}
                >
                  ‹
                </button>
              )}
              {currentImageIndex < galleryImages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev + 1);
                  }}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: `1px solid ${theme.cardBorder}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    color: theme.textPrimary,
                    fontSize: '1.25rem',
                    fontWeight: 300,
                    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
                  }}
                >
                  ›
                </button>
              )}
            </div>
            
            {/* 인디케이터 */}
            {galleryImages.length > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem'
              }}>
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    style={{
                      width: index === currentImageIndex ? '1.5rem' : '0.5rem',
                      height: '0.5rem',
                      borderRadius: '9999px',
                      border: 'none',
                      backgroundColor: index === currentImageIndex ? theme.indicatorActive : theme.indicatorInactive,
                      cursor: 'pointer',
                      transition: 'all 300ms'
                    }}
                    aria-label={`이미지 ${index + 1}로 이동`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 오시는 길 Section - 페이지 4 */}
      <section id="location" className="page page-right">
        <div className="container">
          <motion.div
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: '0.75rem',
              padding: '4rem 3rem',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
              border: `1px solid ${theme.cardBorder}`,
              maxWidth: '100%'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 style={{
              fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1.5rem',
              fontWeight: 500,
              textAlign: 'center',
              marginBottom: '2.5rem',
              color: theme.textPrimary,
              letterSpacing: '-0.01em'
            }}>{config.sectionTitles.location}</h2>
            <div style={{ marginBottom: '2rem', textAlign: 'center', color: theme.textSecondary, fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
              <p style={{ fontSize: '1.125rem', fontWeight: 400, marginBottom: '0.5rem' }}>{config.venue.name} {config.venue.branch}</p>
              {config.venue.hall && (
                <p style={{ fontSize: '0.9375rem', color: theme.textTertiary, fontWeight: 300, marginBottom: '0.5rem' }}>{config.venue.hall}</p>
              )}
              <p style={{ fontSize: '0.9375rem', color: theme.textTertiary, fontWeight: 300, marginBottom: '1.5rem' }}>{config.wedding.year} {config.wedding.monthDay} {config.wedding.dayOfWeek} {config.wedding.timeText}</p>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9375rem', color: theme.textSecondary, fontWeight: 300 }}>
                <p style={{ marginBottom: '0.75rem', fontWeight: 500 }}>주소</p>
                <p style={{ lineHeight: 1.75 }}>
                  {config.venue.address}<br />
                  {config.venue.addressDetail && (
                    <span style={{ color: theme.textTertiary }}>{config.venue.addressDetail}</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* 지도 이미지 */}
            <div style={{
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
              marginBottom: '1.5rem',
              backgroundColor: '#f5f5f5'
            }}>
              <img 
                src={config.maps.image}
                alt="오시는 길"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const errorDiv = e.target.nextElementSibling;
                  if (errorDiv) errorDiv.style.display = 'flex';
                }}
              />
              <div style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                backgroundColor: '#f9fafb',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <svg style={{ width: '2.5rem', height: '2.5rem', color: '#9ca3af' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>/public/map_image.jpg 파일을 추가하세요</p>
              </div>
            </div>

            {/* 지도 탭 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.375rem',
              marginBottom: '1.5rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '0.5rem',
              padding: '0.375rem'
            }}>
              {mapTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMapTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.5rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    backgroundColor: activeMapTab === tab.id ? 'white' : 'transparent',
                    color: activeMapTab === tab.id ? theme.textPrimary : theme.textSecondary,
                    fontSize: '0.875rem',
                    fontWeight: activeMapTab === tab.id ? 500 : 400,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
                    boxShadow: activeMapTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 지도 앱 열기 버튼 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center'
            }}>
              <a
                href={
                  activeMapTab === 'naver' ? config.maps.naver :
                  activeMapTab === 'kakao' ? config.maps.kakao :
                  config.maps.tmap
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  backgroundColor: 
                    activeMapTab === 'naver' ? 'rgba(3, 199, 90, 0.15)' :
                    activeMapTab === 'kakao' ? 'rgba(254, 229, 0, 0.2)' :
                    'rgba(228, 0, 43, 0.15)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  color: 
                    activeMapTab === 'naver' ? '#03C75A' :
                    activeMapTab === 'kakao' ? '#3C1E1E' :
                    '#E4002B',
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
                  transition: 'all 300ms',
                  cursor: 'pointer',
                  border: `1px solid ${
                    activeMapTab === 'naver' ? 'rgba(3, 199, 90, 0.3)' :
                    activeMapTab === 'kakao' ? 'rgba(254, 229, 0, 0.5)' :
                    'rgba(228, 0, 43, 0.3)'
                  }`
                }}
              >
                <svg style={{ width: '1.125rem', height: '1.125rem' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {activeMapTab === 'naver' ? '네이버 지도' : activeMapTab === 'kakao' ? '카카오맵' : 'T맵'}에서 열기
              </a>
            </div>

            {/* 교통편 정보 */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(229, 231, 235, 0.6)', fontSize: '0.875rem', color: '#4b5563', fontWeight: 300, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ textAlign: 'center', marginBottom: '0.75rem', fontWeight: 400 }}>교통편</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', textAlign: 'center' }}>
                {config.transportation.map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
              {config.busInfo && (
                <p style={{ textAlign: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(229, 231, 235, 0.6)' }}>{config.busInfo}</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* D-Day 카운터 Section - 임시 주석 처리 */}
      {/*
      <section id="dday" className="py-16">
        <div className="container">
          <motion.div
            style={{
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.06)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 300,
              textAlign: 'center',
              marginBottom: '2.5rem',
              color: '#374151',
              letterSpacing: '0.025em'
            }}>D-Day</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.625rem'
            }}>
              {[
                { label: '일', value: timeLeft.days },
                { label: '시', value: timeLeft.hours },
                { label: '분', value: timeLeft.minutes },
                { label: '초', value: timeLeft.seconds },
              ].map((item, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.6)'
                  }}>
                    <div style={{
                      fontSize: '1.875rem',
                      fontWeight: 300,
                      color: '#374151',
                      marginBottom: '0.125rem',
                      letterSpacing: '-0.025em'
                    }}>
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: 300
                    }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      */}

      {/* 캘린더 추가 Section - 임시 주석 처리 */}
      {/*
      <section id="calendar" className="py-16">
        <div className="container">
          <motion.div
            style={{
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.06)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              textAlign: 'center'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 300,
              marginBottom: '1.5rem',
              color: '#374151',
              letterSpacing: '0.025em'
            }}>캘린더에 추가</h2>
            <p style={{
              color: '#4b5563',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              fontWeight: 300
            }}>
              결혼식 일정을 캘린더에 추가하시겠어요?
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.25rem',
              marginBottom: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '0.75rem',
              padding: '0.25rem'
            }}>
              {[
                { id: 'google', label: 'Google' },
                { id: 'apple', label: 'Apple' },
                { id: 'android', label: 'Android' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCalendarTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: activeCalendarTab === tab.id ? 'white' : 'transparent',
                    color: activeCalendarTab === tab.id ? '#374151' : '#6b7280',
                    fontSize: '0.8125rem',
                    fontWeight: activeCalendarTab === tab.id ? 500 : 300,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    boxShadow: activeCalendarTab === tab.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <a
              href={
                activeCalendarTab === 'google' 
                  ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${config.groom.name} & ${config.bride.name} 결혼식`)}&dates=${config.wedding.date.replace(/-/g, '')}T${config.wedding.time.replace(':', '')}00/${config.wedding.date.replace(/-/g, '')}T${String(parseInt(config.wedding.time.split(':')[0]) + 2).padStart(2, '0')}0000&details=${encodeURIComponent(`${config.venue.name}에서 열리는 결혼식에 초대합니다.`)}&location=${encodeURIComponent(config.venue.address)}`
                  : undefined
              }
              onClick={(e) => {
                if (activeCalendarTab !== 'google') {
                  e.preventDefault();
                  downloadICS();
                }
              }}
              target={activeCalendarTab === 'google' ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                backgroundColor: 
                  activeCalendarTab === 'google' ? 'rgba(66, 133, 244, 0.15)' :
                  activeCalendarTab === 'apple' ? 'rgba(0, 0, 0, 0.08)' :
                  'rgba(61, 220, 132, 0.15)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: 
                  activeCalendarTab === 'google' ? '#4285F4' :
                  activeCalendarTab === 'apple' ? '#1d1d1f' :
                  '#3DDC84',
                fontSize: '0.875rem',
                fontWeight: 400,
                textDecoration: 'none',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                transition: 'all 300ms',
                cursor: 'pointer',
                border: `1px solid ${
                  activeCalendarTab === 'google' ? 'rgba(66, 133, 244, 0.3)' :
                  activeCalendarTab === 'apple' ? 'rgba(0, 0, 0, 0.15)' :
                  'rgba(61, 220, 132, 0.3)'
                }`
              }}
            >
              <svg style={{ width: '1.125rem', height: '1.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {activeCalendarTab === 'google' ? 'Google 캘린더' : 
               activeCalendarTab === 'apple' ? 'Apple 캘린더' : 'Android 캘린더'}에 추가
            </a>
          </motion.div>
        </div>
      </section>
      */}

      {/* 계좌번호 Section - 페이지 5 */}
      <section id="account" className="page page-left">
        <div className="container">
          <h2 style={{
            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '1.5rem',
            fontWeight: 500,
            textAlign: 'center',
            marginBottom: '2.5rem',
            color: theme.textPrimary,
            letterSpacing: '-0.01em'
          }}>{config.sectionTitles.account}</h2>
          
          <motion.div
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: '0.75rem',
              padding: '2.5rem 2rem',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
              border: `1px solid ${theme.cardBorder}`,
              maxWidth: '100%'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* 신랑측 */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ 
                fontSize: '1rem', 
                fontWeight: 500, 
                color: theme.textPrimary, 
                marginBottom: '1rem',
                textAlign: 'center',
                fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
              }}>신랑측</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { key: 'groom', label: config.groom.name, role: '신랑', account: config.accounts.groom },
                  { key: 'groomFather', label: config.groom.fatherName, role: '아버지', account: config.accounts.groomFather },
                  { key: 'groomMother', label: config.groom.motherName, role: '어머니', account: config.accounts.groomMother },
                ].filter(item => item.account?.bank).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setExpandedAccount(expandedAccount === item.key ? null : item.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: expandedAccount === item.key ? theme.accentSolid : '#f5f5f5',
                      color: expandedAccount === item.key ? 'white' : theme.textPrimary,
                      borderRadius: '0.5rem',
                      padding: '0.875rem 0.5rem',
                      border: expandedAccount === item.key ? 'none' : `1px solid ${theme.cardBorder}`,
                      cursor: 'pointer',
                      transition: 'all 200ms',
                      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', opacity: expandedAccount === item.key ? 0.9 : 0.7, marginBottom: '0.25rem', fontWeight: 400 }}>{item.role}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 구분선 */}
            <div style={{ height: '1px', backgroundColor: theme.cardBorder, margin: '1.5rem 0' }} />

            {/* 신부측 */}
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ 
                fontSize: '0.9375rem', 
                fontWeight: 500, 
                color: '#374151', 
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}>신부측</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { key: 'bride', label: config.bride.name, role: '신부', account: config.accounts.bride },
                  { key: 'brideFather', label: config.bride.fatherName, role: '아버지', account: config.accounts.brideFather },
                  { key: 'brideMother', label: config.bride.motherName, role: '어머니', account: config.accounts.brideMother },
                ].filter(item => item.account?.bank).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setExpandedAccount(expandedAccount === item.key ? null : item.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: expandedAccount === item.key ? theme.accentSolid : '#f5f5f5',
                      color: expandedAccount === item.key ? 'white' : theme.textPrimary,
                      borderRadius: '0.5rem',
                      padding: '0.875rem 0.5rem',
                      border: expandedAccount === item.key ? 'none' : `1px solid ${theme.cardBorder}`,
                      cursor: 'pointer',
                      transition: 'all 200ms',
                      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', opacity: expandedAccount === item.key ? 0.9 : 0.7, marginBottom: '0.25rem', fontWeight: 400 }}>{item.role}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 선택된 계좌 정보 표시 */}
            <AnimatePresence>
              {expandedAccount && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  {(() => {
                    const allAccounts = [
                      { key: 'groom', label: config.groom.name, role: '신랑', account: config.accounts.groom },
                      { key: 'groomFather', label: config.groom.fatherName, role: '아버지', account: config.accounts.groomFather },
                      { key: 'groomMother', label: config.groom.motherName, role: '어머니', account: config.accounts.groomMother },
                      { key: 'bride', label: config.bride.name, role: '신부', account: config.accounts.bride },
                      { key: 'brideFather', label: config.bride.fatherName, role: '아버지', account: config.accounts.brideFather },
                      { key: 'brideMother', label: config.bride.motherName, role: '어머니', account: config.accounts.brideMother },
                    ];
                    const selected = allAccounts.find(a => a.key === expandedAccount);
                    if (!selected) return null;
                    return (
                      <div style={{
                        backgroundColor: '#fafafa',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        marginTop: '1rem',
                        textAlign: 'center',
                        border: `1px solid ${theme.cardBorder}`
                      }}>
                        <p style={{ fontSize: '0.9375rem', color: theme.textPrimary, fontWeight: 500, marginBottom: '1rem', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                          {selected.role} {selected.label}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>{selected.account.bank}</p>
                        <p style={{ fontSize: '1.125rem', color: theme.textPrimary, fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.02em', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                          {selected.account.accountNumber}
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: theme.textTertiary, marginBottom: '1.5rem', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>예금주: {selected.account.holder}</p>
                        <button
                          onClick={() => copyToClipboard(`${selected.account.bank} ${selected.account.accountNumber} ${selected.account.holder}`, selected.key)}
                          style={{
                            width: '100%',
                            backgroundColor: theme.accentSolid,
                            color: 'white',
                            borderRadius: '0.5rem',
                            padding: '0.875rem',
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
                            transition: 'all 200ms'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          {copied[expandedAccount] ? '✓ 복사 완료!' : '계좌번호 복사하기'}
                        </button>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Footer - 페이지 6 */}
      <footer className="page page-right" style={{ 
        padding: '3rem 1rem', 
        textAlign: 'center', 
        color: theme.textTertiary,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div className="container" style={{ maxWidth: '100%' }}>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 400, color: theme.textSecondary }}>{config.groom.name} ♥ {config.bride.name}</p>
          <p style={{ marginBottom: '2rem', fontSize: '0.8125rem', fontWeight: 300, color: theme.textTertiary }}>{config.wedding.year} {config.wedding.monthDay}</p>
          <p style={{ fontSize: '0.8125rem', fontWeight: 300, color: theme.textTertiary }}>
            {config.footer.message}
            {config.footer.showRepository && config.footer.repository && (
              <>
                {' '}
                <a 
                  href={config.footer.repository} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: theme.textTertiary,
                    textDecoration: 'none',
                    transition: 'color 200ms',
                    borderBottom: `1px solid ${theme.textTertiary}`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = theme.accentSolid;
                    e.target.style.borderBottomColor = theme.accentSolid;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = theme.textTertiary;
                    e.target.style.borderBottomColor = theme.textTertiary;
                  }}
                >
                  GitHub
                </a>
              </>
            )}
          </p>
        </div>
      </footer>

      {/* 플로팅 목차 버튼 */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 1000
      }}>
        {/* 메뉴 패널 */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: '4rem',
                right: 0,
                backgroundColor: theme.cardBg,
                borderRadius: '0.75rem',
                padding: '0.5rem 0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
                border: `1px solid ${theme.cardBorder}`,
                minWidth: '160px',
                overflow: 'hidden'
              }}
            >
              {menuItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.625rem 1.25rem',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: theme.textPrimary,
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    cursor: 'pointer',
                    transition: 'background-color 150ms',
                    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span style={{ 
                    color: theme.accentSolid, 
                    marginRight: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>{idx + 1}.</span>
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 토글 버튼 */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            backgroundColor: theme.accentSolid,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            color: 'white'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.svg
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ width: '1.25rem', height: '1.25rem' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            ) : (
              <motion.div
                key="dots"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'white' }} />
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'white' }} />
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'white' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      </div>
    </div>
  );
}

export default App;
