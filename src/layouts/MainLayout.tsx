import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Panel, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import '../css/MainLayout.css';

const TAB_ITEMS = [
  { key: "people", path: "/people", label: "Люди" },
  { key: "schedule", path: "/schedule", label: "Расписание" },
  { key: "feed", path: "/feed", label: "Актуальное" },
  { key: "settings", path: "/settings", label: "Настройки" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();

  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="main-header-left">
          <Typography.Title variant="large-strong">Сервисы</Typography.Title>
        </div>

        <div className="main-header-right">
          <Button asChild>
            <Link to="/profile" aria-label="Profile">
              <Avatar.Container size={40} form="circle">
              </Avatar.Container>
            </Link>
          </Button>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <nav className="main-bottom-tabs">
        <Panel mode="primary" className="tabs-panel">
          <Flex justify="space-between" align="center" style={{ width: "100%" }}>
            {TAB_ITEMS.map(tab => {
              const active = loc.pathname.startsWith(tab.path);
              return (
                <Link key={tab.key} to={tab.path} className={`tab-link ${active ? "active" : ""}`}>
                  <div className="tab-item">
                    <div className="tab-icon">{/* simple icon placeholder */}🔹</div>
                    <div className="tab-label">{tab.label}</div>
                  </div>
                </Link>
              );
            })}
          </Flex>
        </Panel>
      </nav>
    </div>
  );
}
