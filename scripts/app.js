import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

console.log("app.js carregado");

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCqJsdgeIwSmBGajLeIf6JH55jGjGFpBl0",
  authDomain: "my-report-nec.firebaseapp.com",
  projectId: "my-report-nec",
  storageBucket: "my-report-nec.firebasestorage.app",
  messagingSenderId: "464951551947",
  appId: "1:464951551947:web:d68d634794f5c3f465784e",
  measurementId: "G-89HBDDZ3R1"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firestore com long-polling automático (evita "client is offline")
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  // Se ainda der problema de offline, pode trocar a linha de cima por:
  // experimentalForceLongPolling: true,
});

const storage = getStorage(app);

// Elementos da interface
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const userSection = document.getElementById('user-section');
const authSection = document.getElementById('auth-section');
const pdfLink = document.getElementById('pdfLink');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

console.log("Elementos carregados:", {
  registerForm, loginForm, userSection, authSection, pdfLink, userEmail, logoutBtn
});

// Registro
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Conta criada com sucesso!");
    } catch (error) {
      alert("Erro: " + error.message);
    }
  });
}

// Login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Erro: " + error.message);
    }
  });
}

// Estado de autenticação
onAuthStateChanged(auth, async (user) => {
  console.log("onAuthStateChanged disparado. user =", user);

  if (user) {
    authSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    userEmail.textContent = user.email;

    try {
      const docRef = doc(db, "users", user.uid, "documents", "main");
      console.log("Buscando doc em:", docRef.path);

      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn("Documento Firestore não encontrado para UID:", user.uid);
        pdfLink.textContent = "Nenhum PDF disponível.";
        return;
      }

      const path = docSnap.data().pdfPath;
      console.log("pdfPath do Firestore:", path);

      const url = await getDownloadURL(ref(storage, path));
      console.log("URL gerada:", url);
      pdfLink.innerHTML = `<a href="${url}" target="_blank">📄 Baixar meu relatório</a>`;
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      pdfLink.textContent = "Erro ao carregar o relatório.";
    }
  } else {
    authSection.classList.remove('hidden');
    userSection.classList.add('hidden');
  }
});

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
  });
}
