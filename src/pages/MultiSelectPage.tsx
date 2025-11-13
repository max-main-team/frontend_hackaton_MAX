// src/pages/SelectTestPage.tsx
import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Typography } from "@maxhub/max-ui";

export default function SelectTestPage(): JSX.Element {
  const navigate = useNavigate();

  const goStudent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("button clicked -> navigate to /student");
    navigate("/student", { replace: false });
  };

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title variant="large-strong" style={{ marginBottom: 12 }}>
        Простой тест перехода
      </Typography.Title>

      <Flex direction="column" align="stretch" style={{ gap: 12, maxWidth: 420 }}>
        <Button asChild>
          <button
            type="button"
            onClick={goStudent}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 16,
              textAlign: "left",
              display: "block",
            }}
          >
            Перейти как student
          </button>
        </Button>
      </Flex>
    </div>
  );
}
