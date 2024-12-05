const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // empeche recharge page

  const email = document.getElementById("Email").value;
  const password = document.getElementById("motDePasse").value;

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    console.log("Email :", email);
    console.log("Password :", password);

    const result = await response.json();

    if (response.ok) {
      // stocker token dans localStorage
      localStorage.setItem("token", result.token);
      alert("Connexion réussie !");
      window.location.href = "index.html"; // Redir après succès
    } else {
      // Afficher un message d'erreur
      throw new Error(result.message || "Erreur de connexion");
    }
  } catch (error) {
    // Affiche mess erreur connex pour utilisateur
    errorMessage.textContent = error.message;
  }
});
