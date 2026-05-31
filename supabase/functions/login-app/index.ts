function getDefaultPublishableKey() {
  const rawKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");

  if (!rawKeys) {
    return "";
  }

  try {
    const keys = JSON.parse(rawKeys) as Record<string, string>;
    return keys.default || Object.values(keys)[0] || "";
  } catch {
    return "";
  }
}

const supabaseUrl =
  Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("APP_SUPABASE_URL") ||
  "";

const supabaseKey =
  Deno.env.get("APP_SUPABASE_PUBLISHABLE_KEY") ||
  Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ||
  getDefaultPublishableKey() ||
  Deno.env.get("SUPABASE_ANON_KEY") ||
  Deno.env.get("APP_SUPABASE_ANON_KEY") ||
  "";

const appConfig = {
  supabaseUrl,
  supabaseKey,
  hasConfig: Boolean(supabaseUrl && supabaseKey),
};

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

const securityHeaders = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "content-security-policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://esm.sh;",
};

function renderHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Supabase Login Audit</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f7f4;
      --surface: #ffffff;
      --surface-2: #edf4f1;
      --ink: #18211f;
      --muted: #60706b;
      --line: #d8e1dd;
      --accent: #18735f;
      --accent-strong: #0e5f4d;
      --blue: #315f9d;
      --amber: #a45f08;
      --danger: #a33a35;
      --shadow: 0 18px 48px rgba(32, 45, 42, 0.12);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background:
        linear-gradient(180deg, rgba(246, 247, 244, 0.92), rgba(237, 244, 241, 0.9)),
        radial-gradient(circle at top left, rgba(24, 115, 95, 0.14), transparent 34%),
        var(--bg);
      color: var(--ink);
    }

    button,
    input {
      font: inherit;
    }

    button {
      cursor: pointer;
    }

    .shell {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 26px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .mark {
      display: grid;
      width: 42px;
      height: 42px;
      place-items: center;
      border-radius: 8px;
      background: #163d35;
      color: white;
      font-weight: 800;
    }

    .brand h1 {
      margin: 0;
      font-size: clamp(1.15rem, 1rem + 0.8vw, 1.65rem);
      letter-spacing: 0;
      line-height: 1.1;
    }

    .brand p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 0.94rem;
    }

    .user-strip {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      min-width: 0;
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--line);
      background: var(--surface-2);
      object-fit: cover;
      flex: 0 0 auto;
    }

    .user-text {
      min-width: 0;
      text-align: right;
    }

    .user-text strong,
    .user-text span {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 260px;
    }

    .user-text strong {
      font-size: 0.95rem;
    }

    .user-text span {
      color: var(--muted);
      font-size: 0.83rem;
    }

    .main {
      display: grid;
      grid-template-columns: 360px minmax(0, 1fr);
      gap: 18px;
      align-items: start;
    }

    .panel {
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }

    .login-panel {
      padding: 26px;
    }

    .login-panel h2,
    .events-panel h2 {
      margin: 0;
      font-size: 1.1rem;
      letter-spacing: 0;
    }

    .login-panel p {
      margin: 10px 0 22px;
      color: var(--muted);
      line-height: 1.5;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-top: 18px;
    }

    .stat {
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface-2);
      min-height: 82px;
    }

    .stat span {
      display: block;
      color: var(--muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat strong {
      display: block;
      margin-top: 8px;
      font-size: 1.35rem;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 44px;
      width: 100%;
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 0 16px;
      color: #fff;
      background: var(--accent);
      font-weight: 700;
      transition: background 140ms ease, transform 140ms ease, border-color 140ms ease;
    }

    .button:hover {
      background: var(--accent-strong);
      transform: translateY(-1px);
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
      transform: none;
    }

    .button.secondary {
      width: auto;
      color: var(--ink);
      background: var(--surface);
      border-color: var(--line);
      min-height: 38px;
      font-size: 0.9rem;
    }

    .button.secondary:hover {
      background: var(--surface-2);
    }

    .google-icon {
      width: 20px;
      height: 20px;
      flex: 0 0 auto;
    }

    .events-panel {
      overflow: hidden;
    }

    .events-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 20px;
      border-bottom: 1px solid var(--line);
    }

    .events-header p {
      margin: 5px 0 0;
      color: var(--muted);
      font-size: 0.9rem;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .search {
      min-width: 220px;
      height: 38px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0 12px;
      background: #fff;
      color: var(--ink);
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 680px;
    }

    th,
    td {
      padding: 14px 18px;
      text-align: left;
      border-bottom: 1px solid var(--line);
      vertical-align: middle;
    }

    th {
      color: var(--muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #fbfcfb;
    }

    td {
      font-size: 0.94rem;
    }

    tr:last-child td {
      border-bottom: 0;
    }

    .person {
      display: flex;
      align-items: center;
      gap: 11px;
      min-width: 0;
    }

    .person .avatar {
      width: 34px;
      height: 34px;
    }

    .person strong,
    .person span {
      display: block;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .person span {
      color: var(--muted);
      font-size: 0.83rem;
      margin-top: 2px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      background: #e7f3ef;
      color: var(--accent-strong);
      font-weight: 700;
      font-size: 0.8rem;
    }

    .notice {
      display: none;
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--muted);
      line-height: 1.45;
      font-size: 0.9rem;
    }

    .notice.error {
      color: var(--danger);
      border-color: rgba(163, 58, 53, 0.35);
      background: #fff5f4;
    }

    .empty {
      padding: 34px 20px;
      text-align: center;
      color: var(--muted);
    }

    .hidden {
      display: none !important;
    }

    @media (max-width: 840px) {
      .shell {
        width: min(100% - 22px, 680px);
        padding: 18px 0;
      }

      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .user-strip {
        width: 100%;
        justify-content: space-between;
      }

      .user-text {
        text-align: left;
      }

      .main {
        grid-template-columns: 1fr;
      }

      .events-header {
        align-items: stretch;
        flex-direction: column;
      }

      .toolbar {
        justify-content: stretch;
      }

      .search,
      .button.secondary {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <div class="mark">SL</div>
        <div>
          <h1>Supabase Login Audit</h1>
          <p>Google Auth, RLS, RPC, Edge Function, and Postgres in one small app.</p>
        </div>
      </div>

      <div id="userStrip" class="user-strip hidden">
        <img id="topAvatar" class="avatar" alt="" />
        <div class="user-text">
          <strong id="topName"></strong>
          <span id="topEmail"></span>
        </div>
        <button id="signOutButton" class="button secondary" type="button">Sign out</button>
      </div>
    </header>

    <main class="main">
      <section class="panel login-panel">
        <h2 id="authTitle">Sign in</h2>
        <p id="authCopy">Use Google to create a Supabase session. After login, the app records the event through a Postgres RPC function.</p>

        <button id="signInButton" class="button" type="button">
          <svg class="google-icon" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 16.2 4 9.5 8.5 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 39.4 16.1 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div id="message" class="notice"></div>

        <div class="stats">
          <div class="stat">
            <span>Total logins</span>
            <strong id="totalLogins">0</strong>
          </div>
          <div class="stat">
            <span>Unique users</span>
            <strong id="uniqueUsers">0</strong>
          </div>
        </div>
      </section>

      <section class="panel events-panel">
        <div class="events-header">
          <div>
            <h2>Login history</h2>
            <p>Latest Supabase Auth login events recorded by RPC.</p>
          </div>
          <div class="toolbar">
            <input id="searchInput" class="search" type="search" placeholder="Search email or name" />
            <button id="refreshButton" class="button secondary" type="button">Refresh</button>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Login time</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody id="eventsBody"></tbody>
          </table>
        </div>
        <div id="emptyState" class="empty">Sign in to load login history.</div>
      </section>
    </main>
  </div>

  <script type="module">
    import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

    const APP_CONFIG = ${JSON.stringify(appConfig)};

    const signInButton = document.getElementById("signInButton");
    const signOutButton = document.getElementById("signOutButton");
    const refreshButton = document.getElementById("refreshButton");
    const searchInput = document.getElementById("searchInput");
    const userStrip = document.getElementById("userStrip");
    const topAvatar = document.getElementById("topAvatar");
    const topName = document.getElementById("topName");
    const topEmail = document.getElementById("topEmail");
    const authTitle = document.getElementById("authTitle");
    const authCopy = document.getElementById("authCopy");
    const eventsBody = document.getElementById("eventsBody");
    const emptyState = document.getElementById("emptyState");
    const totalLogins = document.getElementById("totalLogins");
    const uniqueUsers = document.getElementById("uniqueUsers");
    const message = document.getElementById("message");

    let supabase = null;
    let currentSession = null;
    let events = [];

    function showMessage(text, type = "info") {
      message.textContent = text;
      message.className = "notice" + (type === "error" ? " error" : "");
      message.style.display = text ? "block" : "none";
    }

    function formatDate(value) {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    }

    function getRedirectUrl() {
      return window.location.origin + window.location.pathname;
    }

    function getDisplayName(user) {
      return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Signed-in user";
    }

    function getAvatar(user) {
      return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
    }

    function avatarFallback(nameOrEmail) {
      const value = (nameOrEmail || "?").trim().slice(0, 1).toUpperCase();
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="%23edf4f1"/><text x="40" y="48" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="%2318735f">' + value + '</text></svg>';
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }

    function setLoggedOut() {
      currentSession = null;
      userStrip.classList.add("hidden");
      signInButton.classList.remove("hidden");
      authTitle.textContent = "Sign in";
      authCopy.textContent = "Use Google to create a Supabase session. After login, the app records the event through a Postgres RPC function.";
      emptyState.textContent = "Sign in to load login history.";
      eventsBody.innerHTML = "";
      events = [];
      renderStats();
    }

    function setLoggedIn(session) {
      currentSession = session;
      const user = session.user;
      const displayName = getDisplayName(user);
      const avatar = getAvatar(user) || avatarFallback(displayName);

      topName.textContent = displayName;
      topEmail.textContent = user.email || "";
      topAvatar.src = avatar;
      userStrip.classList.remove("hidden");
      signInButton.classList.add("hidden");
      authTitle.textContent = "Authenticated";
      authCopy.textContent = "Your login was recorded through RPC. The table shows stored events protected by RLS.";
    }

    function renderStats() {
      totalLogins.textContent = String(events.length);
      uniqueUsers.textContent = String(new Set(events.map((event) => event.user_id)).size);
    }

    function renderEvents() {
      const query = searchInput.value.trim().toLowerCase();
      const visibleEvents = query
        ? events.filter((event) => {
            const fullName = (event.full_name || "").toLowerCase();
            const email = (event.email || "").toLowerCase();
            return fullName.includes(query) || email.includes(query);
          })
        : events;

      eventsBody.innerHTML = "";

      if (!currentSession) {
        emptyState.textContent = "Sign in to load login history.";
        emptyState.classList.remove("hidden");
        renderStats();
        return;
      }

      if (visibleEvents.length === 0) {
        emptyState.textContent = query ? "No login events match this search." : "No login events recorded yet.";
        emptyState.classList.remove("hidden");
        renderStats();
        return;
      }

      emptyState.classList.add("hidden");

      for (const event of visibleEvents) {
        const name = event.full_name || event.email || "Unknown user";
        const row = document.createElement("tr");

        row.innerHTML = \`
          <td>
            <div class="person">
              <img class="avatar" alt="" src="\${event.avatar_url || avatarFallback(name)}" />
              <div>
                <strong>\${escapeHtml(name)}</strong>
                <span>\${escapeHtml(event.email || "No email")}</span>
              </div>
            </div>
          </td>
          <td><span class="badge">Recorded</span></td>
          <td>\${formatDate(event.logged_in_at)}</td>
          <td><code>\${escapeHtml(String(event.user_id).slice(0, 8))}...</code></td>
        \`;

        eventsBody.appendChild(row);
      }

      renderStats();
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    async function recordLoginOnce(session) {
      const sessionKey = "login-recorded-" + session.user.id + "-" + session.access_token.slice(-16);

      if (sessionStorage.getItem(sessionKey)) {
        return;
      }

      const { error } = await supabase.rpc("record_login_event");

      if (error) {
        throw error;
      }

      sessionStorage.setItem(sessionKey, "true");
    }

    async function loadEvents() {
      refreshButton.disabled = true;

      const { data, error } = await supabase
        .from("login_events")
        .select("id, user_id, email, full_name, avatar_url, logged_in_at")
        .order("logged_in_at", { ascending: false })
        .limit(100);

      refreshButton.disabled = false;

      if (error) {
        showMessage(error.message, "error");
        return;
      }

      events = data || [];
      renderEvents();
    }

    async function handleSession(session, shouldRecord = false) {
      if (!session) {
        setLoggedOut();
        return;
      }

      setLoggedIn(session);

      try {
        if (shouldRecord) {
          await recordLoginOnce(session);
        }
        await loadEvents();
        showMessage("");
      } catch (error) {
        showMessage(error.message || "Something went wrong while loading login events.", "error");
      }
    }

    async function signIn() {
      signInButton.disabled = true;
      showMessage("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        signInButton.disabled = false;
        showMessage(error.message, "error");
      }
    }

    async function signOut() {
      await supabase.auth.signOut();
      setLoggedOut();
      showMessage("");
    }

    async function init() {
      if (!APP_CONFIG.hasConfig) {
        signInButton.disabled = true;
        refreshButton.disabled = true;
        showMessage("Missing Supabase URL or publishable key. Hosted Edge Functions receive default Supabase env values automatically; local testing can use APP_SUPABASE_URL and APP_SUPABASE_PUBLISHABLE_KEY.", "error");
        return;
      }

      supabase = createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });

      signInButton.addEventListener("click", signIn);
      signOutButton.addEventListener("click", signOut);
      refreshButton.addEventListener("click", loadEvents);
      searchInput.addEventListener("input", renderEvents);

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        showMessage(error.message, "error");
      }

      await handleSession(data.session, Boolean(data.session));

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN") {
          await handleSession(session, true);
        }

        if (event === "SIGNED_OUT") {
          setLoggedOut();
        }
      });
    }

    init();
  </script>
</body>
</html>`;
}

Deno.serve((req: Request) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
      },
    });
  }

  if (url.pathname.endsWith("/health")) {
    return Response.json({
      ok: true,
      hasConfig: appConfig.hasConfig,
      note: "Supabase Edge Function is deployed. HTML is served from static hosting because hosted Supabase Edge Functions rewrite text/html to text/plain.",
    }, {
      headers: {
        ...corsHeaders,
      },
    });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        allow: "GET, OPTIONS",
        ...corsHeaders,
        ...securityHeaders,
      },
    });
  }

  return Response.json({
    ok: true,
    function: "login-app",
    health: `${url.origin}${url.pathname.replace(/\/$/, "")}/health`,
    note: "Supabase hosted Edge Functions do not render HTML responses. Use docs/index.html for the working frontend, and keep this function as the Edge Function part of the assessment.",
  }, {
    headers: {
      ...corsHeaders,
      ...securityHeaders,
    },
  });
});
