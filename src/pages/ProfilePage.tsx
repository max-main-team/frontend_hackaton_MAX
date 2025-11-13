/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { 
  Panel, 
  Container, 
  Flex, 
  Avatar, 
  Typography, 
  Button, 
  Grid,
  Switch,
  Counter
} from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import { useEffect, useState } from "react";
import api from "../services/api";

// Заглушки для иконок (замените на реальные иконки из @maxhub/max-ui когда будут доступны)
const Icon24Placeholder = () => <span>🔹</span>;

// Компонент для кнопок инструментов
const ToolButton = ({ icon, onClick, children }: { icon: React.ReactNode, onClick: () => void, children: React.ReactNode }) => (
  <Button mode="tertiary" size="small" onClick={onClick} style={{ flexDirection: 'column', height: 'auto', padding: '8px 4px' }}>
    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
    <Typography.Label style={{ fontSize: '11px' }}>{children}</Typography.Label>
  </Button>
);

// Компонент для ячеек списка
const CellSimple = ({ 
  title, 
  subtitle, 
  before, 
  after, 
  showChevron,
  onClick 
}: { 
  title: string, 
  subtitle?: string, 
  before?: React.ReactNode,
  after?: React.ReactNode,
  showChevron?: boolean,
  onClick?: () => void 
}) => (
  <Panel mode="secondary" style={{ padding: '12px', marginBottom: '8px', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
    <Flex align="center" justify="space-between">
      <Flex align="center" gap={8}>
        {before}
        <div>
          <Typography.Body variant="small-strong">{title}</Typography.Body>
          {subtitle && <Typography.Label style={{ fontSize: '12px' }}>{subtitle}</Typography.Label>}
        </div>
      </Flex>
      <Flex align="center" gap={8}>
        {after}
        {showChevron && <span>›</span>}
      </Flex>
    </Flex>
  </Panel>
);

const CellAction = ({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode, 
  onClick: () => void 
}) => (
  <Panel mode="secondary" style={{ padding: '12px', marginBottom: '8px', cursor: 'pointer' }} onClick={onClick}>
    <Typography.Body variant="small">{children}</Typography.Body>
  </Panel>
);

const CellInput = ({ 
  before, 
  placeholder 
}: { 
  before: string, 
  placeholder: string 
}) => (
  <Panel mode="secondary" style={{ padding: '12px', marginBottom: '8px' }}>
    <Flex align="center" gap={8}>
      <Typography.Label style={{ minWidth: '60px' }}>{before}</Typography.Label>
      <input 
        placeholder={placeholder}
        style={{ 
          border: 'none', 
          background: 'transparent', 
          flex: 1, 
          outline: 'none',
          color: 'var(--maxui-text, #0f1724)',
          fontSize: '14px'
        }}
      />
    </Flex>
  </Panel>
);

const CellList = ({ 
  children, 
  header
}: { 
  children: React.ReactNode, 
  header?: React.ReactNode,
  mode?: string
}) => (
  <div style={{ marginBottom: '16px' }}>
    {header}
    {children}
  </div>
);

const CellHeader = ({ children }: { children: React.ReactNode }) => (
  <Typography.Label style={{ display: 'block', marginBottom: '8px', color: 'var(--maxui-muted, #6b7280)' }}>
    {children}
  </Typography.Label>
);

export default function ProfilePage() {
  const { webAppData } = useMaxWebApp();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchUserData() {
      try {
        const res = await api.get("https://msokovykh.ru/user/me");
        if (mounted) {
          setUserData(res.data?.user || res.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchUserData();

    return () => { mounted = false; };
  }, []);

  async function onLogout() {
    try {
      // Очистка localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_roles");
      localStorage.removeItem("selected_role");
      sessionStorage.removeItem("session_auth");
      
      // Редирект на страницу выбора роли
      navigate("/select", { replace: true });
    } catch (e) {
      console.warn("Logout error", e);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <Container style={{ paddingTop: 8 }}>
          <Typography.Title variant="large-strong">Загрузка...</Typography.Title>
        </Container>
      </MainLayout>
    );
  }

  const user = userData || webAppData?.user || {};
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.username || "Пользователь";
  const avatarUrl = user.avatar_url || user.photo_url || user.photo;

  return (
    <MainLayout>
      <Container style={{ paddingTop: 8, paddingBottom: 20 }}>
        <Panel mode="secondary" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Flex direction="column" gap={24} style={{ padding: '16px' }}>
            {/* Header Section */}
            <Container>
              <Flex direction="column" align="center" gap={16}>
                <Avatar.Container size={96} form="circle">
                  <Avatar.Image 
                    src={avatarUrl}
                    fallback={fullName.split(' ').map((n: any[]) => n[0]).join('').toUpperCase()}
                  />
                </Avatar.Container>

                <Flex direction="column" align="center">
                  <Typography.Headline variant="large-strong" style={{ textAlign: 'center' }}>
                    {fullName}
                  </Typography.Headline>
                  <Typography.Body variant="small" style={{ color: 'var(--maxui-muted, #6b7280)' }}>
                    {user.subscribers_count || 1} подписчик
                  </Typography.Body>
                </Flex>

                <Grid cols={4} gap={8} style={{ width: '100%' }}>
                  <ToolButton icon={<Icon24Placeholder />} onClick={() => {}}>
                    Уведомл.
                  </ToolButton>

                  <ToolButton icon={<Icon24Placeholder />} onClick={() => {}}>
                    Поиск
                  </ToolButton>

                  <ToolButton icon={<Icon24Placeholder />} onClick={() => {}}>
                    Аудио
                  </ToolButton>

                  <ToolButton icon={<Icon24Placeholder />} onClick={() => {}}>
                    Еще
                  </ToolButton>
                </Grid>
              </Flex>
            </Container>

            {/* Body Section */}
            <Flex direction="column" gap={16}>
              {/* About Section */}
              {user.description && (
                <CellList
                  mode="island"
                  header={<CellHeader>О себе</CellHeader>}
                >
                  <CellSimple
                    title={user.description}
                  />
                </CellList>
              )}

              {/* Phone Section */}
              {user.phone && (
                <CellList
                  mode="island"
                  header={<CellHeader>Телефон</CellHeader>}
                >
                  <CellAction
                    onClick={() => {}}
                  >
                    {user.phone}
                  </CellAction>
                </CellList>
              )}

              {/* Attachments Section */}
              <CellList mode="island">
                <CellSimple
                  showChevron
                  before={<Icon24Placeholder />}
                  onClick={() => {}}
                  title="Вложения"
                  after={
                    <Counter
                      value={user.attachments_count || 1245}
                      rounded
                    />
                  }
                  subtitle="Фото, видео, файлы и ссылки"
                />
              </CellList>
            </Flex>

            {/* Settings Section */}
            <CellList
              mode="island"
              header={<CellHeader>Настройки</CellHeader>}
            >
              <CellInput
                before="Статус"
                placeholder="Укажите статус"
              />

              <CellInput
                before="Страна"
                placeholder="Укажите страну"
              />

              <CellInput
                before="Город"
                placeholder="Укажите город"
              />

              <Panel mode="secondary" style={{ padding: '12px' }}>
                <Flex align="center" justify="space-between">
                  <Typography.Body variant="small">Закрытый профиль</Typography.Body>
                  <Switch defaultChecked={false} />
                </Flex>
              </Panel>
            </CellList>

            {/* Action Buttons */}
            <Container>
              <Flex gap={8}>
                <Button
                  size="large"
                  mode="secondary"
                  appearance="neutral"
                  stretched
                  onClick={() => navigate(-1)}
                >
                  Назад
                </Button>

                <Button
                  size="large"
                  mode="secondary"
                  appearance="neutral"
                  stretched
                  onClick={onLogout}
                >
                  Выйти
                </Button>
              </Flex>
            </Container>
          </Flex>
        </Panel>
      </Container>
    </MainLayout>
  );
}