(function initReleaseSync() {
  'use strict';

  const RELEASE_CACHE_KEY = 'mo_alarm_release_cache_v3';
  const GITHUB_RELEASES_API = 'https://api.github.com/repos/Mohamedredaaa/mo-alarm/releases?per_page=100';
  const SHIELDS_DOWNLOADS_API = 'https://img.shields.io/github/downloads/Mohamedredaaa/mo-alarm/total.json';
  const GITHUB_REPO_PREFIX = 'https://github.com/Mohamedredaaa/mo-alarm/';
  const DEFAULT_APK_URL = 'https://github.com/Mohamedredaaa/mo-alarm/releases/latest/download/app-release.apk';
  const DEFAULT_IPA_URL = 'https://github.com/Mohamedredaaa/mo-alarm/releases/latest/download/MoAlarm-iOS.ipa';
  const DEFAULT_RELEASE_URL = 'https://github.com/Mohamedredaaa/mo-alarm/releases/latest';
  const DEFAULT_TAG = 'v1.4.2';
  const DEFAULT_APK_SIZE_MB = '17.0 MB';
  const DEFAULT_IPA_SIZE_MB = '24.8 MB';
  const BYTES_PER_MB = 1048576;
  const POST_DOWNLOAD_REFRESH_MS = 4000;
  const ISO_DATE_SLICE_END = 10;
  const MAX_CHANGELOG_BULLETS = 4;

  function isEnglishPage() {
    return document.documentElement.lang === 'en';
  }

  function parseReleaseChangelog(bodyText) {
    if (!bodyText || typeof bodyText !== 'string') return { ar: [], en: [] };
    const sections = bodyText.split(/\n---+\n/);
    const extractBullets = (txt) =>
      (txt || '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('- ') || line.startsWith('* '))
        .map((line) => line.replace(/^[-*]\s+/, '').trim())
        .filter(Boolean)
        .slice(0, MAX_CHANGELOG_BULLETS);
    return {
      ar: extractBullets(sections[0] || ''),
      en: extractBullets(sections[1] || sections[0] || '')
    };
  }

  function sanitizeReleaseData(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const validTag = (val, fallback) => (typeof val === 'string' && val.startsWith('v') ? val : fallback);
    const validSize = (val, fallback) => (typeof val === 'string' && val.endsWith('MB') ? val : fallback);
    const validUrl = (val, fallback) =>
      typeof val === 'string' && val.startsWith(GITHUB_REPO_PREFIX) ? val : fallback;
    const validBullets = (arr) =>
      Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && x.length > 0).slice(0, MAX_CHANGELOG_BULLETS) : [];

    const tag = validTag(raw.tag, DEFAULT_TAG);
    return {
      tag,
      apkTag: validTag(raw.apkTag, tag),
      ipaTag: validTag(raw.ipaTag, tag),
      sizeMB: validSize(raw.sizeMB, DEFAULT_APK_SIZE_MB),
      ipaSizeMB: validSize(raw.ipaSizeMB, DEFAULT_IPA_SIZE_MB),
      totalDownloads: Number.isFinite(Number(raw.totalDownloads)) ? Math.max(0, Number(raw.totalDownloads)) : 0,
      latestDownloads: Number.isFinite(Number(raw.latestDownloads)) ? Math.max(0, Number(raw.latestDownloads)) : 0,
      apkUrl: validUrl(raw.apkUrl, DEFAULT_APK_URL),
      ipaUrl: validUrl(raw.ipaUrl, DEFAULT_IPA_URL),
      releaseUrl: validUrl(raw.releaseUrl, DEFAULT_RELEASE_URL),
      publishedAt: typeof raw.publishedAt === 'string' ? raw.publishedAt : null,
      arBullets: validBullets(raw.arBullets),
      enBullets: validBullets(raw.enBullets)
    };
  }

  function setTextById(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHtmlById(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function applyReleaseData(raw) {
    const data = sanitizeReleaseData(raw);
    if (!data) return;

    const isEn = isEnglishPage();
    const {
      tag, apkTag, ipaTag, sizeMB, ipaSizeMB,
      totalDownloads, latestDownloads, apkUrl, ipaUrl, releaseUrl, publishedAt, arBullets, enBullets
    } = data;

    window.__moAlarmReleaseUrls = { apkUrl, ipaUrl };
    document.querySelectorAll('[data-apk-link]').forEach((el) => el.setAttribute('href', apkUrl));
    document.querySelectorAll('[data-ipa-link]').forEach((el) => el.setAttribute('href', ipaUrl));
    document.querySelectorAll('[data-release-link]').forEach((el) => el.setAttribute('href', releaseUrl));

    setTextById('hero-badge-text', isEn
      ? 'Official ' + tag + ' • Android & iPhone • 100% Ad-Free'
      : 'الإصدار الرسمي ' + tag + ' • أندرويد وأيفون • بدون إعلانات');
    setTextById('cta-primary-text', isEn
      ? 'Free Download ' + tag + ' (Android & iPhone)'
      : 'تحميل الإصدار ' + tag + ' مجاناً (أندرويد وأيفون)');
    setTextById('feat-tag-text', isEn
      ? 'Release ' + tag + ' • 6 Smart Worship Systems'
      : 'الإصدار ' + tag + ' • ٦ منظومات ذكية');
    setTextById('cmp-ver-cell', isEn
      ? '✓ Fully supported in ' + tag
      : '✓ مدعوم بالكامل في الإصدار ' + tag);
    setTextById('dl-btn-apk-text', isEn
      ? 'Choose Device & Download ' + tag + ' (Android / iPhone)'
      : 'اختر نسختك وحمّل ' + tag + ' (أندرويد / أيفون)');
    setHtmlById('qr-meta-text', isEn
      ? 'Version: <strong>' + tag + '</strong> • Android (' + sizeMB + ') &amp; iOS (' + ipaSizeMB + ')'
      : 'الإصدار: <strong>' + tag + '</strong> • Android (' + sizeMB + ') &amp; iOS (' + ipaSizeMB + ')');
    setTextById('mock-version-label', 'Mo Alarm ' + tag);
    setTextById('sticky-ver-tag', tag);
    setTextById('sticky-sub-meta', isEn ? 'Android & iPhone • 100% Free' : 'أندرويد وأيفون • مجاني ١٠٠٪');
    setTextById('release-path-box', 'Release: github.com/Mohamedredaaa/mo-alarm/releases/tag/' + tag);
    setTextById('modal-live-tag', tag);
    setTextById('modal-apk-meta', apkTag + ' • ' + sizeMB + ' • Android 8.0+');
    setTextById('modal-ipa-meta', ipaTag + ' • ' + ipaSizeMB + ' • iOS 17+');
    setTextById('modal-android-btn-text', isEn ? 'Download for Android (' + apkTag + ')' : 'تنزيل للأندرويد (' + apkTag + ')');
    setTextById('modal-ios-btn-text', isEn ? 'Download for iPhone (' + ipaTag + ')' : 'تنزيل للأيفون (' + ipaTag + ')');

    if (totalDownloads > 0) {
      const totalFmt = totalDownloads.toLocaleString(isEn ? 'en-US' : 'ar-EG');
      const latestFmt = latestDownloads.toLocaleString(isEn ? 'en-US' : 'ar-EG');
      setTextById('trust-downloads-text', isEn
        ? 'Official Downloads: ' + totalFmt + ' total (' + latestFmt + ' on ' + tag + ')'
        : 'إجمالي التحميلات الرسمية: ' + totalFmt + ' تنزيل (' + latestFmt + ' للإصدار ' + tag + ')');
      setHtmlById('qr-downloads-text', isEn
        ? 'Total Downloads: <strong>' + totalFmt + '</strong> (' + latestFmt + ' on latest)'
        : 'إجمالي التنزيلات: <strong>' + totalFmt + '</strong> (' + latestFmt + ' لآخر إصدار)');
    }

    if (publishedAt) {
      const parsedDate = new Date(publishedAt);
      if (!Number.isNaN(parsedDate.getTime())) {
        setTextById('live-release-date', tag + ' • ' + parsedDate.toISOString().slice(0, ISO_DATE_SLICE_END));
      }
    }

    const bullets = isEn ? enBullets : arBullets;
    const listEl = document.getElementById('live-changelog-list');
    if (listEl && bullets.length > 0) {
      listEl.innerHTML = '';
      bullets.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        listEl.appendChild(li);
      });
    }

    if (typeof window.setQrPlatform === 'function' && typeof window.getQrPlatform === 'function') {
      window.setQrPlatform(window.getQrPlatform());
    }
  }

  async function syncLatestRelease() {
    try {
      const cachedRaw = window.localStorage.getItem(RELEASE_CACHE_KEY);
      if (cachedRaw) applyReleaseData(JSON.parse(cachedRaw));
    } catch (err) {
      console.error('[ReleaseSync] Failed reading local release cache:', err);
    }

    const nextData = {
      tag: DEFAULT_TAG,
      apkTag: DEFAULT_TAG,
      ipaTag: DEFAULT_TAG,
      sizeMB: DEFAULT_APK_SIZE_MB,
      ipaSizeMB: DEFAULT_IPA_SIZE_MB,
      totalDownloads: 0,
      latestDownloads: 0,
      apkUrl: DEFAULT_APK_URL,
      ipaUrl: DEFAULT_IPA_URL,
      releaseUrl: DEFAULT_RELEASE_URL,
      publishedAt: null,
      arBullets: [],
      enBullets: []
    };
    let githubSucceeded = false;

    try {
      const response = await window.fetch(GITHUB_RELEASES_API, {
        headers: { Accept: 'application/vnd.github+json' }
      });
      if (response.ok) {
        const releases = await response.json();
        if (Array.isArray(releases) && releases.length > 0) {
          const stable = releases.filter((r) => !r.draft && !r.prerelease);
          const pool = stable.length > 0 ? stable : releases;
          let total = 0;
          releases.forEach((rel) => {
            if (Array.isArray(rel.assets)) {
              rel.assets.forEach((asset) => {
                total += Number(asset.download_count || 0);
              });
            }
          });

          const head = pool[0];
          if (head && typeof head.tag_name === 'string') {
            nextData.tag = head.tag_name;
            nextData.publishedAt = head.published_at || null;
            nextData.releaseUrl = head.html_url || (GITHUB_REPO_PREFIX + 'releases/tag/' + nextData.tag);
            const parsed = parseReleaseChangelog(head.body || '');
            nextData.arBullets = parsed.ar;
            nextData.enBullets = parsed.en;
            if (Array.isArray(head.assets)) {
              nextData.latestDownloads = head.assets.reduce((acc, a) => acc + Number(a.download_count || 0), 0);
            }
          }

          const apkRel = pool.find((r) => Array.isArray(r.assets) && r.assets.some((a) => a.name && a.name.toLowerCase().endsWith('.apk')));
          if (apkRel) {
            const apkAsset = apkRel.assets.find((a) => a.name === 'app-release.apk') || apkRel.assets.find((a) => a.name && a.name.toLowerCase().endsWith('.apk'));
            if (apkAsset) {
              nextData.apkTag = apkRel.tag_name || nextData.tag;
              if (apkAsset.browser_download_url) nextData.apkUrl = apkAsset.browser_download_url;
              if (apkAsset.size) nextData.sizeMB = (apkAsset.size / BYTES_PER_MB).toFixed(1) + ' MB';
            }
          }

          const ipaRel = pool.find((r) => Array.isArray(r.assets) && r.assets.some((a) => a.name && a.name.toLowerCase().endsWith('.ipa')));
          if (ipaRel) {
            const ipaAsset = ipaRel.assets.find((a) => a.name === 'MoAlarm-iOS.ipa') || ipaRel.assets.find((a) => a.name && a.name.toLowerCase().endsWith('.ipa'));
            if (ipaAsset) {
              nextData.ipaTag = ipaRel.tag_name || nextData.tag;
              if (ipaAsset.browser_download_url) nextData.ipaUrl = ipaAsset.browser_download_url;
              if (ipaAsset.size) nextData.ipaSizeMB = (ipaAsset.size / BYTES_PER_MB).toFixed(1) + ' MB';
            }
          }

          nextData.totalDownloads = total;
          githubSucceeded = true;
        }
      }
    } catch (err) {
      console.error('[ReleaseSync] GitHub Releases fetch failed, trying Shields fallback:', err);
    }

    if (!githubSucceeded || nextData.totalDownloads === 0) {
      try {
        const shieldRes = await window.fetch(SHIELDS_DOWNLOADS_API);
        if (shieldRes.ok) {
          const shieldJson = await shieldRes.json();
          const parsedCount = Number.parseInt(shieldJson.value || shieldJson.message, 10);
          if (!Number.isNaN(parsedCount) && parsedCount > 0) {
            nextData.totalDownloads = parsedCount;
            if (nextData.latestDownloads === 0) nextData.latestDownloads = parsedCount;
          }
        }
      } catch (err) {
        console.error('[ReleaseSync] Shields fallback fetch failed:', err);
      }
    }

    applyReleaseData(nextData);
    try {
      window.localStorage.setItem(RELEASE_CACHE_KEY, JSON.stringify(nextData));
    } catch (err) {
      console.error('[ReleaseSync] Failed saving release cache:', err);
    }
  }

  window.syncLatestRelease = syncLatestRelease;
  syncLatestRelease();
  document.querySelectorAll('[data-apk-link], [data-ipa-link]').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.setTimeout(syncLatestRelease, POST_DOWNLOAD_REFRESH_MS);
    });
  });
})();
