import "../css/AdminPage.css";
import { Panel, Container, Typography } from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const navigate = useNavigate();

  const handleRequestsClick = () => {
    navigate("/admin/requests");
  };

  const handleEntitiesClick = () => {
    navigate("/admin/entities");
  };

  return (
    <MainLayout>
      <div className="admin-section" style={{ marginTop: 24 }}>
        <Typography.Title variant="medium-strong" className="admin-section__title">
          Административное
        </Typography.Title>

        <div className="admin-grid">
          <Panel 
            className="admin-card admin-card--interactive" 
            onClick={handleRequestsClick}
          >
            <Container className="admin-card__content">
              <div className="admin-card__status"></div>
              <Typography.Title variant="small-strong" className="admin-card__title">
                Заявки на вступление в группы
              </Typography.Title>
            </Container>
          </Panel>
          
          <Panel 
            className="admin-card admin-card--interactive" 
            onClick={handleEntitiesClick}
          >
            <Container className="admin-card__content">
              <div className="admin-card__status"></div>
              <Typography.Title variant="small-strong" className="admin-card__title">
                Управление данными
              </Typography.Title>
            </Container>
          </Panel>
        </div>
      </div>

      <div className="admin-section" style={{ marginTop: 32 }}>
        <Typography.Title variant="medium-strong" className="admin-section__title">
          Кампус
        </Typography.Title>

        <div className="admin-grid">
          <Panel className="admin-card admin-card--tall admin-card--accent-left">
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong" className="admin-card__title">
                Загруженность
              </Typography.Title>
            </Container>
          </Panel>

          <Panel className="admin-card admin-card--tall admin-card--right">
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong" className="admin-card__title">
                Пропуск
              </Typography.Title>
            </Container>
          </Panel>
        </div>
      </div>
    </MainLayout>
  );
}