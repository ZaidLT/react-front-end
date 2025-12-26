"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "../../hooks/useRouterWithPersistentParams";
import { useAuth } from "../../context/AuthContext";
import { useLanguageContext } from "../../context/LanguageContext";
import { useIsMobileApp } from "../../hooks/useMobileDetection";
import NavHeader from "../../components/NavHeader";
import { Colors } from "../../styles";

const SupportPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { i18n } = useLanguageContext();
  const isMobileApp = useIsMobileApp();

  // Build the eeva Typeform URL with hidden fields (user + device context)
  const eevaUrl = useMemo(() => {
    const base =
      "https://eeva-ai.typeform.com/to/rDwOLFgD?typeform-source=eeva.atlassian.net";
    const userId = encodeURIComponent(user?.id || "");
    const email = encodeURIComponent(user?.email || "");
    const appVersion = encodeURIComponent(
      process.env.NEXT_PUBLIC_APP_VERSION || "web"
    );
    // Best-effort device/OS info from browser
    const deviceModel = encodeURIComponent(
      (navigator as any).userAgentData?.platform || navigator.platform || "web"
    );
    const osVersion = encodeURIComponent(navigator.userAgent || "");
    return `${base}#user_id=${userId}&email=${email}&app_version=${appVersion}&device_model=${deviceModel}&os_version=${osVersion}`;
  }, [user]);

  // Listen for Typeform submission events to navigate back to Home
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Only handle messages from Typeform
      if (!event.origin) return;
      let host = "";
      try {
        host = new URL(event.origin).hostname;
      } catch {}
      if (!/typeform\.com$/.test(host)) return;

      const data: any = event.data;
      const eventType =
        typeof data === "string"
          ? data
          : data?.type || data?.event || data?.eventName;
      if (
        eventType === "form-submit" ||
        eventType === "form:submit" ||
        eventType === "form_submit"
      ) {
        router.push("/home", { scroll: false });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
      {/* Top Navigation - consistent with other pages */}
      <div style={{ width: "100%" }}>
        <NavHeader
          headerText={i18n.t("Support")}
          left={{ goBack: true, onPress: () => router.push("/home") }}
        />
      </div>

      {/* Main content container with max width and padding consistent with other pages */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobileApp ? "16px" : "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "calc(100vh - 120px)",
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${Colors.COSMIC}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            background: "#fff",
          }}
        >
          <iframe
            src={eevaUrl}
            title="eeva-support-typeform"
            allow="clipboard-write; fullscreen; geolocation; camera; microphone"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SupportPage;

