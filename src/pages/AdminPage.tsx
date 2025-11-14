import "../css/AdminPage.css";
import { Panel, Grid, Container, Typography } from "@maxhub/max-ui";
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
        <Typography.Title variant="medium-strong" style={{ marginBottom: 16 }}>Административное</Typography.Title>

        <Grid cols={2} gap={12}>
          <Panel className="admin-card" mode="primary" onClick={handleRequestsClick} style={{ cursor: "pointer" }}>
            <Container style={{ padding: 12 }}>
              <Typography.Title variant="small-strong">Заявки на вступление в группы</Typography.Title>
            </Container>
          </Panel>
          
          <Panel className="admin-card" mode="primary" onClick={handleEntitiesClick} style={{ cursor: "pointer" }}>
            <Container style={{ padding: 12 }}>
              <Typography.Title variant="small-strong">Управление данными</Typography.Title>
            </Container>
          </Panel>
        </Grid>
      </div>

      <div className="admin-section" style={{ marginTop: 32 }}>
        <Typography.Title variant="medium-strong" style={{ marginBottom: 16 }}>Кампус</Typography.Title>

        <Grid cols={2} gap={12}>
          <Panel className="admin-card admin-card--tall admin-card--accent-left" mode="secondary">
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong">Загруженность</Typography.Title>
            </Container>
          </Panel>

          <Panel className="admin-card admin-card--tall admin-card--right" mode="secondary">
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong">Пропуск</Typography.Title>
            </Container>
          </Panel>
        </Grid>
      </div>
    </MainLayout>
  );
}