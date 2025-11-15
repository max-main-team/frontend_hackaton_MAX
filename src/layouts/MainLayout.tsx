/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Panel, Flex, Avatar, Button } from "@maxhub/max-ui";
import "../css/MainLayout.css";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import api from "../services/api";

import grade_book_white from '../images/grade_book_white.png';
import grade_book_blue from '../images/grade_book_blue.png';
import schedule_white from '../images/schedule_white.png';
import schedule_blue from '../images/schedule_blue.png';
import events_white from '../images/events_white.png';
import events_blue from '../images/events_blue.png';
import settings_white from '../images/settings_white.png';
import settings_blue from '../images/settings_blue.png';

const TAB_ITEMS = [
  { key: "grade_book", path: "/grade", label: "Зачётка" },
  { key: "schedule", path: "/schedule", label: "Расписание" },
  { key: "feed", path: "/events", label: "Актуальное" },
  { key: "settings", path: "/settings", label: "Настройки" },
];

const WHITE_ICONS: Record<string, string> = {
  grade_book: grade_book_white,
  schedule: schedule_white,
  feed: events_white,
  settings: settings_white,
};

const BLUE_ICONS: Record<string, string> = {
  grade_book: grade_book_blue,
  schedule: schedule_blue,
  feed: events_blue,
  settings: settings_blue,
};

interface MainLayoutProps {
  children: React.ReactNode;
  hideTabs?: boolean;
}

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function cacheKeyFor(userId?: string | number | null, url?: string | null) {
  if (userId != null) return `avatarCache:${String(userId)}`;
  if (url) return `avatarCache:url:${encodeURIComponent(url)}`;
  return null;
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  // fetch as blob then convert to dataURL
  const res = await fetch(url, { mode: "cors" }); // may fail on CORS — caller should handle
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
    // check TTL
    if (Date.now() - parsed.ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch (e) {
    try { localStorage.removeItem(key); } catch { /* empty */ }
    return null;
  }
}

function writeCache(key: string | null, dataUrl: string) {
  if (!key) return;
  try {
    const payload = { dataUrl, ts: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.warn("Could not write avatar cache:", e);
  }
}


export default function MainLayout({ children, hideTabs = false }: MainLayoutProps) {
  const navigate = useNavigate();
  const loc = useLocation();
  const { webAppData } = useMaxWebApp();
  
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | number | null>(null);

  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const [cachedDataUrl, setCachedDataUrl] = useState<string | null>(null);
  const [, setLoadingAvatar] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const res = await api.get("https://msokovykh.ru/user/me");
        const data = res.data;
        const u = data?.user ?? data;

        if (!mounted) return;

        if (u) {
          const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username || null;
          setUserName(fullName);
          setUserId(u.id ?? null);
          setUserPhoto(u.avatar_url ?? u.photo_url ?? u.photo ?? null);
        } else {
          setUserName(null);
          setUserId(null);
          setUserPhoto(null);
        }
      } catch (e) {
        if (!mounted) return;
        setUserName(null);
        setUserId(null);
        setUserPhoto(null);
      }
    }

    fetchProfile();

    return () => { mounted = false; };
  }, [webAppData]);

  useEffect(() => {
    let canceled = false;
    setAvatarError(false);
    setCachedDataUrl(null);

    const key = cacheKeyFor(userId, userPhoto);

    const cached = readCache(key);
    if (cached && cached.dataUrl) {
      setCachedDataUrl(cached.dataUrl);
      return;
    }

    if (!userPhoto) {
      return;
    }

    setLoadingAvatar(true);
    (async () => {
      try {
        const dataUrl = await fetchImageAsDataUrl(userPhoto);
        if (canceled) return;
        setCachedDataUrl(dataUrl);
        try { writeCache(key, dataUrl); } catch (e) { /* ignore */ }
      } catch (e) {
        console.warn("Avatar fetch/convert failed", e);
        if (!canceled) setAvatarError(true);
      } finally {
        if (!canceled) setLoadingAvatar(false);
      }
    })();

    return () => { canceled = true; };
  }, [userPhoto, userId]);


  const goProfile = (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigate("/profile");
  };

  const onTabClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (loc.pathname === path) return;

    const isFromTeacher = loc.pathname.startsWith("/teacher");
    const isFromAdmin = loc.pathname.startsWith("/admin");

    if (path === "/grade") {
      if (isFromAdmin) {
        return;
      }
      const to = isFromTeacher ? "/grade?mode=teacher" : "/grade";
      navigate(to, { state: { from: isFromTeacher ? "/teacher" : "/student" } });
      return;
    }

    if (path === "/events") {
      if (isFromAdmin) {
        navigate("/events?mode=admin", { state: { from: "/admin" } });
        return;
      }
      navigate("/events", { state: { from: isFromTeacher ? "/teacher" : "/student" } });
      return;
    }

    if (path === "/schedule" || path === "/schedules") {
      if (isFromAdmin) {
        navigate("/schedule?mode=admin", { state: { from: "/admin" } });
        return;
      }
      if (isFromTeacher) {
        navigate("/schedule?mode=teacher", { state: { from: "/teacher" } });
        return;
      }
      navigate("/schedule", { state: { from: "/student" } });
      return;
    }

    // Default behaviour for other tabs
    navigate(path);
  };




  const handleMouseEnter = (tabKey: string) => {
    setHoveredTab(tabKey);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
  };

  const getIconForTab = (tabKey: string, isActive: boolean) => {
    const isHovered = hoveredTab === tabKey;
    
    if (isActive || isHovered) {
      return BLUE_ICONS[tabKey];
    } else {
      return WHITE_ICONS[tabKey];
    }
  };

  const initials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="main-layout">
      <header className="main-header" role="banner">
        <div className="main-header-left">
          <div className="brand">Сервисы</div>
        </div>

        <div className="main-header-right">
          <Button type="button" mode="tertiary" onClick={goProfile} aria-label="Profile">
            <Avatar.Container size={40} form="circle" className="main-avatar">
              <div className="main-avatar__empty" aria-hidden />

              {cachedDataUrl && !avatarError && (
                <img
                  className="main-avatar__img loaded"
                  src={cachedDataUrl}
                  alt={userName ?? "avatar"}
                />
              )}

              {(!cachedDataUrl && avatarError) && (
                <Avatar.Text className="main-avatar__fallback-text">{initials(userName)}</Avatar.Text>
              )}
            </Avatar.Container>
          </Button>
        </div>
      </header>

      <main className={`main-content ${hideTabs ? 'main-content--no-tabs' : ''}`}>
        {children}
      </main>

      {!hideTabs && (
        <nav className="main-bottom-tabs" aria-label="Основная навигация">
          <Panel mode="primary" className="tabs-panel" role="navigation" aria-hidden={false}>
            <Flex justify="space-between" align="center" style={{ width: "100%" }}>
              {TAB_ITEMS.map((tab) => {
                const active = loc.pathname.startsWith(tab.path);
                const iconSrc = getIconForTab(tab.key, active);
                
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={onTabClick(tab.path)}
                    onMouseEnter={() => handleMouseEnter(tab.key)}
                    onMouseLeave={handleMouseLeave}
                    className={`tab-button ${active ? "active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    title={tab.label}
                  >
                    <div className="tab-item" aria-hidden>
                      <div className="tab-icon">
                        <img src={iconSrc} alt={tab.label} />
                      </div>
                      <div className="tab-label">{tab.label}</div>
                    </div>
                  </button>
                );
              })}
            </Flex>
          </Panel>
        </nav>
      )}
    </div>
  );
}
