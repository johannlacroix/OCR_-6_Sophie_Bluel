const url = "http://localhost:5678/api/works";
// verif si un utilisateur est connecté
const token = localStorage.getItem("token");
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY1MTg3NDkzOSwiZXhwIjoxNjUxOTYxMzM5fQ.JGN1p8YIfR-M-5eQ-Ypy6Ima5cKA4VbfL2xMr2MgHm4"
let worksData = [];

//addPhotoToAPI : ajouter 1 photo à la galerie en evoyant données à l'API
const addPhotoToAPI = async () => {
  const photoUploadInput = document.getElementById("photo-upload");
  const titleInput = document.getElementById("photo-title");
  const categorySelect = document.getElementById("photo-category");
  const file = photoUploadInput.files[0];
  const title = titleInput.value;
  const category = parseInt(categorySelect.value, 10);

  // verif champs du formulaire
  if (!file || !title || isNaN(category)) {
    alert("Veuillez remplir tous les champs et ajouter une photo valide.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", title);
  formData.append("category", category);

  // log données pour debug
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  try {
    // console.log("Envoi des données a l'API...");
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("Réponse brute de l'API :", response);

    if (response.ok) {
      const newWork = await response.json();
      console.log("Nouvelle photo ajoutée :", newWork);

      // verif structure de `newWork` avant de ajouter
      if (newWork && newWork.id) {
        getWorks();
        // console.log("Travaux après ajout :", worksData);

        // reinitialise formulaire
        photoUploadInput.value = "";
        titleInput.value = "";
        categorySelect.value = "";
        document.getElementById("add-photo-form").classList.add("hidden");
      }
    } else {
      const errorData = await response.json();
      console.error("Erreur API :", errorData);
      alert(`Erreur : ${errorData.message || "Une erreur est survenue."}`);
    }
  } catch (error) {
    console.error("Erreur lors de appel API :", error);
    alert("erreur a l'envoi des donnees");
  }
};

// deleteWork : supprimer un work de l'API/BSS via son Id
const deleteWork = async (workId) => {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      // console.log(`Image avec ID ${workId} supprimée.`);
      // Màj données locales
      worksData = worksData.filter((work) => work.id !== workId);
      // reafficher galeries
      displayWorks("all");
      populateModalGallery();
    } else {
      console.error(`Erreur lors de la suppression de l'image ID ${workId}`);
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image :", error);
  }
};

// handleAuthButtons : affichage boutons Login/Logout en conction du statut utilisateur
const handleAuthButtons = () => {
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");
  const editButton = document.getElementById("edit-button");
  const filterButtons = document.getElementById("filter-buttons");
  const filtersContainer = document.querySelector(".filters");

  if (token) {
    if (logoutButton) logoutButton.style.display = "inline-block"; // affiche bouton Lougout
    if (loginButton) loginButton.style.display = "none"; // masque bouton Login
    if (editButton) editButton.style.display = "flex"; // affiche bouton modifier
    if (filtersContainer) filtersContainer.style.display = "none"; // masque bouton de filtres

    //deconnexion logout
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
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

// Charge et affiche les projets/ works
const getWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      console.error("Erreur API, statut :", response.status);
      throw new Error("Erreur lors de la récupération des travaux.");
    }
    const data = await response.json();
    worksData = data;
    displayWorks("all");
    populateModalGallery();
  } catch (error) {
    console.error("Erreur dans getWorks :", error);
  }
};

// displayWorks : affiche travaux en fonction des filtres/ catégories
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

// setupFilters : configure les boutons filtres
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

// setupEditButton : ouvrir la modale "popup"/ au clic sur "modifier"
const setupEditButton = () => {
  const editButton = document.getElementById("edit-button"); // Bouton Modifier
  const popup = document.getElementById("popup"); // Modale principale

  if (editButton && popup) {
    editButton.addEventListener("click", () => {
      console.log("Bouton modifier cliqué !");
      populateModalGallery(); // charge galerie dans modale
      popup.classList.remove("hidden"); // affiche modale principale
    });
  } else {
    console.error("Échec : Bouton modifier ou popup introuvable.");
  }
};

// poulateModalGallery : remplit la galerie de la modale popup avec les thumbnails
const populateModalGallery = () => {
  // console.log("Chargement de la galerie dans la modale...");
  const galleryThumbnails = document.querySelector(".gallery-thumbnails");
  if (!galleryThumbnails) {
    console.error("Élément .gallery-thumbnails introuvable !");
    return;
  }

  galleryThumbnails.innerHTML = ""; // vide thumbnails existantes
  worksData.forEach((work) => {
    const thumbnail = document.createElement("div");
    thumbnail.classList.add("thumbnail");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    // Bouton supprimer 1 thumbnail
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

// setupClosePopupButton : Config bouton de fermeture modale "popup"
const setupClosePopupButton = () => {
  const closePopupButton = document.getElementById("close-popup");
  const popup = document.getElementById("popup");

  if (closePopupButton && popup) {
    closePopupButton.addEventListener("click", () => {
      popup.classList.add("hidden"); // cachee modale popup
    });
  }
};

// setupModals : ouverture de modale "Ajouter des photos" et fermeture "popup"
const setupModals = () => {
  const popup = document.getElementById("popup");
  const addPhotosButton = document.getElementById("add-photos");
  const addPhotoForm = document.getElementById("add-photo-form");
  const closePopupButton = document.getElementById("close-popup");
  const validatePhotoButton = document.getElementById("validate-photo-button");

  // ouvrir modale "Ajouter des photos" et cache modale "popup"
  if (addPhotosButton && addPhotoForm && popup) {
    addPhotosButton.addEventListener("click", () => {
      console.log("Clic sur 'Ajouter des photos'");
      popup.classList.add("hidden"); // Cache modale principale
      addPhotoForm.classList.remove("hidden"); // Affiche modale d'ajout de photos
      // console.log("'add-photo-form' affichée !");
    });
  }

  // fermer modale principale "popup"
  if (closePopupButton && popup) {
    closePopupButton.addEventListener("click", () => {
      console.log("Clic sur 'Fermer la popup'");
      popup.classList.add("hidden"); // Cache la modale principale
    });
  }

  // Ferme modale "Ajouter des photos" au clic sur btn Valider
  if (validatePhotoButton && addPhotoForm) {
    validatePhotoButton.addEventListener("click", () => {
      console.log("Clic sur 'Valider'");
      addPhotoToAPI();
      addPhotoForm.classList.add("hidden"); // Cache modale d'ajout
    });
  }
};

// Bouton flèche retour à modale popup
const backButton = document.getElementById("back-button");
const addPhotoForm = document.getElementById("add-photo-form");
const popup = document.getElementById("popup");

if (backButton && addPhotoForm && popup) {
  backButton.addEventListener("click", () => {
    addPhotoForm.classList.add("hidden"); // cache modale d'ajout
    popup.classList.remove("hidden"); // reaffiche la modale popup
    console.log("Retour à la modale principale 'popup'.");
  });
}

// Bouton et champ upload
const uploadPhotoButton = document.getElementById("upload-photo-button");
const photoUploadInput = document.getElementById("photo-upload");
const defaultImage = document.querySelector(".defaultImage");

// ouvrir explorateur de fichiers au clic sur bouton
if (uploadPhotoButton && photoUploadInput) {
  uploadPhotoButton.addEventListener("click", () => {
    photoUploadInput.click(); // Ouvre l'explorateur de fichiers
  });
}

// Affiche image sélectionnée dans l'élément <img>
if (photoUploadInput && defaultImage) {
  photoUploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0]; // Récupère fichier sélectionné
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();

      reader.onload = (e) => {
        defaultImage.src = e.target.result; // Affiche l'image sélectionnée
      };

      reader.readAsDataURL(file); // Lit fichier comme URL de données
    } else {
      alert("Veuillez sélectionner un fichier valide (JPG ou PNG).");
    }
  });
}

// openAddPhotoForm : ouvre modale d'ajout de photos
function openAddPhotoForm() {
  const popup = document.getElementById("popup");
  const addPhotoForm = document.getElementById("add-photo-form");
  const defaultImage = document.querySelector(".defaultImage");
  const photoUploadInput = document.getElementById("photo-upload");

  if (popup) popup.classList.add("hidden"); // Cache modale principale
  if (addPhotoForm) addPhotoForm.classList.remove("hidden"); // affiche modale d'ajout

  if (defaultImage) {
    defaultImage.src = "assets/icons/image.png"; // remplace par image défaut
  }
  if (photoUploadInput) {
    photoUploadInput.value = ""; // reinitialise champ input file
  }
}

handleAuthButtons(); // affichage des boutons Login/Logout
setupEditButton(); // Config bouton Modifier
setupFilters(); // Config filtres
setupModals(); // Config interactions des modales
setupClosePopupButton(); // Config fermeture de modale
getWorks(); // Charge projets
