import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Panel, Typography, Flex, Button } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import "../css/SettingsPage.css";

export default function SettingsPage(): JSX.Element {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [language, setLanguage] = useState("ru");

  return (
    <MainLayout>
      <Container className="settings-container">
        <div className="settings-header">
          <Flex justify="space-between" align="center" style={{ width: "100%" }}>
            <div>
              <Typography.Title variant="large-strong" className="settings-title">
                Настройки
              </Typography.Title>
              <Typography.Label className="settings-sub">
                Параметры вашего аккаунта и интерфейса
              </Typography.Label>
            </div>

            <div className="header-actions">
              <Button mode="secondary" size="small" onClick={() => navigate(-1)}>Назад</Button>
            </div>
          </Flex>
        </div>

        <div className="settings-list">
          <Panel mode="secondary" className="settings-panel">
            <div className="settings-row">
              <div className="settings-row-left">
                <Flex direction="column" gap={4} style={{ flex: 1 }}>
                  <Typography.Title variant="small-strong" className="row-title">Уведомления</Typography.Title>
                  <Typography.Label className="row-sub">Получать push-уведомления об оценках и объявлениях</Typography.Label>
                </Flex>
              </div>

              <div className="settings-row-right">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={() => setNotifications(prev => !prev)}
                    aria-label="Уведомления"
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            </div>
          </Panel>

          <Panel mode="secondary" className="settings-panel">
            <div className="settings-row">
              <div className="settings-row-left">
                <Flex direction="column" gap={4} style={{ flex: 1 }}>
                  <Typography.Title variant="small-strong" className="row-title">Режим компактности</Typography.Title>
                  <Typography.Label className="row-sub">Плотное отображение списков и карточек (экономит место)</Typography.Label>
                </Flex>
              </div>

              <div className="settings-row-right">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={() => setCompactMode(prev => !prev)}
                    aria-label="Compact mode"
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            </div>
          </Panel>

          <Panel mode="secondary" className="settings-panel">
            <div className="settings-row">
              <div className="settings-row-left">
                <Flex direction="column" gap={4} style={{ flex: 1 }}>
                  <Typography.Title variant="small-strong" className="row-title">Язык</Typography.Title>
                  <Typography.Label className="row-sub">Предпочитаемый язык интерфейса</Typography.Label>
                </Flex>
              </div>

              <div className="settings-row-right">
                <select
                  className="select-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label="Язык интерфейса"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </Panel>

          <Panel mode="secondary" className="settings-panel settings-actions">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, width: "100%", alignItems: "center" }}>
              <div>
                <Flex direction="column" gap={4} style={{ flex: 1 }}>
                  <Typography.Title variant="small-strong" className="row-title">Аккаунт</Typography.Title>
                  <Typography.Label className="row-sub">Безопасность и выход</Typography.Label>
                </Flex>
              </div>
            </div>
          </Panel>

          <div className="credits">
            <Typography.Label className="muted">Версия интерфейса: 1.0.0</Typography.Label>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}
