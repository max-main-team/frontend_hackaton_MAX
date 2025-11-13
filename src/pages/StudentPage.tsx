import "../css/AdminPage.css";
import { Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import { useMaxWebApp } from "../hooks/useMaxWebApp";


export default function StudentPage() {
  const { webAppData } = useMaxWebApp();
  const user = webAppData?.user ?? {};
  const name = user?.first_name ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}` : "Студент";

  return (
      <div style={{ marginBottom: 12 }}>
        <Flex align="center" gap={12}> 
          <Avatar.Container size={56} form="circle">
            <Avatar.Image src={user?.full_avatar_url ?? user?.avatar_url ?? ""} />
          </Avatar.Container>

          <div>
            <Typography.Title variant="large-strong">Привет, {name}!</Typography.Title>
            <Typography.Label>{user?.university ?? ""}</Typography.Label>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <Button>Мои курсы</Button>
          </div>
        </Flex>
      </div>
  );
}
