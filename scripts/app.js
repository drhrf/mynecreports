import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCqJsgeIwSmBGajLeIf6JH55jGjGFpB10",
  authDomain: "my-report-nec.firebaseapp.com",
  projectId: "my-report-nec",
  storageBucket: "my-report-nec.appspot.com",
  messagingSenderId: "464951551947",
  appId: "1:464951551947:web:d68d634794f5c3f465784e",
  measurementId: "G-89HBDD23R1"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Elementos da interface
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const userSection = document.getElementById('user-section');
const authSection = document.getElementById('auth-section');
const pdfLink = document.getElementById('pdfLink');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Registro
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

// Login
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

// Estado de autenticação
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    userEmail.textContent = user.email;

    const docRef = doc(db, "users", user.uid, "documents", "main");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const path = docSnap.data().pdfPath;
      const url = await getDownloadURL(ref(storage, path));
      pdfLink.innerHTML = `<a href="${url}" target="_blank">📄 Baixar meu relatório</a>`;
    } else {
      pdfLink.textContent = "Nenhum PDF disponível.";
    }
  } else {
    authSection.classList.remove('hidden');
    userSection.classList.add('hidden');
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});
