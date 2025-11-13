import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Panel, Flex, Avatar, Button } from "@maxhub/max-ui";
import "../css/MainLayout.css";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import api from "../services/api";

const TAB_ITEMS = [
  { key: "people", path: "/people", label: "Зачётка" },
  { key: "schedule", path: "/schedule", label: "Расписание" },
  { key: "feed", path: "/feed", label: "Актуальное" },
  { key: "services", path: "/services", label: "Сервисы" },
];

const ICONS: Record<string, string> = {
  people: "https://i.postimg.cc/3xq4m7mM/tab-people.png",
  schedule: "https://i.postimg.cc/4Np6Xhzs/tab-schedule.png",
  feed: "https://i.postimg.cc/FK7xJ9xV/tab-feed.png",
  services: "https://i.postimg.cc/3Rx1V6Wx/tab-services.png",
};

interface MainLayoutProps {
  children: React.ReactNode;
  hideTabs?: boolean;
}

export default function MainLayout({ children, hideTabs = false }: MainLayoutProps) {
  const navigate = useNavigate();
  const loc = useLocation();
  const { webAppData } = useMaxWebApp();

  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

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

  const goProfile = (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigate("/profile");
  };

  const onTabClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (loc.pathname === path) return;
    navigate(path);
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
          <div className="brand">Хакатон 283</div>
        </div>

        <div className="main-header-right">
          <Button type="button" mode="tertiary" onClick={goProfile} aria-label="Profile">
            <Avatar.Container size={40} form="circle">
              {userPhoto ? (
                <Avatar.Image src={userPhoto} />
              ) : (
                <Avatar.Text>{initials(userName)}</Avatar.Text>
              )}
            </Avatar.Container>
          </Button>
        </div>
      </header>

      <main className="main-content">{children}</main>

      {/* Нижняя панель */}
      {!hideTabs && (
        <nav className="main-bottom-tabs" aria-label="Основная навигация">
          <Panel mode="primary" className="tabs-panel" role="navigation" aria-hidden={false}>
            <Flex justify="space-between" align="center" style={{ width: "100%" }}>
              {TAB_ITEMS.map((tab) => {
                const active = loc.pathname.startsWith(tab.path);
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={onTabClick(tab.path)}
                    className={`tab-button ${active ? "active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    title={tab.label}
                  >
                    <div className="tab-item" aria-hidden>
                      <div className="tab-icon">
                        <img src={ICONS[tab.key] ?? ICONS["services"]} alt="" />
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
