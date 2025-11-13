import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Panel, Flex, Avatar, Button } from "@maxhub/max-ui";
import "../css/MainLayout.css";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import api from "../services/api";

const TAB_ITEMS = [
  { key: "people", path: "/people", label: "Люди" },
  { key: "schedule", path: "/schedule", label: "Расписание" },
  { key: "feed", path: "/feed", label: "Актуальное" },
  { key: "settings", path: "/settings", label: "Настройки" },
];

const ICONS: Record<string,string> = {
  people: "https://images.unsplash.com/photo-1531123414780-f8f8e9f9d3a9?w=256&q=60",     // заменить на свои
  schedule: "https://images.unsplash.com/photo-1508780709619-79562169bc64?w=256&q=60",
  feed: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=256&q=60",
  settings: "https://images.unsplash.com/photo-1503602642458-232111445657?w=256&q=60",
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
      }
    }

    fetchProfile();

    return () => { mounted = false; };
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
      <header className="main-header">
        <div className="main-header-left">Сервисы</div>

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

      {/* Условный рендеринг нижней панели */}
      {!hideTabs && (
        <nav className="main-bottom-tabs">
          <Panel mode="primary" className="tabs-panel">
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
                    style={{ flex: 1, display: "inline-flex", justifyContent: "center", alignItems: "center" }}
                  >
                    <div className="tab-item" aria-hidden>
                      <div className="tab-icon">
                        <img src={ICONS[tab.key] ?? ICONS["people"]} alt={tab.label} />
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