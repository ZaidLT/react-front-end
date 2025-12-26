"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "../../hooks/useRouterWithPersistentParams";
import { useLanguageContext } from "../../context/LanguageContext";
import { useIsMobileApp } from "../../hooks/useMobileDetection";
import NavHeader from "../../components/NavHeader";
import CustomText from "../../components/CustomText";
import Icon from "../../components/Icon";
import { Colors, Typography } from "../../styles";
import { askBeeva } from "../../services/beevaChat";
import { useSearchParams } from "next/navigation";

interface ChatMessage {
  id: string;
  role: "assistant" | "user" | "status";
  content: string;
  loading?: boolean;
}

const initialMessages = (welcome: string): ChatMessage[] => [
  {
    id: "m1",
    role: "assistant",
    content: welcome,
  },
];

const BouncingDots: React.FC = () => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: 16 }}>
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: .5 } 40% { transform: scale(1); opacity: 1 } }
        .dot { width: 6px; height: 6px; background: ${Colors.PRIMARY_DARKER_BLUE}; border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both; }
        .dot:nth-of-type(1) { animation-delay: -0.32s; }
        .dot:nth-of-type(2) { animation-delay: -0.16s; }
      `}</style>
    </div>
  );
};

const ChatPage: React.FC = () => {
  const router = useRouter();
  const { i18n } = useLanguageContext();
  const isMobileApp = useIsMobileApp();
  const searchParams = useSearchParams();

  // Local state
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialMessages(i18n.t("AlwaysReadyToChatAndHelpSolveYourProblems"))
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Debug controls (only logs when NEXT_PUBLIC_DEBUG_MODE === 'true')
  const DEBUG = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
  const dlog = (...args: any[]) => { if (DEBUG) console.log('[beeva-chat]', ...args); };
  const BEEVA_ENABLED = process.env.NEXT_PUBLIC_BEEVA_CHAT_ENABLED !== 'false';

  const [debugInfo, setDebugInfo] = useState<{ hasToken: boolean; tokenSource: 'query' | 'localStorage' | 'env' | 'cookie' | 'none'; lastStatus?: number; lastBody?: any; lastAnswer?: string; lastError?: any }>({ hasToken: false, tokenSource: 'none' });


  // Token resolver: prefer app auth token, then fallbacks (query, cookie, supabase_jwt, env)
  const resolveAuthToken = (): { token: string | null; source: 'query' | 'localStorage' | 'cookie' | 'env' | 'none' } => {
    try {
      const fromQuery = searchParams?.get('token');
      if (fromQuery) return { token: fromQuery, source: 'query' };

      if (typeof window !== 'undefined') {
        // Primary app token
        const fromLsAuth = localStorage.getItem('auth_token');
        if (fromLsAuth) return { token: fromLsAuth, source: 'localStorage' };

        // Legacy/supabase fallback
        const fromSupabase = localStorage.getItem('supabase_jwt');
        if (fromSupabase) return { token: fromSupabase, source: 'localStorage' };

        // Cookie fallback
        const cookie = document.cookie.split('; ').find(r => r.startsWith('auth_token='));
        if (cookie) return { token: cookie.split('=')[1], source: 'cookie' };
      }

      const fromEnv = process.env.NEXT_PUBLIC_BEEVA_SUPABASE_JWT;
      if (fromEnv) return { token: fromEnv, source: 'env' };

      return { token: null, source: 'none' };
    } catch {
      return { token: null, source: 'none' };
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  // Submit handler -> calls Beeva Chat API
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setInput("");
    const typingId = `t-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: typingId, role: "assistant", content: "typing", loading: true }]);

    const { token: jwt, source } = resolveAuthToken();
    if (!jwt) {
      if (DEBUG) dlog('No auth token found. Provide ?token=... or ensure auth context has stored localStorage.auth_token', { source });
      setDebugInfo({ hasToken: false, tokenSource: source });
      setMessages((prev) => prev.filter((m) => m.id !== typingId).concat({ id: `a-${Date.now()}`, role: 'assistant', content: 'I had trouble processing that request. Please try again.', }));
      return;
    }

    try {
      const data = await askBeeva(trimmed, jwt);
      if (DEBUG) dlog('askBeeva response', { status: data?.metaStatus, raw: data?.rawText });
      setDebugInfo({ hasToken: true, tokenSource: source, lastStatus: data?.metaStatus, lastBody: data?.rawText, lastAnswer: data?.answer });
      const answer = data?.answer || 'I had trouble processing that request. Please try again.';
      setMessages((prev) => prev.filter((m) => m.id !== typingId).concat({ id: `a-${Date.now()}`, role: 'assistant', content: answer }));
    } catch (err) {
      if (DEBUG) dlog('askBeeva error', err);
      setDebugInfo({ hasToken: true, tokenSource: source, lastError: String(err) });
      setMessages((prev) => prev.filter((m) => m.id !== typingId).concat({ id: `a-${Date.now()}`, role: 'assistant', content: 'I had trouble processing that request. Please try again.' }));
    }
  };

  // Styles
  const styles: Record<string, React.CSSProperties> = useMemo(
    () => ({
      page: { backgroundColor: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" },
      container: {
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: isMobileApp ? "16px" : "20px",
        boxSizing: "border-box",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      },
      frame: {
        width: "100%",
        height: "calc(100vh - 120px)",
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${Colors.COSMIC}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      },
      headerStrip: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
        padding: "12px 16px",
        borderBottom: `1px solid ${Colors.COSMIC}`,
      },
      headerLogo: { display: "flex", alignItems: "center", gap: 8 },
      headerTitle: {
        fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
        fontWeight: 600,
        fontSize: 14,
        color: Colors.BLUE,
      },
      messagesArea: {
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        background: Colors.LIGHT_GREY_BACKGROUND,
      },
      msgRow: {
        display: "flex",
        marginBottom: 12,
      },
      bubbleAssistant: {
        maxWidth: "75%",
        padding: "10px 12px",
        borderRadius: 14,
        background: "#F7F9FF",
        color: Colors.MIDNIGHT,
        border: `1px solid ${Colors.COSMIC}`,
        fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
        fontSize: 14,
        lineHeight: "20px",
        whiteSpace: "pre-wrap",
      },
      bubbleUser: {
        maxWidth: "75%",
        padding: "10px 12px",
        borderRadius: 14,
        background: Colors.PRIMARY_ELECTRIC_BLUE,
        color: Colors.WHITE,
        fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
        fontSize: 14,
        lineHeight: "20px",
        whiteSpace: "pre-wrap",
      },
      inputBar: {
        borderTop: `1px solid ${Colors.COSMIC}`,
        padding: "12px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
      },
      attachBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        background: Colors.LIGHT_GREY,
        border: `1px dashed ${Colors.PRIMARY_DARKER_BLUE}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      },
      inputWrap: { flex: 1, position: "relative" },
      input: {
        width: "100%",
        height: 44,
        borderRadius: 999,
        border: `1px solid ${Colors.COSMIC}`,
        background: Colors.WHITE_LILAC,
        padding: "0 88px 0 14px",
        outline: "none",
        fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
        fontSize: 16,
        color: Colors.MIDNIGHT,
      },
      rightActions: {
        position: "absolute",
        right: 6,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 6,
      },
      circleBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        background: Colors.WHITE,
        border: `1px solid ${Colors.COSMIC}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      },
    }),
    [isMobileApp]
  );

  return (
    <div style={styles.page}>
      {/* Global Nav Header */}
      <div style={{ width: "100%" }}>
        <NavHeader
          headerText={i18n.t("MeetBeeva")}
          left={{ goBack: true, onPress: () => router.push("/home") }}
        />
      </div>

      {/* Main container */}
      <div style={styles.container}>
        <div style={styles.frame}>
          {/* Local header strip with logo/title to match MVP vibe (optional) */}
          <div style={styles.headerStrip}>
            <div style={styles.headerLogo}>
              <Icon name="beeva" width={24} height={32} />
              <CustomText style={styles.headerTitle}>beeva</CustomText>
            </div>
          </div>

          {/* Messages area */}

              {DEBUG && (
                <div style={{ borderTop: `1px dashed ${Colors.COSMIC}`, padding: '8px 12px', fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR, fontSize: 12, color: Colors.MIDNIGHT }}>
                  <div>DEBUG: token = {debugInfo.hasToken ? `present (${debugInfo.tokenSource})` : 'missing'}</div>
                  {typeof debugInfo.lastStatus !== 'undefined' && (
                    <div>status = {String(debugInfo.lastStatus)}</div>
                  )}
                  {debugInfo.lastBody && (
                    <div>
                      <div>body:</div>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 120, overflow: 'auto', background: '#fafafa', border: `1px solid ${Colors.COSMIC}`, padding: 6 }}>
                        {String(debugInfo.lastBody).slice(0, 2000)}
                      </pre>
                    </div>
                  )}
                  {debugInfo.lastError && (
                    <div style={{ color: 'red' }}>error = {String(debugInfo.lastError)}</div>
                  )}
                </div>
              )}

          {BEEVA_ENABLED ? (
            <div ref={scrollRef} style={styles.messagesArea}>
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} style={{ ...styles.msgRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                    <div style={isUser ? styles.bubbleUser : styles.bubbleAssistant}>
                      {m.loading ? <BouncingDots /> : m.content}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.messagesArea}>
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <CustomText style={{ fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD, fontSize: 16, color: Colors.MIDNIGHT }}>Coming soon</CustomText>
                <CustomText style={{ fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR, fontSize: 14, color: Colors.BLUE, textAlign: 'center', maxWidth: 420 }}>Beeva chat is not available yet.</CustomText>
              </div>
            </div>
          )}

          {/* Input bar */}
          {BEEVA_ENABLED && (
            <form onSubmit={onSubmit} style={styles.inputBar}>
              <button type="button" style={styles.attachBtn} aria-label="Attach">
                {/* Paperclip */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Colors.PRIMARY_DARKER_BLUE} strokeWidth="2">
                  <path d="M21 7l-9.5 9.5a4 4 0 1 1-5.657-5.657L14 3" />
                  <path d="M17 7l-7.5 7.5a1 1 0 0 1-1.414-1.414L15 5" />
                </svg>
              </button>

              <div style={styles.inputWrap}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={i18n.t("WhatsOnYourMind")}
                  style={styles.input as React.CSSProperties}
                />
                <div style={styles.rightActions}>
                  <button type="button" style={styles.circleBtn} aria-label="Voice">
                    {/* Mic */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={Colors.PRIMARY_DARKER_BLUE} strokeWidth="2">
                      <rect x="9" y="2" width="6" height="12" rx="3" />
                      <path d="M12 19v3" />
                      <path d="M8 13a4 4 0 0 0 8 0" />
                      <path d="M12 22a7 7 0 0 0 7-7" />
                      <path d="M5 15a7 7 0 0 0 7 7" />
                    </svg>
                  </button>
                  <button type="submit" style={{ ...styles.circleBtn, background: Colors.PRIMARY_ELECTRIC_BLUE, border: `1px solid ${Colors.PRIMARY_ELECTRIC_BLUE}` }} aria-label="Send">
                    {/* Send */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={Colors.WHITE} strokeWidth="2">
                      <path d="M22 2L11 13" />
                      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

