/**
 * Website Security Protection Module (Maximum Standard)
 * 
 * Protects against:
 * - F12 DevTools opening
 * - Ctrl+Shift+I / J / C / K (Inspect Element, Console, Inspector)
 * - Ctrl+U / Cmd+Option+U (View Page Source)
 * - Ctrl+S (Save Webpage)
 * - Right-click Context Menu
 * - DevTools Inspection Freeze Trap (Infinite debugger trap)
 * - Console Snooping & Scraping
 */

export function initWebsiteSecurity() {
  if (typeof window === 'undefined') return;

  // 1. Print Warning Banner in Console
  try {
    const bannerTitle = 'color: #ff0055; font-size: 22px; font-weight: 900; text-shadow: 1px 1px 0px black;';
    const bannerText = 'color: #4b5563; font-size: 13px; font-weight: bold; line-height: 1.6;';
    console.clear();
    console.log('%c⛔ คำเตือนความปลอดภัยสูงสุด (Security Protection)', bannerTitle);
    console.log(
      '%cเว็บไซต์นี้ได้รับการคุ้มครองด้วยระบบรักษาความปลอดภัยระดับสูงสุด\n' +
      'ห้ามคัดลอก ดัดแปลง เจาะระบบ หรือนำ Source Code ไปใช้โดยเด็ดขาด\n' +
      'All rights reserved.',
      bannerText
    );
  } catch (_) {}

  // 2. Disable Right-Click Context Menu
  window.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    true
  );

  // 3. Disable DevTools & Source Inspection Keyboard Shortcuts
  window.addEventListener(
    'keydown',
    (e) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element picker), Ctrl+Shift+K (Firefox)
      if (
        isCtrlOrMeta &&
        e.shiftKey &&
        ['i', 'I', 'j', 'J', 'c', 'C', 'k', 'K'].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+U (View Page Source)
      if (isCtrlOrMeta && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Webpage)
      if (isCtrlOrMeta && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+P (Print webpage)
      if (isCtrlOrMeta && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    true
  );

  // Helper to detect mobile/tablet devices
  const isMobile = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isMobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    return isMobileUA || isIPadOS || (hasTouch && window.innerWidth < 1024);
  };

  // 4. Anti-DevTools Active Debugger Trap & Recursive Breakpoint Loop
  // When DevTools is closed, this statement runs in microseconds without effect.
  // When DevTools is opened, this statement halts the browser in an inescapable breakpoint loop!
  const activateDebuggerTrap = () => {
    if (isMobile()) return; // Never run debugger traps on mobile devices
    try {
      (function () {
        return false;
      }['constructor']('debugger')());
    } catch (_) {}
  };

  // Run periodic debugger checks (only on desktop)
  if (!isMobile()) {
    setInterval(activateDebuggerTrap, 500);
  }

  // 5. DevTools Open Detection via Dimension & Full-Screen Lockdown Mask
  let isDevToolsOpen = false;

  const showLockdownScreen = () => {
    if (isMobile()) return; // Never show lockdown on mobile devices
    if (document.getElementById('anti-devtools-lockdown')) return;
    const overlay = document.createElement('div');
    overlay.id = 'anti-devtools-lockdown';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: #0f172a;
      color: #ffffff;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Prompt', sans-serif;
      user-select: none;
    `;
    overlay.innerHTML = `
      <div style="font-size: 52px; margin-bottom: 14px;">⛔</div>
      <h1 style="font-size: 20px; font-weight: 800; color: #f43f5e; margin-bottom: 10px;">
        ตรวจพบการเปิดเครื่องมือ Developer Tools
      </h1>
      <p style="color: #94a3b8; font-size: 14px; max-width: 420px; line-height: 1.6; margin-bottom: 16px;">
        เพื่อความปลอดภัยของข้อมูลและการป้องกันการดัดแปลงโค้ด เว็บไซต์นี้ไม่อนุญาตให้เปิด Inspect หรือ DevTools<br/>
        กรุณาปิดแถบเครื่องมือผู้พัฒนาเพื่อใช้งานเว็บไซต์ตามปกติ
      </p>
      <div style="font-size: 12px; color: #64748b; background: rgba(255,255,255,0.05); padding: 8px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        🔒 Security Policy Enforced • BA STORE
      </div>
    `;
    document.body.appendChild(overlay);
  };

  const hideLockdownScreen = () => {
    const overlay = document.getElementById('anti-devtools-lockdown');
    if (overlay) overlay.remove();
  };

  const checkDevTools = () => {
    // On iPhone/Android/mobile, browser toolbars & viewport scaling cause false dimension differences
    // Skip devtools dimension check completely on mobile
    if (isMobile()) {
      if (isDevToolsOpen) {
        isDevToolsOpen = false;
        hideLockdownScreen();
      }
      return;
    }

    const widthThreshold = window.outerWidth - window.innerWidth > 200;
    const heightThreshold = window.outerHeight - window.innerHeight > 200;

    if (widthThreshold || heightThreshold) {
      if (!isDevToolsOpen) {
        isDevToolsOpen = true;
        showLockdownScreen();
        activateDebuggerTrap();
      }
    } else {
      if (isDevToolsOpen) {
        isDevToolsOpen = false;
        hideLockdownScreen();
      }
    }
  };

  if (!isMobile()) {
    window.addEventListener('resize', checkDevTools);
    setInterval(checkDevTools, 1000);
  }

  // Periodically clear console to wipe injected scripts
  setInterval(() => {
    try {
      console.clear();
      console.log('%c⛔ คำเตือนความปลอดภัยสูงสุด (Security Protection)', bannerTitle);
      console.log('%cเว็บไซต์นี้ได้รับการคุ้มครอง ห้ามคัดลอก ดัดแปลง หรือเจาะระบบโดยเด็ดขาด', bannerText);
    } catch (_) {}
  }, 2000);

  // 6. Disable Dragging of images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
}
