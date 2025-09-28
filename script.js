// --- Telegram + Supabase init ---
const tg = window.Telegram.WebApp;
tg.expand();

const SUPABASE_URL = "https://qntplsebbronfdwzwetc.supabase.co";           // <- your URL
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";                                // <- put new anon key
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elements
const onboarding = document.getElementById("onboarding");
const obName = document.getElementById("obName");
const obFile = document.getElementById("obFile");
const obContinue = document.getElementById("obContinue");
const obClose = document.getElementById("obClose");

const homeScreen = document.getElementById("homeScreen");
const savedCard = document.getElementById("savedCard");

const chatsBtn = document.getElementById("chatsBtn");
const searchBtn = document.getElementById("searchBtn");
const chatScreen = document.getElementById("chatScreen");
const backBtn = document.getElementById("backBtn");

const searchPanel = document.getElementById("searchPanel");
const searchBack = document.getElementById("searchBack");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

const messagesEl = document.getElementById("chatMessages");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

// Local profile
const TG_USER = tg.initDataUnsafe?.user || {};
const localProfileKey = "solar.profile";

// ---------- Onboarding ----------
function maybeShowOnboarding() {
  const stored = localStorage.getItem(localProfileKey);
  if (!stored) {
    onboarding.classList.remove("hidden");
  }
}
obClose.addEventListener("click", () => onboarding.classList.add("hidden"));

obContinue.addEventListener("click", async () => {
  const displayName = obName.value.trim();
  if (!displayName) return alert("Enter a display name");

  let avatarUrl = null;

  // Upload to Supabase Storage if a file is chosen
  if (obFile.files?.[0]) {
    const file = obFile.files[0];
    const ext = file.name.split(".").pop();
    const path = `tg_${TG_USER.id || "guest"}_${Date.now()}.${ext || "jpg"}`;

    const { error: upErr } = await sb.storage.from("avatars").upload(path, file, {
      cacheControl: "3600", upsert: true
    });
    if (upErr) {
      console.warn("Upload error:", upErr.message);
    } else {
      const { data: pub } = sb.storage.from("avatars").getPublicUrl(path);
      avatarUrl = pub.publicUrl;
    }
  }

  // Save locally
  const local = {
    display_name: displayName,
    avatar_url: avatarUrl,
    tg_id: TG_USER.id || null,
    username: TG_USER.username || null
  };
  localStorage.setItem(localProfileKey, JSON.stringify(local));

  // Also upsert to profiles table (creates your row for search)
  await sb.from("profiles").insert({
    tg_id: TG_USER.id || null,
    username: TG_USER.username || null,
    display_name: displayName,
    avatar_url: avatarUrl
  }).catch(()=>{});

  onboarding.classList.add("hidden");
});

// ---------- Nav / Panels ----------
chatsBtn.addEventListener("click", () => {
  chatsBtn.classList.add("active"); searchBtn.classList.remove("active");
  searchPanel.classList.add("hidden");
});
searchBtn.addEventListener("click", () => {
  searchBtn.classList.add("active"); chatsBtn.classList.remove("active");
  searchPanel.classList.remove("hidden");
});
searchBack.addEventListener("click", () => {
  searchPanel.classList.add("hidden");
  chatsBtn.classList.add("active"); searchBtn.classList.remove("active");
});

// Open Saved Messages chat
savedCard.addEventListener("click", () => {
  chatScreen.classList.remove("hidden");
  setTimeout(()=> chatScreen.classList.add("visible"), 10); // slide up
});
backBtn.addEventListener("click", () => {
  chatScreen.classList.remove("visible");
  setTimeout(()=> chatScreen.classList.add("hidden"), 350); // slide down
});

// ---------- Saved Messages (user-only, no replies) ----------
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && input.value.trim()) { e.preventDefault(); sendMessage(); }
});
function addMessage(text){
  const d=document.createElement("div"); d.className="message"; d.textContent=text;
  messagesEl.appendChild(d);
  messagesEl.scrollTo({top:messagesEl.scrollHeight, behavior:"smooth"});
}
function sendMessage(){
  const t=input.value.trim(); if(!t) return; addMessage(t); input.value="";
  // You can also persist Saved Messages to Supabase later if desired.
}

// ---------- Search (server-side) ----------
let searchTimer=null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(runSearch, 200);
});
async function runSearch(){
  const q = searchInput.value.trim();
  if (!q) { results.innerHTML=""; return; }

  // Case-insensitive contains using ilike
  const { data, error } = await sb
    .from("profiles")
    .select("id, display_name, avatar_url")
    .ilike("display_name", `%${q}%`)
    .limit(25);

  if (error) { console.error(error); return; }

  results.innerHTML = "";
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

// ---------- boot ----------
maybeShowOnboarding();