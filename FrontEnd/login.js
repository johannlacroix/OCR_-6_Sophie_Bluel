const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // empecher recharge page

  const email = document.getElementById("Email").value;
  const password = document.getElementById("motDePasse").value;

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      // stocker token dans localStorage
      localStorage.setItem("token", result.token);

      window.location.href = "index.html"; // vers la homepage
    } else {
      // si erreurs côté serveur
      throw new Error(result.message || "Erreur de connexion");
    }
  } catch (error) {
    //  message d'erreur
    errorMessage.textContent = error.message;
    console.error("Erreur lors de la connexion :", error);
  }
});

// Gestion de la déconnexion
const logout = () => {
  localStorage.removeItem("token"); // Supprime le token
  alert("Vous êtes déconnecté.");
  window.location.reload(); // Recharge la page pour actualiser l'état
};

// Attacher la déconnexion à un bouton
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}
