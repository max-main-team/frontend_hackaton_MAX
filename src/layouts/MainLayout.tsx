import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Panel, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import "../css/MainLayout.css";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import api from "../services/api";

const TAB_ITEMS = [
  { key: "people", path: "/people", label: "Люди" },
  { key: "schedule", path: "/schedule", label: "Расписание" },
  { key: "feed", path: "/feed", label: "Актуальное" },
  { key: "settings", path: "/settings", label: "Настройки" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
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
        <div className="main-header-left">
          <Typography.Title variant="large-strong">Сервисы</Typography.Title>
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

      <nav className="main-bottom-tabs">
        <Panel mode="primary" className="tabs-panel">
          <Flex justify="space-between" align="center" style={{ width: "100%" }}>
            {TAB_ITEMS.map((tab) => {
              const active = loc.pathname.startsWith(tab.path);
              return (
                <Button
                  key={tab.key}
                  type="button"
                  mode={active ? "primary" : "tertiary"}
                  size="small"
                  onClick={onTabClick(tab.path)}
                  aria-current={active ? "page" : undefined}
                  className={`tab-button ${active ? "active" : ""}`}
                  style={{ flex: 1, display: "flex", justifyContent: "center", gap: 8 }}
                >
                  <div className="tab-item">
                    <div className="tab-icon">🔹</div>
                    <div className="tab-label">{tab.label}</div>
                  </div>
                </Button>
              );
            })}
          </Flex>
        </Panel>
      </nav>
    </div>
  );
}
