const url = "http://localhost:5678/api/works";
// Vérifie si un utilisateur est connecté
const token = localStorage.getItem("token");

// Gère l'affichage des boutons Login/Logout
const handleAuthButtons = () => {
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");
  const editButton = document.getElementById("edit-button");
  const filterButtons = document.getElementById("filter-buttons");
  const filtersContainer = document.querySelector(".filters");

  if (token) {
    if (logoutButton) logoutButton.style.display = "inline-block";
    if (loginButton) loginButton.style.display = "none";
    if (editButton) editButton.style.display = "flex";
    if (filtersContainer) filtersContainer.style.display = "none";

    //deconnexion logout
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
      // alert("Vous êtes déconnecté !");
      window.location.reload();
    });
  } else {
    if (loginButton) loginButton.style.display = "inline-block";
    if (logoutButton) logoutButton.style.display = "none";
    if (editButton) editButton.style.display = "none";
    if (filtersContainer) filtersContainer.style.display = "flex";

    loginButton.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
};

// Charge et affiche les travaux
const getWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok)
      throw new Error("Erreur lors de la récupération des travaux.");
    const data = await response.json();
    worksData = data;
    displayWorks("all");
  } catch (error) {
    console.error("Erreur dans getWorks :", error);
  }
};

// Affiche les travaux avec filtres
const displayWorks = (filter) => {
  const worksContainer = document.querySelector(".gallery");
  worksContainer.innerHTML = "";
  const filteredWorks =
    filter === "all"
      ? worksData
      : worksData.filter((work) => work.categoryId === parseInt(filter));

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
};

// Configure les filtres
const setupFilters = () => {
  const filterButtons = document.querySelectorAll(".filters button");
  filterButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      displayWorks(event.target.getAttribute("data-filter"));
    });
  });
};

// Gère l'ouverture de la modale "popup"
const setupEditButton = () => {
  const editButton = document.getElementById("edit-button"); // Bouton Modifier
  const popup = document.getElementById("popup"); // Modale principale

  if (editButton && popup) {
    console.log("Bouton modifier trouvé. Ajout de l'événement...");
    editButton.addEventListener("click", () => {
      console.log("Bouton modifier cliqué !");
      populateModalGallery(); // Charge la galerie dans la modale
      popup.classList.remove("hidden"); // Affiche la modale principale
    });
  } else {
    console.error("Échec : Bouton modifier ou popup introuvable.");
  }
};

const populateModalGallery = () => {
  console.log("Chargement de la galerie dans la modale...");
  const galleryThumbnails = document.querySelector(".gallery-thumbnails");
  if (!galleryThumbnails) {
    console.error("Élément .gallery-thumbnails introuvable !");
    return;
  }

  galleryThumbnails.innerHTML = ""; // Nettoie les miniatures existantes
  worksData.forEach((work) => {
    const thumbnail = document.createElement("div");
    thumbnail.classList.add("thumbnail");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    // Bouton de suppression
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("fa-solid", "fa-trash-can");
    deleteButton.appendChild(trashIcon);

    deleteButton.addEventListener("click", () => {
      deleteWork(work.id, thumbnail);
    });

    thumbnail.appendChild(img);
    thumbnail.appendChild(deleteButton);
    galleryThumbnails.appendChild(thumbnail);
  });
};

const setupClosePopupButton = () => {
  const closePopupButton = document.getElementById("close-popup");
  const popup = document.getElementById("popup");

  if (closePopupButton && popup) {
    closePopupButton.addEventListener("click", () => {
      popup.classList.add("hidden"); // Cache la modale principale
    });
  }
};

// Gère l'ouverture de la modale "Ajouter des photos"
const setupModals = () => {
  const popup = document.getElementById("popup");
  const addPhotosButton = document.getElementById("add-photos");
  const addPhotoForm = document.getElementById("add-photo-form");
  const closePopupButton = document.getElementById("close-popup");
  const validatePhotoButton = document.getElementById("validate-photo-button");

  // Ouvre la modale "Ajouter des photos" et cache la modale principale
  if (addPhotosButton && addPhotoForm && popup) {
    addPhotosButton.addEventListener("click", () => {
      console.log("Clic sur 'Ajouter des photos'");
      popup.classList.add("hidden"); // Cache la modale principale
      addPhotoForm.classList.remove("hidden"); // Affiche la modale d'ajout
      console.log("'add-photo-form' affichée !");
    });
  }

  // Ferme la modale principale "popup"
  if (closePopupButton && popup) {
    closePopupButton.addEventListener("click", () => {
      console.log("Clic sur 'Fermer la popup'");
      popup.classList.add("hidden"); // Cache la modale principale
    });
  }

  // Ferme la modale "Ajouter des photos" lorsque le bouton Valider est cliqué
  if (validatePhotoButton && addPhotoForm) {
    validatePhotoButton.addEventListener("click", () => {
      console.log("Clic sur 'Valider'");
      addPhotoForm.classList.add("hidden"); // Cache la modale d'ajout
    });
  }

  // Optionnel : Ajoute une gestion pour fermer la modale d'ajout si nécessaire
  document.addEventListener("click", (event) => {
    if (event.target === addPhotoForm) {
      console.log("Clic à l'extérieur de 'add-photo-form'");
      addPhotoForm.classList.add("hidden"); // Cache la modale d'ajout
    }
  });
};

// Bouton flèche pour revenir à la modale précédente
const backButton = document.getElementById("back-button");
const addPhotoForm = document.getElementById("add-photo-form");
const popup = document.getElementById("popup");

if (backButton && addPhotoForm && popup) {
  backButton.addEventListener("click", () => {
    addPhotoForm.classList.add("hidden"); // Cache la modale d'ajout
    popup.classList.remove("hidden"); // Réaffiche la modale précédente
    console.log("Retour à la modale principale 'popup'.");
  });
}

function openAddPhotoForm() {
  const popup = document.getElementById("popup");
  const addPhotoForm = document.getElementById("add-photo-form");

  if (popup) popup.classList.add("hidden"); // Cache la modale principale
  if (addPhotoForm) addPhotoForm.classList.remove("hidden"); // Affiche la modale d'ajout
  console.log("'add-photo-form' affichée via openAddPhotoForm !");
}

// Initialisation
// getWorks();
// setupFilters();
// handleAuthButtons();
// setupEditButton();
// setupModals();
// setupClosePopupButton();
handleAuthButtons(); // Gère l'affichage des boutons Login/Logout
setupEditButton(); // Configure le bouton Modifier
setupFilters(); // Configure les filtres
setupModals(); // Configure les interactions des modales
setupClosePopupButton(); // Configure la fermeture de la modale
getWorks(); // Charge les travaux
