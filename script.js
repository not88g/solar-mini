let tg = window.Telegram.WebApp;
tg.expand();

const SUPABASE_URL = "https://qntplsebbronfdwzwetc.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const localProfileKey = "solar.profile";

const onboarding = document.getElementById("onboarding");
const obName = document.getElementById("obName");
const obFile = document.getElementById("obFile");
const obContinue = document.getElementById("obContinue");

const chatsBtn = document.getElementById("chatsBtn");
const searchBtn = document.getElementById("searchBtn");
const profileBtn = document.getElementById("profileBtn");

const homeScreen = document.getElementById("homeScreen");
const searchPanel = document.getElementById("searchPanel");
const profilePanel = document.getElementById("profilePanel");
const aboutPanel = document.getElementById("aboutPanel");

const searchBack = document.getElementById("searchBack");
const profileBack = document.getElementById("profileBack");
const aboutBack = document.getElementById("aboutBack");
const aboutBtn = document.getElementById("aboutBtn");

const savedCard = document.getElementById("savedCard");
const chatScreen = document.getElementById("chatScreen");
const backBtn = document.getElementById("backBtn");
const chatMessages = document.getElementById("chatMessages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

// onboarding
function maybeShowOnboarding() {
  const stored = localStorage.getItem(localProfileKey);
  if (!stored) onboarding.classList.remove("hidden");
  else loadProfile(JSON.parse(stored));
}

obContinue.addEventListener("click", async () => {
  const displayName = obName.value.trim();
  if (!displayName) return alert("Enter a display name");

  let avatarUrl = null;
  if (obFile.files?.[0]) {
    const file = obFile.files[0];
    const path = `avatar_${Date.now()}.jpg`;
    const { error: upErr } = await sb.storage.from("avatars").upload(path, file, { upsert: true });
    if (!upErr) {
      const { data } = sb.storage.from("avatars").getPublicUrl(path);
      avatarUrl = data.publicUrl;
    }
  }

  const profile = { display_name: displayName, avatar_url: avatarUrl };
  localStorage.setItem(localProfileKey, JSON.stringify(profile));
  onboarding.classList.add("hidden");
  loadProfile(profile);
});

// nav
function showTab(tab) {
  [homeScreen, searchPanel, profilePanel, aboutPanel, chatScreen].forEach(el => el.classList.add("hidden"));
  chatsBtn.classList.remove("active");
  searchBtn.classList.remove("active");
  profileBtn.classList.remove("active");

  if (tab === "chats") { homeScreen.classList.remove("hidden"); chatsBtn.classList.add("active"); }
  if (tab === "search") { searchPanel.classList.remove("hidden"); searchBtn.classList.add("active"); }
  if (tab === "profile") { profilePanel.classList.remove("hidden"); profileBtn.classList.add("active"); }
}

chatsBtn.onclick = () => showTab("chats");
searchBtn.onclick = () => showTab("search");
profileBtn.onclick = () => showTab("profile");

searchBack.onclick = () => showTab("chats");
profileBack.onclick = () => showTab("chats");
aboutBack.onclick = () => showTab("profile");
aboutBtn.onclick = () => showTab("about");

// chat
savedCard.onclick = () => { chatScreen.classList.remove("hidden"); };
backBtn.onclick = () => showTab("chats");

sendBtn.onclick = sendMessage;
msgInput.onkeydown = e => { if (e.key === "Enter" && msgInput.value.trim()) sendMessage(); };

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;
  const msg = document.createElement("div");
  msg.className = "message";
  msg.textContent = text;
  chatMessages.appendChild(msg);
  msgInput.value = "";
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
}

// profile
function loadProfile(p) {
  document.getElementById("profileName").textContent = p.display_name || "Unnamed";
  const img = document.getElementById("profileAvatar");
  img.src = p.avatar_url || "https://via.placeholder.com/1000";
}

// init
maybeShowOnboarding();