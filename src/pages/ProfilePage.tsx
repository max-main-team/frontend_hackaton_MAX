import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Panel, Flex, Avatar, Typography, Button } from "@maxhub/max-ui";
import { useMaxWebApp } from "../hooks/useMaxWebApp";
import api from "../services/api";
import "../css/ProfilePage.css"

export default function ProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const { webAppData } = useMaxWebApp();
  const webUser = webAppData?.user ?? null;

  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [photoLoaded, setPhotoLoaded] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<boolean>(false);

  function initials(name?: string | null) {
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  useEffect(() => {
    let mounted = true;

    async function loadProfileFromApi() {
      try {
        const res = await api.get("https://msokovykh.ru/user/me");
        const data = res?.data;
        const u = data?.user ?? null;

        if (!mounted) return;

        if (u) {
          const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username || null;
          setFullName(name);
          setAvatarUrl(u.avatar_url ?? u.photo_url ?? null);
          return;
        }
      } catch (e) {
        console.log("Fail post from /user/me ", e);
      }

      if (!mounted) return;
      const fallbackName = [webUser?.first_name, webUser?.last_name].filter(Boolean).join(" ").trim() || webUser?.username || null;
      setFullName(fallbackName);
      setAvatarUrl(webUser?.avatar_url ?? webUser?.photo_url ?? null);
    }

    loadProfileFromApi();
    return () => { mounted = false; };
  }, [webUser]);

  // NEW: preload avatarUrl — we only render Avatar.Image after it's fully loaded
  useEffect(() => {
    // reset status whenever avatarUrl changes
    setPhotoLoaded(false);
    setPhotoError(false);

    if (!avatarUrl) {
      // nothing to preload
      return;
    }

    let cancelled = false;
    const img = new Image();
    // try to allow CORS where possible (if backend provides proper headers)
    img.crossOrigin = "anonymous";
    img.src = avatarUrl;

    img.onload = () => {
      if (!cancelled) setPhotoLoaded(true);
    };
    img.onerror = () => {
      if (!cancelled) {
        console.warn("Profile avatar failed to load:", avatarUrl);
        setPhotoError(true);
        setPhotoLoaded(false);
      }
    };

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [avatarUrl]);

  function goToSelectProfile() {
    navigate("/select", { replace: true });
  }

  function goToApplicant() {
    navigate("/abiturient", { replace: true });
  }

  function goBack() {
    navigate(-1);
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      boxSizing: "border-box",
      background: "transparent",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)"
    }}>
      <Panel
        mode="secondary"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 0,
          padding: 20,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Flex direction="column" align="center" justify="start" style={{ width: "100%", gap: 12 }}>
          <div style={{ height: 18 }} />

          {/* Avatar: показываем пустое место, пока image не загружена.
              Если avatarUrl отсутствует или загрузка упала — показываем инициалы */}
          <Avatar.Container size={112} form="circle" className="profile-avatar">
            {avatarUrl ? (
              photoLoaded && !photoError ? (
                // показываем картинку только когда она предзагружена
                <Avatar.Image src={avatarUrl} className="profile-avatar__img" />
              ) : (
                // пустой блок — чтобы не показывать инициалы и не было мерцания
                <div className="profile-avatar__placeholder" />
              )
            ) : (
              // если вообще нет avatarUrl — показываем инициалы (fallback)
              <Avatar.Text>{initials(fullName ?? webUser?.username ?? null)}</Avatar.Text>
            )}
          </Avatar.Container>

          <Typography.Title variant="large-strong" style={{ margin: "6px 0 0 0", textAlign: "center" }}>
            {fullName ?? "Пользователь"}
          </Typography.Title>

          {webUser?.username && (
            <Typography.Label style={{ color: "var(--maxui-muted, #6b7280)", marginTop: 4 }}>
              @{webUser.username}
            </Typography.Label>
          )}

          <div style={{ height: 14 }} />

          <div style={{ width: "100%", maxWidth: 720, padding: "0 12px", boxSizing: "border-box" }}>
            <Flex gap={12} style={{ width: "100%" }}>
              <Button mode="secondary" appearance="neutral" stretched onClick={goBack}>
                Назад
              </Button>

              <Button mode="secondary" appearance="neutral" stretched onClick={goToSelectProfile}>
                Выбор профиля
              </Button>
            </Flex>

            <div style={{ height: 8 }} />

            <Button mode="primary" stretched onClick={goToApplicant}>
              Страница абитуриента
            </Button>
          </div>
        </Flex>

        <div style={{ flex: 1 }} />
      </Panel>
    </div>
  );
}
