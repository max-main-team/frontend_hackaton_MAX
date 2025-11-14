// AdminPage.tsx
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
    <MainLayout hideTabs={true}>
      {/* подняли секцию чуть повыше (меньше верхнего марджина) */}
      <div className="admin-section admin-section--tight">
        <Typography.Title variant="medium-strong" className="admin-section__title">
          Административное
        </Typography.Title>

        <Grid cols={2} gap={12}>
          <Panel
            className="admin-card admin-card--primary"
            mode="primary"
            onClick={handleRequestsClick}
            style={{ cursor: "pointer" }}
          >
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong">Заявки на вступление в группы</Typography.Title>
              <Typography.Label className="admin-card__hint">Просмотр и подтверждение заявок</Typography.Label>
            </Container>
          </Panel>

          <Panel
            className="admin-card admin-card--primary"
            mode="primary"
            onClick={handleEntitiesClick}
            style={{ cursor: "pointer" }}
          >
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong">Управление данными</Typography.Title>
              <Typography.Label className="admin-card__hint">Факультеты, направления, группы, предметы</Typography.Label>
            </Container>
          </Panel>
        </Grid>
      </div>

      {/* Кампус — добавили отступ между заголовком и карточками */}
      <div className="admin-section">
        <Typography.Title variant="medium-strong" className="admin-section__title">
          Кампус
        </Typography.Title>

        <Grid cols={2} gap={12}>
          <Panel className="admin-card admin-card--tall admin-card--accent-left" mode="secondary">
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong">Загруженность</Typography.Title>
              <Typography.Label className="admin-card__hint">Нагрузка по аудиториям и преподавателям</Typography.Label>
            </Container>
          </Panel>

          <Panel className="admin-card admin-card--tall admin-card--accent-pass" mode="secondary">
            <Container className="admin-card__content">
              <Typography.Title variant="small-strong">Пропуск</Typography.Title>
              <Typography.Label className="admin-card__hint">Управление проходами и доступом на кампус</Typography.Label>
            </Container>
          </Panel>
        </Grid>
      </div>
    </MainLayout>
  );
}
