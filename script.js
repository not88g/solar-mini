// Init
const tg = window.Telegram.WebApp; tg.expand();
const SUPABASE_URL = "https://qntplsebbronfdwzwetc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudHBsc2ViYnJvbmZkd3p3ZXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzI0NzcsImV4cCI6MjA3NDY0ODQ3N30.MET22TTJ8X4sep-Vz04dUzoiBe4Rh7JTBkyPPu-I1cg";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elements
const onboarding = document.getElementById("onboarding");
const obName = document.getElementById("obName");
const obFile = document.getElementById("obFile");
const obContinue = document.getElementById("obContinue");
const obClose = document.getElementById("obClose");

const homeScreen = document.getElementById("homeScreen");
const searchPanel = document.getElementById("searchPanel");
const profilePanel = document.getElementById("profilePanel");
const aboutPanel = document.getElementById("aboutPanel");

const chatsBtn = document.getElementById("chatsBtn");
const searchBtn = document.getElementById("searchBtn");
const profileBtn = document.getElementById("profileBtn");

const savedCard = document.getElementById("savedCard");
const chatScreen = document.getElementById("chatScreen");
const backBtn = document.getElementById("backBtn");
const chatMessages = document.getElementById("chatMessages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const searchBack = document.getElementById("searchBack");

const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");
const openAbout = document.getElementById("openAbout");
const aboutBack = document.getElementById("aboutBack");

// State
const TG_USER = tg.initDataUnsafe?.user || {};
const localProfileKey = "solar.profile";

/* ---------- Onboarding ---------- */
function maybeShowOnboarding() {
  const stored = localStorage.getItem(localProfileKey);
  if (!stored) onboarding.classList.remove("hidden");
}
obClose.onclick = () => onboarding.classList.add("hidden");

obContinue.onclick = async () => {
  const displayName = obName.value.trim();
  if (!displayName) return alert("Enter a display name");

  obContinue.disabled = true; obContinue.textContent = "Saving…";

  let avatarUrl = null;
  if (obFile.files?.[0]) {
    const file = obFile.files[0];
    const ext = file.name.split(".").pop() || "jpg";
    const path = `tg_${TG_USER.id || "guest"}_${Date.now()}.${ext}`;

    const { error: upErr } = await sb.storage.from("avatars").upload(path, file, { cacheControl: "3600", upsert: true });
    if (!upErr) {
      const { data } = sb.storage.from("avatars").getPublicUrl(path);
      avatarUrl = data.publicUrl;
    }
  }

  const profile = { tg_id: TG_USER.id || null, username: TG_USER.username || null, display_name: displayName, avatar_url: avatarUrl };
  localStorage.setItem(localProfileKey, JSON.stringify(profile));
  await sb.from("profiles").insert(profile).catch(() => {});

  loadProfile();
  onboarding.classList.add("hidden");
  obContinue.disabled = false; obContinue.textContent = "Continue";
};

/* ---------- Profile ---------- */
function loadProfile() {
  const p = JSON.parse(localStorage.getItem(localProfileKey) || "{}");
  profileName.textContent = p.display_name || "Unknown User";
  // Show full-res (1000x1000) if provided; CSS scales nicely
  profileAvatar.src = p.avatar_url || "https://via.placeholder.com/1000";
}
openAbout.onclick = () => { profilePanel.classList.add("hidden"); aboutPanel.classList.remove("hidden"); };
aboutBack.onclick = () => { aboutPanel.classList.add("hidden"); profilePanel.classList.remove("hidden"); };

/* ---------- Navigation ---------- */
function activateTab(tab) {
  for (const b of [chatsBtn, searchBtn, profileBtn]) b.classList.remove("active");
  homeScreen.classList.add("hidden"); searchPanel.classList.add("hidden"); profilePanel.classList.add("hidden");

  if (tab === "chats") { chatsBtn.classList.add("active"); homeScreen.classList.remove("hidden"); }
  if (tab === "search") { searchBtn.classList.add("active"); searchPanel.classList.remove("hidden"); }
  if (tab === "profile") { profileBtn.classList.add("active"); profilePanel.classList.remove("hidden"); }
}
chatsBtn.onclick = () => activateTab("chats");
searchBtn.onclick = () => activateTab("search");
profileBtn.onclick = () => activateTab("profile");
searchBack.onclick = () => activateTab("chats");

/* ---------- Chat (Saved Messages, user-only) ---------- */
function addMessage(text){
  const m = document.createElement("div");
  m.className = "message";
  m.textContent = text;
  chatMessages.appendChild(m);
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
}
function sendMessage(){
  const t = msgInput.value.trim();
  if (!t) return;
  addMessage(t);
  msgInput.value = "";
}
sendBtn.onclick = sendMessage;
msgInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } });

savedCard.onclick = () => { chatScreen.classList.remove("hidden"); setTimeout(()=>chatScreen.classList.add("visible"),10); };
backBtn.onclick = () => { chatScreen.classList.remove("visible"); setTimeout(()=>chatScreen.classList.add("hidden"),350); };

/* ---------- Search (Supabase) ---------- */
let searchTimer=null;
searchInput.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 200); });
async function runSearch(){
  const q = searchInput.value.trim();
  results.innerHTML = "";
  if (!q) return;
  const { data, error } = await sb.from("profiles").select("id,display_name,avatar_url").ilike("display_name", `%${q}%`).limit(25);
  if (error) { console.error(error); return; }

  data.forEach(p => {
    const row = document.createElement("div");
    row.className = "result";
    row.innerHTML = `
      <img src="${p.avatar_url || 'https://via.placeholder.com/44'}" class="avatar" alt="">
      <div>${p.display_name}</div>
    `;
    results.appendChild(row);
  });
}

/* ---------- Boot ---------- */
maybeShowOnboarding();
loadProfile();
activateTab("chats");
