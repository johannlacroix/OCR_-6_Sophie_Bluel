const url = "http://localhost:5678/api/works";
const token = localStorage.getItem("token");

let worksData = []; // Var pour stocker data des travaux

// récupérer et afficher les travaux
const getWorks = async () => {
  try {
    console.log("Tentative de récupération des données...");
    const headers = {
      "Content-Type": "application/json",
    };
    const token = localStorage.getItem("token"); // Récupérer le token depuis localStorage
    if (token) {
      headers.Authorization = `Bearer ${token}`; // Ajouter l'autorisation si un token existe
    }
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok)
      throw new Error("Erreur lors de la récupération des travaux.");

    const data = await response.json();
    console.log("Données récupérées :", data);

    worksData = data;
    displayWorks("all");
  } catch (error) {
    console.error("Erreur dans getWorks :", error);
  }
};

// Fonction pour afficher les travaux avec un filtre
const displayWorks = (filter) => {
  try {
    const worksContainer = document.querySelector(".gallery");
    if (!worksContainer) {
      throw new Error("Élément galerie non trouvé dans le DOM.");
    }

    worksContainer.innerHTML = ""; // Vide la galerie avant de la mettre à jour

    // filtrage des travaux
    const filteredWorks =
      filter === "all"
        ? worksData
        : worksData.filter((work) => work.categoryId === parseInt(filter));

    // générer éléments HTML pour chaque travail
    filteredWorks.forEach((work) => {
      const workElement = document.createElement("figure");

      const imageElement = document.createElement("img");
      imageElement.src = work.imageUrl;
      imageElement.alt = work.title;

      const captionElement = document.createElement("figcaption");
      captionElement.textContent = work.title;

      workElement.appendChild(imageElement);
      workElement.appendChild(captionElement);
      worksContainer.appendChild(workElement);
    });
  } catch (error) {
    console.error("Erreur dans displayWorks :", error);
  }
};

// Fonction pour configurer les filtres
const setupFilters = () => {
  try {
    const filterButtons = document.querySelectorAll(".filters button");

    if (filterButtons.length === 0) {
      console.error("Aucun bouton de filtre trouvé dans le DOM.");
      return;
    }

    console.log("Boutons trouvés :", filterButtons);

    filterButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const filter = event.target.getAttribute("data-filter");

        displayWorks(filter);
      });
    });
  } catch (error) {
    console.error("Erreur dans setupFilters :", error);
  }
};

// Gère l'affichage des boutons Login et Logout
const handleAuthButtons = () => {
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");

  // Si un token est présent, l'utilisateur est connecté
  if (token) {
    if (logoutButton) {
      logoutButton.style.display = "inline-block";
    }
    if (loginButton) {
      loginButton.style.display = "none";
    }

    // Gestion de la déconnexion
    logoutButton.addEventListener("click", () => {
      // Supprimer le token du localStorage pour déconnecter l'utilisateur
      localStorage.removeItem("token");
      alert("Vous êtes déconnecté !");
      window.location.reload(); // Recharger la page pour mettre à jour l'affichage
    });
  } else {
    // Si aucun token n'est présent, l'utilisateur n'est pas connecté
    if (loginButton) {
      loginButton.style.display = "inline-block";
    }
    if (logoutButton) {
      logoutButton.style.display = "none";
    }

    // Optionnel : Ajouter un comportement pour le bouton Login
    loginButton.addEventListener("click", () => {
      window.location.href = "login.html"; // Rediriger vers la page de connexion
    });
  }
};

// Fonction pour supprimer un travail (à adapter selon votre API)
const deleteWork = async (id, thumbnail) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    const token = localStorage.getItem("token"); // Récupérer le token depuis localStorage
    if (token) {
      headers.Authorization = `Bearer ${token}`; // Ajouter l'autorisation si un token existe
    }

    const response = await fetch(`${url}/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du travail.");
    }

    alert("Le travail a été supprimé.");
    // Supprimer la miniature dans la galerie de la modale
    thumbnail.remove();
    getWorks(); // Recharger les travaux après suppression
  } catch (error) {
    console.error("Erreur dans deleteWork :", error);
  }
};

// Fonction pour remplir la galerie dans la modale avec les icônes de suppression
const populateModalGallery = () => {
  const galleryThumbnails = document.querySelector(".gallery-thumbnails");
  if (!galleryThumbnails) return;

  galleryThumbnails.innerHTML = ""; // Nettoie les miniatures existantes

  worksData.forEach((work) => {
    const thumbnail = document.createElement("div");
    thumbnail.classList.add("thumbnail");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    // Bouton de suppression avec l'icône Trash.png
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button"); // Ajout d'une classe pour styliser
    const trashIcon = document.createElement("img");
    trashIcon.src = "./assets/icons/Trash.png";
    trashIcon.alt = "Supprimer";
    trashIcon.style.width = "24px"; // Vous pouvez ajuster la taille ici
    trashIcon.style.height = "24px";

    deleteButton.appendChild(trashIcon);
    deleteButton.addEventListener("click", () => {
      deleteWork(work.id, thumbnail); // Passe aussi la miniature à supprimer
    });

    thumbnail.appendChild(img);
    thumbnail.appendChild(deleteButton);
    galleryThumbnails.appendChild(thumbnail);
  });
};

// Initialisation du script au chargement de la page
window.onload = () => {
  const token = localStorage.getItem("token"); // Vérifie si un token est présent
  const editButton = document.getElementById("edit-button");
  const filtersContainer = document.querySelector(".filters");
  const popup = document.getElementById("popup");
  const closePopupButton = document.getElementById("close-popup");

  // Gérer l'affichage du bouton "modifier"
  if (editButton) {
    if (token) {
      // Si un token est présent, afficher le bouton
      editButton.style.display = "inline-block";
    } else {
      // Si aucun token n'est présent, masquer le bouton
      editButton.style.display = "none";
    }
  }

  // Gérer l'affichage des filtres
  if (filtersContainer) {
    if (token) {
      filtersContainer.style.display = "none";
    } else {
      filtersContainer.style.display = "block";
      filtersContainer.style.textAlign = "center"; // Assurez-vous de centrer
    }
  }

  // Vérifier si les éléments existent dans le DOM
  if (editButton && popup && closePopupButton) {
    // Ouvrir la modale lorsque "modifier" est cliqué
    editButton.addEventListener("click", () => {
      populateModalGallery(); // Charger la galerie de la modale
      popup.classList.remove("hidden"); // Affiche la modale
    });

    // Fermer la modale lorsque le bouton "fermer" est cliqué
    closePopupButton.addEventListener("click", () => {
      popup.classList.add("hidden"); // Cache la modale
    });

    // Fermer la modale si l'utilisateur clique à l'extérieur de la popup
    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        popup.classList.add("hidden");
      }
    });
  }

  getWorks(); // Charge les travaux
  setupFilters(); // Configure les filtres
  handleAuthButtons(); // Gère l'affichage des boutons Login/Logout
};
