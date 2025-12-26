export type BeevaChatActionType = 'search_results' | 'event_created' | 'general';

export interface BeevaChatAction {
  type: BeevaChatActionType;
  results?: any[];
  eventId?: string;
  event?: Record<string, any>;
}

export interface BeevaCitation {
  title: string;
  type: string;
  url?: string;
}

export interface BeevaChatResponse {
  answer: string;
  action?: BeevaChatAction;
  citations?: BeevaCitation[];
  error?: boolean;
  // debug/meta fields (not from upstream contract, used only in UI when DEBUG mode)
  metaStatus?: number;
  rawText?: string;
}

const BEEVA_CHAT_API = '/api/beeva/chat';

export async function askBeeva(question: string, jwtToken: string): Promise<BeevaChatResponse> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const normalized = jwtToken?.startsWith('Bearer ') ? jwtToken.slice(7) : jwtToken;

  const res = await fetch(BEEVA_CHAT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${normalized}`,
    },
    body: JSON.stringify({ question, timezone }),
  });

  // Read raw text first to safely inspect in DEBUG mode
  const text = await res.text();

  let parsed: BeevaChatResponse | undefined;
  try {
    parsed = text ? (JSON.parse(text) as BeevaChatResponse) : undefined;
  } catch {
    parsed = undefined;
  }

  const base: BeevaChatResponse = parsed ?? { answer: 'I had trouble processing that request. Please try again.', error: true };

  if (!res.ok) {
    return { ...base, error: true, metaStatus: res.status, rawText: text };
  }

  return { ...base, metaStatus: res.status, rawText: text };
}

