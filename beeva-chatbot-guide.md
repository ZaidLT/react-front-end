# Beeva AI Chatbot - Integration Guide & Local Setup

## 📋 Overview

**Beeva** is the AI-powered chatbot integrated into the Eeva React Web application. It provides conversational assistance for family organization tasks, event creation, search, and general queries.

---

## 🏗️ Architecture

### High-Level Flow

```
User Input (Frontend)
    ↓
/beeva-chat page (React Component)
    ↓
askBeeva() service function
    ↓
POST /api/beeva/chat (Next.js API Route - Proxy)
    ↓
https://eeva-rag-develop.up.railway.app/v1/beeva/chat (Backend RAG Service)
    ↓
Response flows back through proxy
    ↓
UI displays answer with citations/actions
```

### Components

1. **Frontend Page**: `/src/app/beeva-chat/page.tsx`
2. **Service Layer**: `/src/services/beevaChat.ts`
3. **API Proxy**: `/src/app/api/beeva/chat/route.ts`
4. **Backend RAG Service**: Railway-hosted AI service

---

## 🔍 Detailed Integration

### 1. Frontend Component (`/src/app/beeva-chat/page.tsx`)

**Key Features:**
- Chat interface with message bubbles
- User input with send button
- Loading state with animated dots
- Authentication token resolution
- Debug mode for troubleshooting

**Authentication Token Resolution (Priority Order):**
1. Query parameter: `?token=xxx`
2. localStorage: `auth_token` (primary app token)
3. localStorage: `supabase_jwt` (legacy fallback)
4. Cookie: `auth_token`
5. Environment variable: `NEXT_PUBLIC_BEEVA_SUPABASE_JWT`

**Environment Variables:**
- `NEXT_PUBLIC_BEEVA_CHAT_ENABLED` - Enable/disable chat feature (default: enabled)
- `NEXT_PUBLIC_DEBUG_MODE` - Enable debug logging (default: false)
- `NEXT_PUBLIC_BEEVA_SUPABASE_JWT` - Fallback JWT token for testing

**Code Snippet - Message Submission:**
```typescript
const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const trimmed = input.trim();
  if (!trimmed) return;

  // Create user message
  const userMsg: ChatMessage = {
    id: `u-${Date.now()}`,
    role: "user",
    content: trimmed,
  };

  // Show loading state
  setMessages((prev) => [...prev, userMsg, { 
    id: typingId, 
    role: "assistant", 
    content: "typing", 
    loading: true 
  }]);

  // Get auth token
  const { token: jwt, source } = resolveAuthToken();
  
  // Call Beeva API
  const data = await askBeeva(trimmed, jwt);
  
  // Display response
  const answer = data?.answer || 'I had trouble processing that request.';
  setMessages((prev) => [...prev, { 
    id: `a-${Date.now()}`, 
    role: 'assistant', 
    content: answer 
  }]);
};
```

---

### 2. Service Layer (`/src/services/beevaChat.ts`)

**Purpose:** Handles API communication with the Beeva backend.

**Key Types:**

```typescript
export interface BeevaChatResponse {
  answer: string;                    // AI-generated response
  action?: BeevaChatAction;          // Optional action (search, event creation)
  citations?: BeevaCitation[];       // Source citations
  error?: boolean;                   // Error flag
  metaStatus?: number;               // HTTP status (debug)
  rawText?: string;                  // Raw response (debug)
}

export interface BeevaChatAction {
  type: 'search_results' | 'event_created' | 'general';
  results?: any[];                   // Search results
  eventId?: string;                  // Created event ID
  event?: Record<string, any>;       // Event data
}

export interface BeevaCitation {
  title: string;                     // Citation title
  type: string;                      // Citation type
  url?: string;                      // Citation URL
}
```

**Main Function:**

```typescript
export async function askBeeva(
  question: string, 
  jwtToken: string
): Promise<BeevaChatResponse> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const normalized = jwtToken?.startsWith('Bearer ') 
    ? jwtToken.slice(7) 
    : jwtToken;

  const res = await fetch('/api/beeva/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${normalized}`,
    },
    body: JSON.stringify({ question, timezone }),
  });

  const text = await res.text();
  let parsed = JSON.parse(text);

  return {
    ...parsed,
    metaStatus: res.status,
    rawText: text
  };
}
```

---

### 3. API Proxy (`/src/app/api/beeva/chat/route.ts`)

**Purpose:** Proxies requests to the Railway-hosted RAG service.

**Configuration:**
- **Upstream URL**: `https://eeva-rag-develop.up.railway.app/v1/beeva/chat`
- **Runtime**: Node.js
- **Dynamic**: Force dynamic (no caching)

**Key Features:**
- Transparent pass-through of request body
- Forwards Authorization header
- Streams response as-is
- Handles content-encoding properly
- Debug logging when enabled

**Code:**

```typescript
const UPSTREAM_URL = 'https://eeva-rag-develop.up.railway.app/v1/beeva/chat';

export async function POST(req: Request) {
  const bodyText = await req.text();

  const upstreamRes = await fetch(UPSTREAM_URL, {
    method: 'POST',
    headers: {
      'content-type': req.headers.get('content-type') ?? 'application/json',
      'accept': req.headers.get('accept') ?? 'application/json',
      ...(req.headers.get('authorization') 
        ? { authorization: req.headers.get('authorization')! } 
        : {}),
    },
    body: bodyText,
  });

  const bodyBuffer = await upstreamRes.arrayBuffer();

  return new Response(bodyBuffer, {
    status: upstreamRes.status,
    headers: upstreamRes.headers,
  });
}
```

---

## 🚀 Local Setup & Testing

### Prerequisites

1. **Node.js**: Version 18 or higher
2. **pnpm**: Version 8 or higher
3. **Authentication Token**: Valid JWT token from Eeva backend

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/eeva-ai/react-web.git
cd react-web

# Install dependencies
pnpm install
```

### Step 2: Configure Environment (Optional)

Create a `.env.local` file in the root directory:

```bash
# Enable debug mode to see detailed logs
NEXT_PUBLIC_DEBUG_MODE=true

# Enable/disable Beeva chat (default: enabled)
NEXT_PUBLIC_BEEVA_CHAT_ENABLED=true

# Optional: Fallback JWT token for testing without login
# NEXT_PUBLIC_BEEVA_SUPABASE_JWT=your_jwt_token_here
```

### Step 3: Start Development Server

```bash
# Start the dev server on port 3001
pnpm debug
```

The application will be available at: **http://localhost:3001**

### Step 4: Access Beeva Chat

Navigate to: **http://localhost:3001/beeva-chat**

---

## 🔐 Authentication for Testing

### Option 1: Login First (Recommended)

1. Navigate to `http://localhost:3001/login`
2. Login with your credentials
3. The app will store `auth_token` in localStorage
4. Navigate to `/beeva-chat` - it will automatically use the token

### Option 2: Use Query Parameter

If you have a JWT token, you can pass it directly:

```
http://localhost:3001/beeva-chat?token=YOUR_JWT_TOKEN_HERE
```

### Option 3: Set Environment Variable

Add to `.env.local`:

```bash
NEXT_PUBLIC_BEEVA_SUPABASE_JWT=your_jwt_token_here
```

### Option 4: Manual localStorage (Browser Console)

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
localStorage.setItem('auth_token', 'YOUR_JWT_TOKEN_HERE');
```
4. Refresh the page

---

## 🧪 Testing the Chatbot

### Test Queries

Try these sample queries to test functionality:

1. **General Questions:**
   - "What can you help me with?"
   - "Tell me about Eeva"

2. **Search Queries:**
   - "Find my tasks"
   - "Show me upcoming events"
   - "Search for documents"

3. **Event Creation:**
   - "Create an event for tomorrow at 3pm"
   - "Schedule a meeting next Monday"

4. **Task Management:**
   - "What are my incomplete tasks?"
   - "Show me completed tasks"

### Debug Mode

Enable debug mode to see detailed information:

1. Set `NEXT_PUBLIC_DEBUG_MODE=true` in `.env.local`
2. Restart the dev server
3. Open browser DevTools Console
4. You'll see logs like:
   - `[beeva-chat] token = present (localStorage)`
   - `[beeva-chat] askBeeva response { status: 200, ... }`
   - `[api/beeva/chat] upstream status 200`

### Debug Panel (UI)

When debug mode is enabled, a debug panel appears at the bottom of the chat showing:
- Token status (present/missing)
- Token source (query/localStorage/cookie/env)
- Last HTTP status
- Last response body
- Last error (if any)

---

## 🔧 Troubleshooting

### Issue: "I had trouble processing that request"

**Possible Causes:**
1. No authentication token
2. Invalid/expired token
3. Backend service is down
4. Network error

**Solutions:**
1. Enable debug mode to see detailed error
2. Check browser console for errors
3. Verify token is present: `localStorage.getItem('auth_token')`
4. Try logging in again
5. Check if backend is accessible: `https://eeva-rag-develop.up.railway.app/v1/beeva/chat`

### Issue: Chat is disabled ("Coming soon" message)

**Cause:** `NEXT_PUBLIC_BEEVA_CHAT_ENABLED` is set to `'false'`

**Solution:** Remove the env variable or set it to `'true'`

### Issue: No response from backend

**Possible Causes:**
1. Railway service is down
2. CORS issues
3. Network connectivity

**Solutions:**
1. Check Railway service status
2. Verify proxy is working: Check Network tab in DevTools
3. Look for CORS errors in console

### Issue: Token not found

**Solutions:**
1. Login first at `/login`
2. Use query parameter: `?token=xxx`
3. Set token manually in localStorage
4. Add fallback token to `.env.local`

---

## 📊 Backend Integration Details

### Request Format

**Endpoint:** `POST /api/beeva/chat`

**Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {jwt_token}
```

**Body:**
```json
{
  "question": "What are my tasks?",
  "timezone": "America/New_York"
}
```

### Response Format

**Success Response (200):**
```json
{
  "answer": "You have 3 incomplete tasks...",
  "action": {
    "type": "search_results",
    "results": [...]
  },
  "citations": [
    {
      "title": "Task: Buy groceries",
      "type": "task",
      "url": "/view-task/123"
    }
  ]
}
```

**Error Response:**
```json
{
  "answer": "I had trouble processing that request.",
  "error": true
}
```

---

## 🎨 UI Features

### Chat Interface
- Clean, modern design with message bubbles
- User messages: Blue background, right-aligned
- Assistant messages: Light background, left-aligned
- Loading indicator: Animated bouncing dots

### Input Bar
- Text input with placeholder
- Attach button (paperclip icon) - UI only
- Voice button (microphone icon) - UI only
- Send button (arrow icon) - functional

### Navigation
- Back button to return to home
- "Meet Beeva" header

---

## 📦 Dependencies

**Required Packages:**
- `next` (^15.3.2) - Framework
- `react` (^18.3.1) - UI library
- No additional AI-specific packages needed (uses native fetch)

**The chatbot uses:**
- Native `fetch` API for HTTP requests
- No external AI libraries (backend handles AI)
- Standard React hooks (useState, useEffect, useRef)

---

## 🔮 Future Enhancements

Based on the code structure, potential enhancements include:

1. **File Attachments**: Attach button is present but not functional
2. **Voice Input**: Microphone button is present but not functional
3. **Citations Display**: Backend returns citations but UI doesn't render them yet
4. **Action Handling**: Backend can return actions (event creation, search) but UI doesn't handle them yet
5. **Message Persistence**: Messages are lost on page refresh
6. **Typing Indicators**: More sophisticated loading states

---

## 📝 Summary

### To Run Locally:

```bash
# 1. Clone and install
git clone https://github.com/eeva-ai/react-web.git
cd react-web
pnpm install

# 2. (Optional) Create .env.local
echo "NEXT_PUBLIC_DEBUG_MODE=true" > .env.local

# 3. Start dev server
pnpm debug

# 4. Login first
# Open http://localhost:3001/login
# Login with your credentials

# 5. Access Beeva chat
# Open http://localhost:3001/beeva-chat
```

### Key Files to Know:

| File | Purpose |
|------|---------|
| `/src/app/beeva-chat/page.tsx` | Chat UI component |
| `/src/services/beevaChat.ts` | API service layer |
| `/src/app/api/beeva/chat/route.ts` | Proxy to backend |
| `.env.local` | Environment configuration |

### Authentication Required:

✅ **You MUST have a valid JWT token** to use the chatbot. Get one by:
1. Logging in through the app
2. Using `?token=xxx` query parameter
3. Setting it in localStorage
4. Adding to `.env.local` as fallback

---

*Last Updated: 2025-12-04*
