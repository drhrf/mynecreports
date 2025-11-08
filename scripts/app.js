import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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

// Gera caminho do PDF a partir do UID
async function carregarRelatorioPara(user) {
  // aqui você define o padrão do nome do arquivo
  const path = `pdfs/${user.uid}/Relatorio_ERAPT.pdf`;
  console.log("Caminho calculado para o PDF:", path);

  try {
    const url = await getDownloadURL(ref(storage, path));
    console.log("URL gerada:", url);
    pdfLink.innerHTML = `<a href="${url}" target="_blank">📄 Baixar meu relatório</a>`;
  } catch (err) {
    console.error("Erro ao carregar relatório:", err);
    pdfLink.textContent = "Nenhum relatório disponível para este usuário.";
  }
}

// Estado de autenticação
onAuthStateChanged(auth, async (user) => {
  console.log("onAuthStateChanged disparado. user =", user);

  if (user) {
    authSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    userEmail.textContent = user.email;

    pdfLink.textContent = "Carregando...";
    await carregarRelatorioPara(user);
  } else {
    authSection.classList.remove('hidden');
    userSection.classList.add('hidden');
    pdfLink.textContent = "";
  }
});

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
  });
}
