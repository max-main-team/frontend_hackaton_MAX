import { useState, useEffect } from "react";
import {
  Panel,
  Container,
  Flex,
  Avatar,
  Typography,
  Button,
  Grid
} from "@maxhub/max-ui";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import "../css/AdminRequestsPage.css";

interface Request {
  role: string;
  user_id: number;
  first_name: string;
  second_name: string;
}

interface AcceptRequestData {
  course_group_id?: number;
  faculty_id?: number;
  role: string;
  university_department_id?: number;
  university_id?: number;
  user_id: number;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/personalities/access");
      setRequests(response.data.data || []);
    } catch (err) {
      setError("Ошибка при загрузке заявок");
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = (request: Request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleRejectClick = async (request: Request) => {
    try {
      // Remove from UI immediately
      setRequests(prev => prev.filter(r => r.user_id !== request.user_id));
      // Here you would typically call a reject endpoint if available
      console.log("Rejected request:", request);
    } catch (err) {
      console.error("Failed to reject request:", err);
      // Re-add if error
      setRequests(prev => [...prev, request]);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleModalSubmit = async (formData: AcceptRequestData) => {
    if (!selectedRequest) return;

    try {
      setAcceptLoading(true);
      await api.post("/admin/personalities/access/accept", formData);
      
      // Remove the accepted request from the list
      setRequests(prev => prev.filter(r => r.user_id !== selectedRequest.user_id));
      handleModalClose();
    } catch (err) {
      setError("Ошибка при принятии заявки");
      console.error("Failed to accept request:", err);
    } finally {
      setAcceptLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      student: "Студент",
      teacher: "Преподаватель",
      admin: "Администратор"
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      student: "var(--maxui-color-success-500)",
      teacher: "var(--maxui-color-warning-500)",
      admin: "var(--maxui-color-primary-500)"
    };
    return colorMap[role] || "var(--maxui-color-gray-500)";
  };

  if (loading) {
    return (
      <MainLayout>
        <Container className="admin-requests-container">
          <div className="loading-state">
            <Typography.Title variant="medium-strong">Загрузка заявок...</Typography.Title>
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container className="admin-requests-container">
        <div className="admin-requests-header">
          <Typography.Title variant="large-strong" className="page-title">
            Заявки на вступление в группы
          </Typography.Title>
          <Typography.Label className="page-subtitle">
            Управление заявками пользователей на получение ролей в университете
          </Typography.Label>
        </div>

        {error && (
          <Panel mode="secondary" className="error-panel">
            <Typography.Label style={{ color: "var(--maxui-color-error-500)" }}>
              {error}
            </Typography.Label>
          </Panel>
        )}

        {requests.length === 0 ? (
          <Panel mode="secondary" className="empty-state">
            <Typography.Title variant="small-strong">Заявок нет</Typography.Title>
            <Typography.Label>Новых заявок на вступление не найдено</Typography.Label>
          </Panel>
        ) : (
          <Grid cols={1} gap={16} className="requests-grid">
            {requests.map(request => (
              <Panel key={request.user_id} mode="secondary" className="request-card">
                <Flex align="center" gap={16} style={{ width: "100%" }}>
                  <Avatar.Container size={56} form="circle">
                    <Avatar.Text>
                      {request.first_name?.[0]?.toUpperCase()}{request.second_name?.[0]?.toUpperCase()}
                    </Avatar.Text>
                  </Avatar.Container>
                  
                  <div style={{ flex: 1 }}>
                    <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                      <Typography.Title variant="small-strong" className="user-name">
                        {request.first_name} {request.second_name}
                      </Typography.Title>
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(request.role) }}
                      >
                        {getRoleDisplayName(request.role)}
                      </span>
                    </Flex>
                    <Typography.Label className="user-id">
                      ID пользователя: {request.user_id}
                    </Typography.Label>
                  </div>

                  <Flex gap={8} className="action-buttons">
                    <Button 
                      mode="primary" 
                      size="small"
                      onClick={() => handleAcceptClick(request)}
                      className="accept-button"
                    >
                      Принять
                    </Button>
                    <Button 
                      mode="tertiary" 
                      size="small"
                      onClick={() => handleRejectClick(request)}
                      className="reject-button"
                    >
                      Отклонить
                    </Button>
                  </Flex>
                </Flex>
              </Panel>
            ))}
          </Grid>
        )}

        {modalOpen && selectedRequest && (
          <AcceptRequestModal
            request={selectedRequest}
            onClose={handleModalClose}
            onSubmit={handleModalSubmit}
            loading={acceptLoading}
          />
        )}
      </Container>
    </MainLayout>
  );
}

interface AcceptRequestModalProps {
  request: Request;
  onClose: () => void;
  onSubmit: (formData: AcceptRequestData) => void;
  loading: boolean;
}

function AcceptRequestModal({ request, onClose, onSubmit, loading }: AcceptRequestModalProps) {
  const [formData, setFormData] = useState({
    university_department_id: "",
    course_group_id: "",
    university_id: "",
    faculty_id: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: AcceptRequestData = {
      user_id: request.user_id,
      role: request.role
    };

    if (request.role === "student") {
      submitData.university_department_id = Number(formData.university_department_id);
      if (formData.course_group_id) {
        submitData.course_group_id = Number(formData.course_group_id);
      }
    } else {
      submitData.university_id = Number(formData.university_id);
      if (formData.faculty_id) {
        submitData.faculty_id = Number(formData.faculty_id);
      }
    }

    onSubmit(submitData);
  };

  return (
    <div className="modal-overlay">
      <Panel mode="secondary" className="modal-panel">
        <Container>
          <Flex justify="space-between" align="flex-start" style={{ marginBottom: 24 }}>
            <div>
              <Typography.Title variant="medium-strong" style={{ marginBottom: 8 }}>
                Принять заявку
              </Typography.Title>
              <Typography.Label>
                {request.first_name} {request.second_name} · {request.role}
              </Typography.Label>
            </div>
            <Button mode="tertiary" onClick={onClose} size="small">
              Закрыть
            </Button>
          </Flex>

          <form onSubmit={handleSubmit}>
            {request.role === "student" ? (
              <>
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                    ID отделения университета *
                  </Typography.Label>
                  <input
                    type="number"
                    value={formData.university_department_id}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      university_department_id: e.target.value 
                    }))}
                    required
                    placeholder="Введите ID отделения"
                    className="form-input"
                  />
                </div>
                <div className="form-field" style={{ marginBottom: 24 }}>
                  <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                    ID группы курса
                  </Typography.Label>
                  <input
                    type="number"
                    value={formData.course_group_id}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      course_group_id: e.target.value 
                    }))}
                    placeholder="Введите ID группы (опционально)"
                    className="form-input"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                    ID университета *
                  </Typography.Label>
                  <input
                    type="number"
                    value={formData.university_id}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      university_id: e.target.value 
                    }))}
                    required
                    placeholder="Введите ID университета"
                    className="form-input"
                  />
                </div>
                <div className="form-field" style={{ marginBottom: 24 }}>
                  <Typography.Label style={{ display: "block", marginBottom: 8 }}>
                    ID факультета
                  </Typography.Label>
                  <input
                    type="number"
                    value={formData.faculty_id}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      faculty_id: e.target.value 
                    }))}
                    placeholder="Введите ID факультета (опционально)"
                    className="form-input"
                  />
                </div>
              </>
            )}

            <Flex justify="end" gap={12}>
              <Button mode="tertiary" onClick={onClose} disabled={loading}>
                Отмена
              </Button>
              <Button mode="primary" type="submit" disabled={loading}>
                {loading ? "Принятие..." : "Принять заявку"}
              </Button>
            </Flex>
          </form>
        </Container>
      </Panel>
    </div>
  );
}