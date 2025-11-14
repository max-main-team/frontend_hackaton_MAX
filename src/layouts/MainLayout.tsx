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
  { key: "grade_book", path: "/grade_book", label: "Зачётка" },
  { key: "schedule", path: "/schedule", label: "Расписание" },
  { key: "feed", path: "/feed", label: "Актуальное" },
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

export default function MainLayout({ children, hideTabs = false }: MainLayoutProps) {
  const navigate = useNavigate();
  const loc = useLocation();
  const { webAppData } = useMaxWebApp();
  
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // preload state
  const [photoLoaded, setPhotoLoaded] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<boolean>(false);

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
          setUserPhoto(u.avatar_url ?? u.photo_url ?? u.photo ?? null);
        } else {
          setUserName(null);
          setUserPhoto(null);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        if (!mounted) return;
        setUserName(null);
        setUserPhoto(null);
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [webAppData]);


  // prefetch image and set loaded/error flags
  useEffect(() => {
    setPhotoLoaded(false);
    setPhotoError(false);

    if (!userPhoto) {
      return;
    }

    let canceled = false;
    const img = new Image();
    img.src = userPhoto;

    img.onload = () => {
      if (!canceled) setPhotoLoaded(true);
    };
    img.onerror = () => {
      if (!canceled) {
        console.warn("Avatar image failed to load:", userPhoto);
        setPhotoError(true);
        setPhotoLoaded(false);
      }
    };

    return () => {
      canceled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [userPhoto]);

  const goProfile = (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigate("/profile");
  };

  const onTabClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (loc.pathname === path) return;
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
            {/* main-avatar класс нужен для позиционирования картинки поверх текста */}
            <Avatar.Container size={40} form="circle" className="main-avatar">
              {/* всегда рендерим инициалы (чтобы размер был стабильным) */}
              <Avatar.Text className="main-avatar__text">{initials(userName)}</Avatar.Text>

              {/* картинка накладывается поверх; видна только когда photoLoaded === true */}
              {userPhoto && !photoError && (
                <img
                  className={`main-avatar__img ${photoLoaded ? "loaded" : ""}`}
                  src={userPhoto}
                  alt={userName ?? "avatar"}
                  // onError на случай, если что-то пойдёт не так при вставке в DOM
                  onError={() => {
                    console.warn("Avatar img tag error for:", userPhoto);
                    setPhotoError(true);
                    setPhotoLoaded(false);
                  }}
                />
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
