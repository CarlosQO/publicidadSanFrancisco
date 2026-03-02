import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// =====================================================
// 🔧 CONFIGURACIÓN — Reemplaza con tus credenciales
// =====================================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_BUCKET = "media";

let supabase = null;
try {
  if (SUPABASE_URL !== "https://TU_PROYECTO.supabase.co") {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) { }

// =====================================================
// STYLES - Responsive mejorado para mobile
// =====================================================
const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bg: #0a0a0f;
    --surface: #13131a;
    --surface2: #1c1c28;
    --border: #2a2a3d;
    --accent: #6c63ff;
    --accent2: #ff6584;
    --text: #e8e8f0;
    --text-dim: #7070a0;
    --success: #43d9a0;
    --warning: #ffb347;
    --danger: #ff5f7e;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: 60px; background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
  .nav-logo { font-family: 'Space Mono', monospace; font-size: 15px; color: var(--accent); letter-spacing: 2px; }
  .nav-tabs { display: flex; gap: 4px; }
  .nav-tab { padding: 7px 20px; border-radius: 8px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; transition: all 0.2s; background: transparent; color: var(--text-dim); }
  .nav-tab.active { background: var(--accent); color: white; }
  .nav-tab:hover:not(.active) { background: var(--surface2); color: var(--text); }
  .nav-screens { display: flex; align-items: center; gap: 10px; }
  .screen-badge { font-size: 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; padding: 4px 12px; color: var(--text-dim); font-family: 'Space Mono', monospace; }
  .screen-badge span { color: var(--success); }

  .admin { display: grid; grid-template-columns: 1fr 380px; gap: 24px; padding: 28px; max-width: 1400px; width: 100%; margin: 0 auto; }
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
  .panel-title { font-size: 13px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 20px; }

  .upload-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.2s; position: relative; }
  .upload-zone:hover, .upload-zone.drag { border-color: var(--accent); background: rgba(108,99,255,0.05); }
  .upload-zone.uploading-active { border-color: var(--accent); background: rgba(108,99,255,0.05); cursor: default; pointer-events: none; }
  .upload-icon { font-size: 36px; margin-bottom: 12px; }
  .upload-text { font-size: 15px; color: var(--text); margin-bottom: 4px; font-weight: 500; }
  .upload-sub { font-size: 12px; color: var(--text-dim); }
  .upload-bar { height: 6px; background: var(--border); border-radius: 4px; margin-top: 16px; overflow: hidden; }
  .upload-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 4px; transition: width 0.4s ease; }
  .upload-status { margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .upload-status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: uploadPulse 1s infinite; flex-shrink: 0; }
  @keyframes uploadPulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.4); opacity:0.6; } }
  .upload-filename { font-size: 12px; color: var(--text-dim); font-family: 'Space Mono', monospace; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .upload-percent { font-size: 13px; font-family: 'Space Mono', monospace; color: var(--accent); font-weight: 700; flex-shrink: 0; }

  .media-list { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
  .media-item { 
    display: flex; 
    align-items: center; 
    gap: 14px; 
    background: var(--surface2); 
    border: 1px solid var(--border); 
    border-radius: 14px; 
    padding: 14px 16px; 
    cursor: grab; 
    transition: all 0.25s ease; 
    position: relative;
  }
  .media-item:hover { border-color: var(--accent); }
  .media-item.dragging { opacity: 0.4; }
  .media-item.drag-over { border-color: var(--accent2); background: rgba(255,101,132,0.05); }

  .drag-handle { color: var(--text-dim); font-size: 20px; cursor: grab; flex-shrink: 0; padding: 4px 6px; }
  .media-thumb { width: 64px; height: 48px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: var(--surface2); }
  .media-thumb-video { width: 64px; height: 48px; border-radius: 10px; flex-shrink: 0; background: var(--surface2); display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .media-info { flex: 1; min-width: 0; }
  .media-name { font-size: 14.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .media-type { font-size: 11.5px; color: var(--text-dim); font-family: 'Space Mono', monospace; margin-top: 2px; }

  .media-duration { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .dur-btn { 
    width: 34px; 
    height: 34px; 
    border-radius: 8px; 
    border: 1px solid var(--border); 
    background: var(--surface); 
    color: var(--text); 
    cursor: pointer; 
    font-size: 15px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    transition: all 0.2s; 
  }
  .dur-btn:hover { border-color: var(--accent); color: var(--accent); }
  .dur-val { font-family: 'Space Mono', monospace; font-size: 14.5px; min-width: 42px; text-align: center; }

  .del-btn { 
    width: 32px; 
    height: 32px; 
    border-radius: 8px; 
    border: none; 
    background: transparent; 
    color: var(--text-dim); 
    cursor: pointer; 
    font-size: 18px; 
    transition: all 0.2s; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .del-btn:hover { background: rgba(255,95,126,0.15); color: var(--danger); }

  .setting-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); }
  .setting-row:last-child { border-bottom: none; }
  .setting-label { font-size: 14px; }
  .setting-sub { font-size: 11px; color: var(--text-dim); margin-top: 2px; }
  .toggle { width: 44px; height: 24px; background: var(--border); border-radius: 12px; cursor: pointer; position: relative; transition: background 0.2s; border: none; }
  .toggle.on { background: var(--accent); }
  .toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: left 0.2s; }
  .toggle.on::after { left: 23px; }
  .num-input { width: 70px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: 'Space Mono', monospace; font-size: 13px; padding: 6px 10px; text-align: center; }

  .screens-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
  .screen-item { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 10px; text-align: center; font-size: 12px; cursor: pointer; transition: all 0.2s; }
  .screen-item.active { border-color: var(--success); background: rgba(67,217,160,0.08); }
  .screen-item .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); margin: 0 auto 6px; }
  .screen-item.active .dot { background: var(--success); box-shadow: 0 0 8px var(--success); }

  .btn-primary { width: 100%; padding: 13px; border-radius: 10px; border: none; background: linear-gradient(135deg, var(--accent), #8b5cf6); color: white; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 16px; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(108,99,255,0.3); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* KIOSK — NO TOCADO */
  .kiosk-wrap {
    position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important;
    background: #000 !important; z-index: 99999 !important; overflow: hidden !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
  }
  .kiosk-wrap img, .kiosk-wrap video {
    display: block !important; max-width: 100vw !important; max-height: 100vh !important;
    width: auto !important; height: auto !important; flex-shrink: 1 !important;
  }

  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 20px; font-size: 14px; z-index: 999999; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: slideUp 0.3s ease; white-space: nowrap; }
  @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

  .empty { text-align: center; padding: 40px 20px; color: var(--text-dim); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .demo-banner { background: rgba(255,179,71,0.1); border: 1px solid rgba(255,179,71,0.3); border-radius: 10px; padding: 10px 16px; margin-bottom: 20px; font-size: 13px; color: var(--warning); display: flex; align-items: center; gap: 8px; }
  .shortcut-item { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
  .shortcut-item:last-child { border-bottom: none; }
  .key { font-family: 'Space Mono', monospace; background: var(--surface2); border: 1px solid var(--border); border-radius: 5px; padding: 2px 8px; font-size: 11px; color: var(--accent); }
  .realtime-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 8px var(--success); display: inline-block; margin-right: 6px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  /* ==================== RESPONSIVE MOBILE ==================== */
  @media (max-width: 1024px) {
    .admin { grid-template-columns: 1fr; padding: 20px 16px; gap: 20px; }
  }
  @media (max-width: 480px) {
    .media-item { padding: 14px; gap: 12px; flex-wrap: wrap; border-radius: 16px; }
    .media-thumb, .media-thumb-video { width: 72px; height: 54px; border-radius: 12px; }
    .media-info { flex: 1 1 100%; margin-top: 4px; }
    .media-duration { margin-top: 8px; width: 100%; justify-content: center; gap: 12px; }
    .dur-btn { width: 42px; height: 42px; font-size: 18px; }
    .dur-val { font-size: 16px; min-width: 50px; }
    .del-btn { position: absolute; top: 12px; right: 12px; width: 28px; height: 28px; font-size: 17px; }
    .drag-handle { font-size: 22px; }
  }
`;

function Toast({ msg, icon = "✓" }) {
  return <div className="toast"><span>{icon}</span>{msg}</div>;
}

function generateId() {
  return Date.now() + Math.random().toString(36).slice(2);
}

// =====================================================
// CACHE MANAGER
// =====================================================
const CACHE_NAME = "adkiosk-media-v1";

async function getCachedUrl(remoteUrl) {
  if (!remoteUrl || !remoteUrl.startsWith("http")) return remoteUrl;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(remoteUrl);
    if (cached) {
      const blob = await cached.blob();
      return URL.createObjectURL(blob);
    }
    const response = await fetch(remoteUrl);
    if (response.ok) {
      await cache.put(remoteUrl, response.clone());
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.warn("Cache error, usando URL remota:", e);
  }
  return remoteUrl;
}

async function removeCachedUrl(remoteUrl) {
  if (!remoteUrl) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(remoteUrl);
  } catch (e) { }
}

async function syncCache(newItems, oldItems = []) {
  const newUrls = new Set(newItems.map(i => i.url));
  for (const old of oldItems) {
    if (!newUrls.has(old.url)) await removeCachedUrl(old.url);
  }
  for (const item of newItems) {
    if (item.url?.startsWith("http")) getCachedUrl(item.url).catch(() => { });
  }
}

// =====================================================
// KIOSK VIEW (sin tocar)
// =====================================================
function KioskView({ items, onExit }) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  // const lastLocalUpdate = useRef(0);
  const [cachedUrls, setCachedUrls] = useState({});
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);
  const blobUrlsRef = useRef([]);

  const current = items[idx];
  const isVideo = current?.type === "video";
  const resolveUrl = (item) => cachedUrls[item?.url] || item?.url || "";

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      const result = {};
      for (const item of items) {
        if (cancelled) break;
        if (item.url?.startsWith("http")) {
          const local = await getCachedUrl(item.url);
          if (local !== item.url) blobUrlsRef.current.push(local);
          result[item.url] = local;
        }
      }
      if (!cancelled) setCachedUrls(result);
    };
    loadAll();
    return () => { cancelled = true; };
  }, [items]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { } });
    };
  }, []);

  const forceSize = useCallback((el) => {
    if (!el) return;
    el.removeAttribute("width");
    el.removeAttribute("height");
    el.style.cssText = `
      position: absolute !important;
      top: 0 !important; left: 0 !important;
      width: ${window.innerWidth}px !important;
      height: ${window.innerHeight}px !important;
      object-fit: contain !important;
      background: #000 !important;
      margin: 0 !important; padding: 0 !important;
      display: block !important;
      max-width: none !important;
      max-height: none !important;
    `;
  }, []);

  useEffect(() => {
    const el = isVideo ? videoRef.current : imgRef.current;
    if (el) forceSize(el);
  }, [idx, isVideo, forceSize]);

  const onMediaLoad = useCallback((e) => { forceSize(e.target); }, [forceSize]);

  useEffect(() => {
    const onResize = () => {
      const el = isVideo ? videoRef.current : imgRef.current;
      if (el) forceSize(el);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isVideo, forceSize]);

  const goTo = useCallback((i) => {
    setIdx(((i % items.length) + items.length) % items.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [items.length]);

  const next = useCallback(() => goTo(idx + 1), [idx, goTo]);
  const prev = useCallback(() => goTo(idx - 1), [idx, goTo]);
  const goFirst = useCallback(() => goTo(0), [goTo]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  useEffect(() => {
    if (!current || isVideo) return;
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);
    startTimeRef.current = Date.now();
    const dur = (current.duration || 5) * 1000;
    progressRef.current = setInterval(() => {
      setProgress(Math.min(((Date.now() - startTimeRef.current) / dur) * 100, 100));
    }, 100);
    timerRef.current = setTimeout(next, dur);
    return () => { clearTimeout(timerRef.current); clearInterval(progressRef.current); };
  }, [idx, items]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnd = () => next();
    const onTime = () => { if (v.duration) setProgress((v.currentTime / v.duration) * 100); };
    v.addEventListener("ended", onEnd);
    v.addEventListener("timeupdate", onTime);
    return () => { v.removeEventListener("ended", onEnd); v.removeEventListener("timeupdate", onTime); };
  }, [idx]);

  useEffect(() => {
    let keyBuffer = "";
    let bufferTimer = null;
    const handler = (e) => {
      const k = e.key;
      keyBuffer += k.toLowerCase();
      clearTimeout(bufferTimer);
      bufferTimer = setTimeout(() => { keyBuffer = ""; }, 800);
      if (keyBuffer.endsWith("ll")) { goFirst(); keyBuffer = ""; return; }
      switch (k) {
        case "Escape": onExit(); break;
        case "f": case "F": toggleFullscreen(); break;
        case "l": case "L": goFirst(); break;
        case "ArrowRight": next(); break;
        case "ArrowLeft": prev(); break;
        default: break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, goFirst, toggleFullscreen, onExit]);

  useEffect(() => {
    let startX = 0, startY = 0, startTime = 0;
    let touchCount = 0;
    let lastTap = 0;
    let longPressTimer = null;
    let pathPoints = [];

    const onTouchStart = (e) => {
      touchCount = e.touches.length;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      pathPoints = [{ x: startX, y: startY }];
      longPressTimer = setTimeout(() => {
        toggleFullscreen();
        navigator.vibrate?.(40);
      }, 1500);
    };

    const onTouchMove = (e) => {
      clearTimeout(longPressTimer);
      if (e.touches.length === 1) {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const last = pathPoints[pathPoints.length - 1];
        if (Math.hypot(x - last.x, y - last.y) > 20) pathPoints.push({ x, y });
      }
    };

    const onTouchEnd = (e) => {
      clearTimeout(longPressTimer);
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const elapsed = Date.now() - startTime;
      const dx = endX - startX;
      const dy = endY - startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (touchCount === 3 && elapsed < 400 && absDx < 30 && absDy < 30) {
        onExit(); navigator.vibrate?.(30); return;
      }
      if (touchCount === 2 && dy < -80 && absDy > absDx) {
        goFirst(); navigator.vibrate?.([20, 30, 20]); return;
      }
      if (touchCount !== 1) return;

      const now = Date.now();
      if (now - lastTap < 300 && absDx < 30 && absDy < 30) {
        goFirst(); navigator.vibrate?.([20, 30, 20]); lastTap = 0; return;
      }
      lastTap = now;

      if (pathPoints.length >= 4 && elapsed > 200 && elapsed < 1500) {
        const mid = Math.floor(pathPoints.length / 2);
        const s1 = pathPoints.slice(0, mid), s2 = pathPoints.slice(mid);
        const dx1 = s1[s1.length - 1].x - s1[0].x, dy1 = s1[s1.length - 1].y - s1[0].y;
        const dx2 = s2[s2.length - 1].x - s2[0].x, dy2 = s2[s2.length - 1].y - s2[0].y;
        const s1v = Math.abs(dy1) > Math.abs(dx1) * 1.5 && Math.abs(dy1) > 60;
        const s1h = Math.abs(dx1) > Math.abs(dy1) * 1.5 && Math.abs(dx1) > 60;
        const s2v = Math.abs(dy2) > Math.abs(dx2) * 1.5 && Math.abs(dy2) > 60;
        const s2h = Math.abs(dx2) > Math.abs(dy2) * 1.5 && Math.abs(dx2) > 60;
        if ((s1v && s2h) || (s1h && s2v)) {
          goFirst(); navigator.vibrate?.([20, 30, 20]); return;
        }
      }

      if (absDx > 60 && absDx > absDy * 1.5 && elapsed < 500) {
        if (dx > 0) { prev(); navigator.vibrate?.(15); }
        else { next(); navigator.vibrate?.(15); }
        return;
      }

      if (elapsed < 200 && absDx < 20 && absDy < 20) {
        const W = window.innerWidth;
        if (startX < W * 0.25) { prev(); navigator.vibrate?.(15); }
        else if (startX > W * 0.75) { next(); navigator.vibrate?.(15); }
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      clearTimeout(longPressTimer);
    };
  }, [next, prev, goFirst, toggleFullscreen, onExit]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; document.documentElement.style.overflow = ""; };
  }, []);

  if (!items.length) return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, zIndex: 99999 }}>
      <div style={{ fontSize: 48 }}>📺</div>
      <div style={{ color: "white", fontSize: 24 }}>No hay contenido configurado</div>
      <button onClick={onExit} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "10px 24px", borderRadius: 8, cursor: "pointer", marginTop: 8 }}>Volver al Admin</button>
    </div>
  );

  const currentUrl = resolveUrl(current);

  return (
    <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", background: "#000", zIndex: 99999, overflow: "hidden", margin: 0, padding: 0 }}>
      {isVideo ? (
        <video key={current.url} ref={(el) => { videoRef.current = el; forceSize(el); }} src={currentUrl} autoPlay playsInline onEnded={next} onLoadedMetadata={onMediaLoad} />
      ) : (
        <img key={current.url} ref={(el) => { imgRef.current = el; forceSize(el); }} src={currentUrl} alt={current.title} draggable={false} onLoad={onMediaLoad} />
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.12)", zIndex: 10, pointerEvents: "none" }}>
        <div style={{ height: "100%", background: "#6c63ff", width: progress + "%", transition: "width 0.1s linear" }} />
      </div>
    </div>
  );
}

// =====================================================
// ADMIN PANEL
// =====================================================
function AdminPanel({ items, setItems, settings, setSettings, onLaunch, saving }) {
  const [drag, setDrag] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState("");
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, icon) => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFiles = async (files) => {
    if (!files.length) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) continue;

      setUploadingFile(file.name);
      setUploadProgress(0);
      let url = URL.createObjectURL(file);

      if (supabase) {
        try {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${generateId()}_${safeName}`;
          let fakeProgress = 0;
          const progressInterval = setInterval(() => {
            fakeProgress = Math.min(fakeProgress + Math.random() * 8, 90);
            setUploadProgress(Math.round(fakeProgress));
          }, 300);
          const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false, contentType: file.type });
          clearInterval(progressInterval);
          if (error) {
            showToast(`Error: ${error.message}`, "❌");
          } else {
            setUploadProgress(100);
            const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
            url = pub.publicUrl;
          }
        } catch (err) {
          showToast(`Error: ${err.message}`, "❌");
        }
      } else {
        for (let p = 0; p <= 100; p += 20) {
          setUploadProgress(p);
          await new Promise(r => setTimeout(r, 80));
        }
      }

      setItems(prev => [...prev, {
        id: generateId(),
        type: isImage ? "image" : "video",
        url,
        title: file.name,
        duration: settings.defaultDuration || 5,
        order: items.length + i,
      }]);
    }

    setUploading(false);
    setUploadProgress(0);
    setUploadingFile("");
    showToast(`${files.length} archivo(s) subido(s)`, "✅");
  };

  const updateDuration = (id, delta) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, duration: Math.max(1, (it.duration || 5) + delta) } : it));
  };

  const removeItem = async (id) => {
    const item = items.find(it => it.id === id);
    if (supabase && item?.url?.includes(SUPABASE_URL)) {
      try {
        const parts = item.url.split(`/storage/v1/object/public/${STORAGE_BUCKET}/`);
        if (parts[1]) {
          await supabase.storage.from(STORAGE_BUCKET).remove([parts[1]]);
        }
      } catch (err) {
        console.error("Error eliminando archivo:", err);
      }
    }
    setItems(prev => prev.filter(it => it.id !== id));
    showToast("Eliminado", "🗑");
  };

  const onDragStart = (i) => setDraggingIdx(i);
  const onDragOver = (e, i) => { e.preventDefault(); setDragOverIdx(i); };
  const onDrop = (i) => {
    if (draggingIdx === null || draggingIdx === i) return;
    const arr = [...items];
    const [moved] = arr.splice(draggingIdx, 1);
    arr.splice(i, 0, moved);
    setItems(arr.map((it, idx) => ({ ...it, order: idx })));
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const SCREENS = ["TV Sala", "TV Recepción", "TV Exterior", "Pantalla 4", "Pantalla 5", "Pantalla 6"];

  return (
    <div className="admin">
      <div>
        {!supabase && (
          <div className="demo-banner">⚠️ Modo demo — configura tus credenciales de Supabase para guardar en la nube</div>
        )}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-title">📂 Subir Contenido</div>
          <div
            className={`upload-zone ${drag ? "drag" : ""} ${uploading ? "uploading-active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles([...e.dataTransfer.files]); }}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={(e) => handleFiles([...e.target.files])} />
            {uploading ? (
              <>
                <div className="upload-icon">{uploadingFile.match(/\.(mp4|mov|avi|webm)$/i) ? "🎬" : "🖼️"}</div>
                <div className="upload-text">Subiendo archivo...</div>
                <div className="upload-bar" style={{ marginTop: 12 }}>
                  <div className="upload-bar-fill" style={{ width: uploadProgress + "%" }} />
                </div>
                <div className="upload-status">
                  <div className="upload-status-dot" />
                  <div className="upload-filename">{uploadingFile}</div>
                  <div className="upload-percent">{uploadProgress}%</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>Por favor espera, no cierres esta ventana</div>
              </>
            ) : (
              <>
                <div className="upload-icon">🖼️</div>
                <div className="upload-text">Arrastra imágenes o videos aquí</div>
                <div className="upload-sub">O haz clic para seleccionar • JPG, PNG, GIF, MP4, MOV</div>
              </>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🗂 Orden del Carrusel</span>
            <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{items.length} elemento(s)</span>
          </div>
          {items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <div>No hay contenido aún</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Sube imágenes o videos arriba</div>
            </div>
          ) : (
            <div className="media-list">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className={`media-item ${draggingIdx === i ? "dragging" : ""} ${dragOverIdx === i ? "drag-over" : ""}`}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={(e) => onDragOver(e, i)}
                  onDrop={() => onDrop(i)}
                  onDragEnd={() => { setDraggingIdx(null); setDragOverIdx(null); }}
                >
                  <span className="drag-handle">⋮⋮</span>
                  <span style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--text-dim)", minWidth: 18 }}>{i + 1}</span>
                  {item.type === "image" ? (
                    <img className="media-thumb" src={item.url} alt={item.title} />
                  ) : (
                    <div className="media-thumb-video">🎬</div>
                  )}
                  <div className="media-info">
                    <div className="media-name">{item.title}</div>
                    <div className="media-type">{item.type === "image" ? "IMAGEN" : "VIDEO"}</div>
                  </div>
                  // Localiza el mapeo de items y busca el div de duración
                  {item.type === "image" && (
                    <div className="media-duration">
                      <button
                        className="dur-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Evita conflictos con el drag & drop
                          updateDuration(item.id, -1);
                        }}
                      >−</button>

                      {/* Asegúrate de que este span use el valor directo del item del estado */}
                      <span className="dur-val" key={`dur-${item.id}-${item.duration}`}>
                        {item.duration}s
                      </span>

                      <button
                        className="dur-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDuration(item.id, 1);
                        }}
                      >+</button>
                    </div>
                  )}
                  <button
                    className="del-btn"
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="panel">
          <div className="panel-title">⚙️ Configuración</div>
          <div className="setting-row">
            <div><div className="setting-label">Loop infinito</div><div className="setting-sub">Repite el carrusel automáticamente</div></div>
            <button className={`toggle ${settings.loop ? "on" : ""}`} onClick={() => setSettings(s => ({ ...s, loop: !s.loop }))} />
          </div>
          <div className="setting-row">
            <div><div className="setting-label">Transición suave</div><div className="setting-sub">Fade entre elementos</div></div>
            <button className={`toggle ${settings.fade ? "on" : ""}`} onClick={() => setSettings(s => ({ ...s, fade: !s.fade }))} />
          </div>
          <div className="setting-row">
            <div><div className="setting-label">Duración por defecto</div><div className="setting-sub">Para nuevas imágenes (seg.)</div></div>
            <input className="num-input" type="number" min={1} max={60} value={settings.defaultDuration} onChange={(e) => setSettings(s => ({ ...s, defaultDuration: parseInt(e.target.value) || 5 }))} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">📺 Pantallas Activas</div>
          <div className="screens-grid">
            {SCREENS.map((s, i) => (
              <div key={i} className={`screen-item ${settings.activeScreens?.includes(i) ? "active" : ""}`}
                onClick={() => setSettings(prev => {
                  const active = prev.activeScreens || [];
                  return { ...prev, activeScreens: active.includes(i) ? active.filter(x => x !== i) : [...active, i] };
                })}>
                <div className="dot" /><div>{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">⌨️ Atajos de Teclado</div>
          {[["L", "Ir al primer elemento"], ["→ ←", "Siguiente / Anterior"], ["F", "Pantalla completa"], ["ESC", "Salir del kiosko"]].map(([key, desc]) => (
            <div key={key} className="shortcut-item">
              <span className="key">{key}</span>
              <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{desc}</span>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onLaunch} disabled={items.length === 0}>
          {items.length === 0 ? "Agrega contenido primero" : "▶ Lanzar Vista Kiosko"}
        </button>

        {saving && (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--success)" }}>
            <span className="realtime-dot" />Guardando en Supabase...
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} icon={toast.icon} />}
    </div>
  );
}

// =====================================================
// APP ROOT
// =====================================================
export default function App() {
  const [view, setView] = useState(() => window.location.hash === "#kiosk" ? "kiosk" : "admin");

  const changeView = (v) => {
    window.location.hash = v === "kiosk" ? "kiosk" : "";
    setView(v);
  };
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    loop: true,
    fade: true,
    defaultDuration: 5,
    activeScreens: [0],
  });

  useEffect(() => {
    if (!supabase) { setLoaded(true); return; }
    const load = async () => {
      const { data } = await supabase.from("ad_playlists").select("*").eq("id", "main").single();
      if (data) {
        if (data.items) setItems(data.items);
        if (data.settings) setSettings(data.settings);
      }
      setLoaded(true);
    };
    load();
  }, []);

  // 1. Agrega esta referencia al inicio de tu componente App (junto a los otros useRef)
  const lastLocalUpdate = useRef(0);

  // 2. Modifica el useEffect de guardado así:
  useEffect(() => {
    if (!supabase || !loaded) return;

    setSaving(true);

    // ¡IMPORTANTE! Avisamos que acabamos de hacer un cambio manual
    lastLocalUpdate.current = Date.now();

    const save = async () => {
      await supabase.from("ad_playlists").upsert({
        id: "main",
        items,
        settings,
        updated_at: new Date().toISOString()
      });
      setSaving(false);
    };

    const t = setTimeout(save, 800);
    return () => clearTimeout(t);
  }, [items, settings, loaded]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel("playlist-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ad_playlists", filter: "id=eq.main" },
        (payload) => {
          // --- AQUÍ ESTÁ EL TRUCO PARA EL TIEMPO REAL ---
          // Calculamos cuánto tiempo pasó desde nuestro último clic
          const timeSinceMyLastChange = Date.now() - lastLocalUpdate.current;

          // Si yo cambié algo hace menos de 2.5 segundos, ignoro lo que diga el servidor
          // porque probablemente sea un dato "viejo" que viene de camino.
          if (timeSinceMyLastChange < 2500) {
            console.log("Ignorando rebote del servidor...");
            return;
          }

          if (payload.new) {
            // Usamos el estado anterior para sincronizar el caché correctamente
            setItems(prev => {
              syncCache(payload.new.items || [], prev);
              return payload.new.items || [];
            });
            setSettings(payload.new.settings || {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (view === "kiosk") {
    return <KioskView items={[...items].sort((a, b) => a.order - b.order)} onExit={() => changeView("admin")} />;
  }

  return (
    <div className="app">
      <style>{style}</style>
      <nav className="nav">
        <div className="nav-logo">ADKIOSK</div>
        <div className="nav-tabs">
          <button className="nav-tab active">Admin</button>
        </div>
        <div className="nav-screens">
          {supabase ? (
            <div className="screen-badge"><span className="realtime-dot" /><span>Realtime activo</span></div>
          ) : (
            <div className="screen-badge">Sin Supabase</div>
          )}
          <div className="screen-badge">{items.length} elementos</div>
        </div>
      </nav>
      <AdminPanel items={items} setItems={setItems} settings={settings} setSettings={setSettings} onLaunch={() => changeView("kiosk")} saving={saving} />
    </div>
  );
}