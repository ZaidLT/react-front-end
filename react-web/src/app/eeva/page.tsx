"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "../../hooks/useRouterWithPersistentParams";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../styles";

/**
 * Dedicated route for the Eeva Typeform flow on mobile.
 * - Avoids body/html overflow mutations that can trigger native header auto-hide in WKWebView
 * - Keeps the experience in-app (WebView) and lets us return the user to the same scroll position on /home
 */
const EevaPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const buildEevaTypeformUrl = useCallback((): string => {
    const base =
      "https://eeva-ai.typeform.com/to/rDwOLFgD?typeform-source=eeva.atlassian.net";
    const userId = encodeURIComponent(user?.id || "");
    const email = encodeURIComponent(user?.email || "");
    const appVersion = encodeURIComponent(
      process.env.NEXT_PUBLIC_APP_VERSION || "web"
    );
    // Best-effort device/OS info from browser
    const deviceModel = encodeURIComponent(
      (navigator as any).userAgentData?.platform || (navigator as any).platform || "web"
    );
    const osVersion = encodeURIComponent(navigator.userAgent || "");
    return `${base}#user_id=${userId}&email=${email}&app_version=${appVersion}&device_model=${deviceModel}&os_version=${osVersion}`;
  }, [user]);

  const eevaUrl = useMemo(() => buildEevaTypeformUrl(), [buildEevaTypeformUrl]);

  const handleClose = useCallback(() => {
    // Simply go back to the previous route (/home). Home page restores scroll from sessionStorage.
    router.back();
  }, [router]);

  // Listen for Typeform submission events and close automatically
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      try {
        if (!event.origin) return;
        const host = new URL(event.origin).hostname;
        if (!/typeform\.com$/.test(host)) return;
        const data: any = event.data;
        const eventType =
          typeof data === "string" ? data : data?.type || data?.event || data?.eventName;
        if (
          eventType === "form-submit" ||
          eventType === "form:submit" ||
          eventType === "form_submit"
        ) {
          handleClose();
        }
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [handleClose]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
      }}
    >
      <div
        style={{
          width: "90vw",
          height: "90vh",
          maxWidth: 1100,
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            borderBottom: `1px solid ${Colors.COSMIC}`,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 16, color: "#000", fontWeight: 500 }}>eeva</div>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9AA3B2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <iframe
          src={eevaUrl}
          title="eeva-typeform"
          allow="clipboard-write; fullscreen; geolocation; camera; microphone"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            flex: 1,
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

export default EevaPage;

