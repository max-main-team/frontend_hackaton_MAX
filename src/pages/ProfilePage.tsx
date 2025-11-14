import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Panel, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import api from "../services/api";
import "../css/ProfilePage.css";

/* ---------- cache / fetch helpers ---------- */
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function cacheKeyFor(userId?: string | number | null, url?: string | null) {
  if (userId != null) return `avatarCache:${String(userId)}`;
  if (url) return `avatarCache:url:${encodeURIComponent(url)}`;
  return null;
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(blob);
  });
}

function readCache(key: string | null): { dataUrl: string; ts: number } | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.dataUrl || !parsed.ts) return null;
    if (Date.now() - parsed.ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    try { localStorage.removeItem(key); } catch { /* empty */ }
    return null;
  }
}

function writeCache(key: string | null, dataUrl: string) {
  if (!key) return;
  try {
    const payload = { dataUrl, ts: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // best-effort: ignore storage errors
  }
}

/* ---------- ProfilePage component ---------- */

export default function ProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const { webAppData } = useMaxWebApp();
  const webUser = webAppData?.user ?? null;

  const [fullName, setFullName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // cached dataURL (immediate when present)
  const [cachedDataUrl, setCachedDataUrl] = useState<string | null>(null);
  const [, setLoadingAvatar] = useState<boolean>(false);
  const [, setAvatarError] = useState<boolean>(false);

  function initials(name?: string | null) {
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  useEffect(() => {
    let mounted = true;

    async function loadProfileFromApi() {
      try {
        const res = await api.get("https://msokovykh.ru/user/me");
        const data = res?.data;
        const u = data?.user ?? data;

        if (!mounted) return;

        if (u) {
          const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username || null;
          setFullName(name);
          setUserId(u.id ?? null);
          setAvatarUrl(u.avatar_url ?? u.photo_url ?? null);
          return;
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // ignore, fallback to webAppData below
      }

      if (!mounted) return;
      const fallbackName = [webUser?.first_name, webUser?.last_name].filter(Boolean).join(" ").trim() || webUser?.username || null;
      setFullName(fallbackName);
      setUserId(webUser?.id ?? null);
      setAvatarUrl(webUser?.avatar_url ?? webUser?.photo_url ?? null);
    }

    loadProfileFromApi();
    return () => { mounted = false; };
  }, [webUser]);

  // Try to read cached dataURL synchronously; otherwise fetch+cache it.
  useEffect(() => {
    let canceled = false;
    setCachedDataUrl(null);
    setAvatarError(false);

    const key = cacheKeyFor(userId, avatarUrl);
    const cached = readCache(key);
    if (cached && cached.dataUrl) {
      setCachedDataUrl(cached.dataUrl);
      return;
    }

    if (!avatarUrl) {
      // no remote avatar — nothing to load
      return;
    }

    setLoadingAvatar(true);
    (async () => {
      try {
        const dataUrl = await fetchImageAsDataUrl(avatarUrl);
        if (canceled) return;
        setCachedDataUrl(dataUrl);
        try { writeCache(key, dataUrl); } catch { /* empty */ }
      } catch (e) {
        if (!canceled) {
          console.warn("Profile avatar fetch failed", e);
          setAvatarError(true);
        }
      } finally {
        if (!canceled) setLoadingAvatar(false);
      }
    })();

    return () => { canceled = true; };
  }, [avatarUrl, userId]);

  function goBack() { navigate(-1); }
  function goToSelectProfile() { navigate("/select", { replace: true }); }
  function goToApplicant() { navigate("/abiturient", { replace: true }); }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      boxSizing: "border-box",
      background: "transparent",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)"
    }}>
      <Panel
        mode="secondary"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 0,
          padding: 20,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Flex direction="column" align="center" justify="start" style={{ width: "100%", gap: 12 }}>
          <div style={{ height: 18 }} />

          <Avatar.Container size={112} form="circle" className="profile-avatar">
            {/* Behavior:
                - if cachedDataUrl present -> show image immediately (no initials/placeholder)
                - else if avatarUrl exists but not yet ready -> show placeholder (no initials)
                - else (no avatarUrl) -> show initials as fallback
            */}
            {cachedDataUrl ? (
              // show from cache (data URL)
              <img className="profile-avatar__img loaded" src={cachedDataUrl} alt={fullName ?? "avatar"} />
            ) : avatarUrl ? (
              // avatar exists but not ready yet -> show empty placeholder (no letters)
              <div className="profile-avatar__placeholder" aria-hidden />
            ) : (
              // no avatar URL at all -> fallback to initials
              <Avatar.Text>{initials(fullName ?? webUser?.username ?? null)}</Avatar.Text>
            )}
          </Avatar.Container>

          <Typography.Title variant="large-strong" style={{ margin: "6px 0 0 0", textAlign: "center" }}>
            {fullName ?? "Пользователь"}
          </Typography.Title>

          {webUser?.username && (
            <Typography.Label style={{ color: "var(--maxui-muted, #6b7280)", marginTop: 4 }}>
              @{webUser.username}
            </Typography.Label>
          )}

          <div style={{ height: 14 }} />

          <div style={{ width: "100%", maxWidth: 720, padding: "0 12px", boxSizing: "border-box" }}>
            <Flex gap={12} style={{ width: "100%" }}>
              <Button mode="secondary" appearance="neutral" stretched onClick={goBack}>
                Назад
              </Button>

              <Button mode="secondary" appearance="neutral" stretched onClick={goToSelectProfile}>
                Выбор профиля
              </Button>
            </Flex>

            <div style={{ height: 8 }} />

            <Button mode="primary" stretched onClick={goToApplicant}>
              Страница абитуриента
            </Button>
          </div>
        </Flex>

        <div style={{ flex: 1 }} />
      </Panel>
    </div>
  );
}
