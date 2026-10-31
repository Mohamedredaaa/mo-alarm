(function initUiInteractions() {
  'use strict';

  const COUNTDOWN_INITIAL_SECONDS = 3 * 3600 + 42 * 60 + 19;
  const COUNTDOWN_TICK_MS = 1000;
  const STICKY_SCROLL_OFFSET_PX = 420;
  const COPY_FEEDBACK_RESET_MS = 2500;
  const MODAL_CLOSE_DELAY_MS = 450;
  const POST_DOWNLOAD_REFRESH_MS = 4000;
  const SECONDS_PER_HOUR = 3600;
  const SECONDS_PER_MINUTE = 60;
  const SHARE_AR_URL = 'https://mohamedredaaa.github.io/mo-alarm/';
  const SHARE_EN_URL = 'https://mohamedredaaa.github.io/mo-alarm/en/';
  const DEFAULT_APK_URL = 'https://github.com/Mohamedredaaa/mo-alarm/releases/latest/download/app-release.apk';
  const DEFAULT_IPA_URL = 'https://github.com/Mohamedredaaa/mo-alarm/releases/latest/download/MoAlarm-iOS.ipa';
  const QR_API_PREFIX = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&bgcolor=0B0F17&color=D4AF37&data=';

  let currentQrPlatform = 'android';

  function isEnglishPage() {
    return document.documentElement.lang === 'en';
  }

  window.detectVisitorPlatform = function detectVisitorPlatform() {
    const ua = window.navigator.userAgent || '';
    const isIOS =
      /iPhone|iPad|iPod/i.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    if (isIOS) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    if (/Macintosh|Mac OS X/i.test(ua)) return 'ios';
    return null;
  };

  window.openDownloadModal = function openDownloadModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const modal = document.getElementById('download-platform-modal');
    if (!modal) return;
    const detected = window.detectVisitorPlatform();
    const androidCard = document.getElementById('modal-card-android');
    const iosCard = document.getElementById('modal-card-ios');
    if (androidCard) androidCard.classList.toggle('recommended', detected === 'android');
    if (iosCard) iosCard.classList.toggle('recommended', detected === 'ios');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeDownloadModal = function closeDownloadModal() {
    const modal = document.getElementById('download-platform-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  window.closeDownloadModalSoon = function closeDownloadModalSoon() {
    window.setTimeout(() => {
      window.closeDownloadModal();
      if (typeof window.syncLatestRelease === 'function') {
        window.setTimeout(window.syncLatestRelease, POST_DOWNLOAD_REFRESH_MS);
      }
    }, MODAL_CLOSE_DELAY_MS);
  };

  window.handleModalBackdropClick = function handleModalBackdropClick(e) {
    if (e && e.target && e.target.id === 'download-platform-modal') {
      window.closeDownloadModal();
    }
  };

  window.setQrPlatform = function setQrPlatform(platform) {
    currentQrPlatform = platform === 'ios' ? 'ios' : 'android';
    const btnAndroid = document.getElementById('qr-btn-android');
    const btnIos = document.getElementById('qr-btn-ios');
    if (btnAndroid) btnAndroid.classList.toggle('active', currentQrPlatform === 'android');
    if (btnIos) btnIos.classList.toggle('active', currentQrPlatform === 'ios');
    const urls = window.__moAlarmReleaseUrls || { apkUrl: DEFAULT_APK_URL, ipaUrl: DEFAULT_IPA_URL };
    const targetUrl = currentQrPlatform === 'ios' ? urls.ipaUrl : urls.apkUrl;
    const qrLink = document.getElementById('qr-code-link');
    const qrImg = document.getElementById('qr-code-img');
    if (qrLink) qrLink.setAttribute('href', targetUrl);
    if (qrImg) qrImg.setAttribute('src', QR_API_PREFIX + encodeURIComponent(targetUrl));
  };

  window.getQrPlatform = function getQrPlatform() {
    return currentQrPlatform;
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeDownloadModal();
  });

  if (window.detectVisitorPlatform() === 'ios') {
    currentQrPlatform = 'ios';
  }

  window.showMockScreen = function showMockScreen(screenId, btn) {
    document.querySelectorAll('.screen-view').forEach((el) => el.classList.remove('active'));
    const target = document.getElementById('mock-screen-' + screenId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.phone-tab-btn').forEach((tab) => tab.classList.remove('active'));
    if (btn) btn.classList.add('active');
  };

  window.shareApp = async function shareApp() {
    const isEn = isEnglishPage();
    const shareUrl = isEn ? SHARE_EN_URL : SHARE_AR_URL;
    const shareData = {
      title: isEn
        ? 'Mo Alarm — Ad-Free Prayer Times & Smart Fajr Alarm (Android & iPhone)'
        : 'Mo Alarm — مؤذّن ومنبّه الفجر الذكي بدون إعلانات (أندرويد وأيفون)',
      text: isEn
        ? 'Download Mo Alarm for Android & iPhone: offline prayer times, Fajr wake-up challenges, Qibla compass, and 292 Adhan voices (100% Free & Zero Ads):'
        : 'جرّب تطبيق Mo Alarm للأندرويد والأيفون: مواقيت الصلاة بدون إنترنت ومنبّه الفجر الذكي وبوصلة القبلة (مجاني ١٠٠٪ وبدون إعلانات):',
      url: shareUrl
    };

    if (window.navigator.share) {
      try {
        await window.navigator.share(shareData);
        return;
      } catch (err) {
        if (err && err.name !== 'AbortError') {
          console.error('[UiInteractions] Web Share failed, falling back to clipboard:', err);
        } else {
          return;
        }
      }
    }

    try {
      await window.navigator.clipboard.writeText(shareUrl);
      const btnText = document.getElementById('share-btn-text');
      if (btnText) {
        const previousLabel = btnText.textContent;
        btnText.textContent = isEn ? '✓ Link copied to clipboard!' : '✓ تم نسخ الرابط بنجاح!';
        window.setTimeout(() => {
          btnText.textContent = previousLabel;
        }, COPY_FEEDBACK_RESET_MS);
      }
    } catch (err) {
      console.error('[UiInteractions] Clipboard copy failed:', err);
    }
  };

  let remainingSecs = COUNTDOWN_INITIAL_SECONDS;
  window.setInterval(() => {
    remainingSecs = remainingSecs > 0 ? remainingSecs - 1 : COUNTDOWN_INITIAL_SECONDS;
    const hours = String(Math.floor(remainingSecs / SECONDS_PER_HOUR)).padStart(2, '0');
    const minutes = String(Math.floor((remainingSecs % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)).padStart(2, '0');
    const seconds = String(remainingSecs % SECONDS_PER_MINUTE).padStart(2, '0');
    const countdownEl = document.getElementById('live-countdown');
    if (countdownEl) countdownEl.textContent = hours + ':' + minutes + ':' + seconds;
  }, COUNTDOWN_TICK_MS);

  window.addEventListener(
    'scroll',
    () => {
      const bar = document.getElementById('mobile-sticky-bar');
      if (!bar) return;
      bar.classList.toggle('visible', window.scrollY > STICKY_SCROLL_OFFSET_PX);
    },
    { passive: true }
  );
})();
