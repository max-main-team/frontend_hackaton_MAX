import { Container, Panel, Flex, Typography, Button } from "@maxhub/max-ui";
import { useNavigate } from "react-router-dom";
import "../css/ComingSoonPage.css";
import type { JSX } from "react";


export default function ComingSoonPage(): JSX.Element {
const navigate = useNavigate();
return (
<div className="cs-root">
<Container className="cs-container">
<Panel mode="secondary" className="cs-card" aria-live="polite">
<Flex direction="column" align="center" justify="center" style={{ gap: 18 }}>
<div className="cs-illustration" aria-hidden />


<div style={{ textAlign: "center" }}>
<Typography.Title variant="large-strong" className="cs-title">
Функционал в стадии разработки
</Typography.Title>


<Typography.Label className="cs-subtitle">
Эта страница пока находится в разработке. Мы работаем над новым функционалом — скоро всё будет готово.
</Typography.Label>
</div>


<div className="cs-actions">
<Button mode="tertiary" onClick={() => navigate(-1)}>Назад</Button>
<Button mode="primary" onClick={() => window.location.reload()}>Обновить</Button>
</div>


<Typography.Label className="cs-hint">
Хотите ускорить релиз? Напишите в техподдержку — пометим в приоритет.
</Typography.Label>
</Flex>
</Panel>
</Container>
</div>
);
}