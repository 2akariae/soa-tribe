// Firebase (ES module via CDN, bla bundler). Kay-exposi window.FB l app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updatePassword }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, collection, getDoc, setDoc, updateDoc, onSnapshot, writeBatch }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDta_n8vbm54PAszztz1OkicnmykC2R0GM",
  authDomain: "anarchy-86ae0.firebaseapp.com",
  projectId: "anarchy-86ae0",
  storageBucket: "anarchy-86ae0.firebasestorage.app",
  messagingSenderId: "871406851286",
  appId: "1:871406851286:web:e1a13604b462499f92e577",
  measurementId: "G-QR5KFJEQFW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const fs = getFirestore(app);

const DB_DOC = doc(fs, "soa", "db");
const SETUP_DOC = doc(fs, "meta", "setup");
const key = (weid) => String(weid || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const rand = () => Math.random().toString(36).slice(2, 8);
const mkEmail = (weid) => `${key(weid)}-${rand()}@soa.app`;

// compte jdid bla ma ytbdl session dyal l leader (app tanya)
async function createAuthUser(email, password) {
  const sec = initializeApp(firebaseConfig, "sec-" + rand());
  const sa = getAuth(sec);
  try {
    const cred = await createUserWithEmailAndPassword(sa, email, password);
    return cred.user.uid;
  } finally {
    try { await signOut(sa); } catch (e) {}
  }
}

const FB = {
  errMsg(e) {
    const c = (e && e.code) || "";
    if (c.includes("permission-denied")) return "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629";
    if (c.includes("weak-password")) return "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0636\u0639\u064A\u0641\u0629 (6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644)";
    if (c.includes("requires-recent-login")) return "\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u0646 \u062C\u062F\u064A\u062F \u062B\u0645 \u0623\u0639\u062F \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629";
    if (c.includes("unavailable") || c.includes("network")) return "\u0645\u0634\u0643\u0644 \u0641\u064A \u0627\u0644\u0627\u062A\u0635\u0627\u0644";
    return (e && e.message) || "\u062E\u0637\u0623";
  },
  onAuth: (cb) => onAuthStateChanged(auth, cb),
  signOut: () => signOut(auth),
  async hasSetup() { return (await getDoc(SETUP_DOC)).exists(); },

  async signIn(weid, pw) {
    const k = key(weid);
    if (!k) throw new Error("bad-id");
    const snap = await getDoc(doc(fs, "logins", k));
    if (!snap.exists()) throw new Error("bad-id");
    await signInWithEmailAndPassword(auth, snap.data().email, pw);
  },

  // awl compte (leader) + data lowla, f batch wa7d
  async setupFirst({ name, weid, pw, data }) {
    const email = mkEmail(weid);
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    const uid = cred.user.uid;
    const b = writeBatch(fs);
    b.set(doc(fs, "users", uid), { name, weid, role: "leader", email });
    b.set(doc(fs, "logins", key(weid)), { email, uid });
    b.set(DB_DOC, data);
    b.set(SETUP_DOC, { done: true, at: Date.now() });
    await b.commit();
  },

  watchData(cb, err) {
    return onSnapshot(DB_DOC, (s) => cb(s.exists() ? s.data() : {}), err);
  },
  watchUsers(cb, err) {
    return onSnapshot(collection(fs, "users"), (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))), err);
  },
  save(patch) { return updateDoc(DB_DOC, patch); },

  // leader: ncreer / n3dl compte
  async saveUser(e) {
    const k = key(e.weid);
    const b = writeBatch(fs);
    if (!e.id) {
      if (!e.password) throw new Error("password required");
      if ((await getDoc(doc(fs, "logins", k))).exists()) throw new Error("\u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0645\u0633\u062C\u0651\u0644 \u0645\u0633\u0628\u0642\u0627\u064B");
      const email = mkEmail(e.weid);
      const uid = await createAuthUser(email, e.password);
      b.set(doc(fs, "users", uid), { name: e.name, weid: e.weid, role: e.role, email });
      b.set(doc(fs, "logins", k), { email, uid });
      await b.commit();
      return;
    }
    const old = (await getDoc(doc(fs, "users", e.id))).data();
    const oldKey = key(old.weid);
    const isSelf = auth.currentUser && auth.currentUser.uid === e.id;
    let uid = e.id, email = old.email;
    if (e.password && isSelf) {
      await updatePassword(auth.currentUser, e.password);
    } else if (e.password) {
      // ma kaynach tari9a tbdl password dyal chi wa7d akhor mn l-client:
      // kan-creew compte auth jdid w kan-7ydo l9dim mn users (bla data => bla wsul)
      email = mkEmail(e.weid);
      uid = await createAuthUser(email, e.password);
      b.delete(doc(fs, "users", e.id));
    }
    b.set(doc(fs, "users", uid), { name: e.name, weid: e.weid, role: e.role, email });
    if (oldKey !== k) b.delete(doc(fs, "logins", oldKey));
    b.set(doc(fs, "logins", k), { email, uid });
    await b.commit();
  },
  async deleteUser(u) {
    const b = writeBatch(fs);
    b.delete(doc(fs, "users", u.id));
    b.delete(doc(fs, "logins", key(u.weid)));
    await b.commit();
  }
};

window.FB = FB;
if (window.startApp) window.startApp();
