const url = "http://localhost:5678/api/works";
// verif si un utilisateur est connecté
const token = localStorage.getItem("token");
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY1MTg3NDkzOSwiZXhwIjoxNjUxOTYxMzM5fQ.JGN1p8YIfR-M-5eQ-Ypy6Ima5cKA4VbfL2xMr2MgHm4"
let worksData = [];

console.log("Token utilisateur :", token);

//ajouter une photo à galerie
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

  // Log des données pour debug
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  try {
    console.log("Envoi des données a l'API...");
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

      // verif structure de `newWork` avant de l'ajouter
      if (newWork && newWork.id) {
        worksData.push(newWork); // Ajoute l'élément à galerie
        displayWorks("all");
        console.log("Travaux après ajout :", worksData);

        // Reinitialise formulaire
        photoUploadInput.value = "";
        titleInput.value = "";
        categorySelect.value = "";
        document.getElementById("add-photo-form").classList.add("hidden");
        alert("Photo ajoutée avec succès !");
      } else {
        console.warn("Structure inattendue pour la réponse :", newWork);
        alert(
          "La photo a été ajoutée mais une erreur s'est produite lors de la mise à jour de la galerie."
        );
      }
    } else {
      const errorData = await response.json();
      console.error("Erreur API :", errorData);
      alert(`Erreur : ${errorData.message || "Une erreur est survenue."}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API :", error);
    alert("Une erreur s'est produite lors de l'envoi des données.");
  }
};

// affichage boutons Login/Logout
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

// Charge et affiche works
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
  } catch (error) {
    console.error("Erreur dans getWorks :", error);
  }
};

// affiche travaux avec filtres
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

// config filtres
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

// ouverture modale "popup"
const setupEditButton = () => {
  const editButton = document.getElementById("edit-button"); // Bouton Modifier
  const popup = document.getElementById("popup"); // Modale principale

  if (editButton && popup) {
    console.log("Bouton modifier trouvé. Ajout de l'événement...");
    editButton.addEventListener("click", () => {
      console.log("Bouton modifier cliqué !");
      populateModalGallery(); // charge galerie dans modale
      popup.classList.remove("hidden"); // Affiche modale principale
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

  galleryThumbnails.innerHTML = ""; // nettoie miniatures existantes
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
      popup.classList.add("hidden"); // Cache modale principale
    });
  }
};

// Gère l'ouverture de modale "Ajouter des photos"
const setupModals = () => {
  const popup = document.getElementById("popup");
  const addPhotosButton = document.getElementById("add-photos");
  const addPhotoForm = document.getElementById("add-photo-form");
  const closePopupButton = document.getElementById("close-popup");
  const validatePhotoButton = document.getElementById("validate-photo-button");

  // Ouvre modale "Ajouter des photos" et cache modale principale
  if (addPhotosButton && addPhotoForm && popup) {
    addPhotosButton.addEventListener("click", () => {
      console.log("Clic sur 'Ajouter des photos'");
      popup.classList.add("hidden"); // Cache modale principale
      addPhotoForm.classList.remove("hidden"); // Affiche modale d'ajout
      console.log("'add-photo-form' affichée !");
    });
  }

  // Ferme modale principale "popup"
  if (closePopupButton && popup) {
    closePopupButton.addEventListener("click", () => {
      console.log("Clic sur 'Fermer la popup'");
      popup.classList.add("hidden"); // Cache la modale principale
    });
  }

  // Ferme la modale "Ajouter des photos" lorsque bouton Valider est cliqué
  if (validatePhotoButton && addPhotoForm) {
    validatePhotoButton.addEventListener("click", () => {
      console.log("Clic sur 'Valider'");
      addPhotoToAPI();
      addPhotoForm.classList.add("hidden"); // Cache modale d'ajout
    });
  }

  // Optionnel : Ajoute une gestion pour fermer la modale d'ajout si nécessaire
  document.addEventListener("click", (event) => {
    if (event.target === addPhotoForm) {
      console.log("Clic à l'extérieur de 'add-photo-form'");
      addPhotoForm.classList.add("hidden"); // Cache modale d'ajout
    }
  });
};

// Bouton flèche pour revenir à modale précédente
const backButton = document.getElementById("back-button");
const addPhotoForm = document.getElementById("add-photo-form");
const popup = document.getElementById("popup");

if (backButton && addPhotoForm && popup) {
  backButton.addEventListener("click", () => {
    addPhotoForm.classList.add("hidden"); // Cache modale d'ajout
    popup.classList.remove("hidden"); // Réaffiche la modale précédente
    console.log("Retour à la modale principale 'popup'.");
  });
}

// Bouton et champ d'upload
const uploadPhotoButton = document.getElementById("upload-photo-button");
const photoUploadInput = document.getElementById("photo-upload");
const defaultImage = document.querySelector(".defaultImage");

// Ouvre l'explorateur de fichiers au clic sur bouton
if (uploadPhotoButton && photoUploadInput) {
  uploadPhotoButton.addEventListener("click", () => {
    photoUploadInput.click(); // Ouvre l'explorateur de fichiers
  });
}

// Affiche l'image sélectionnée dans l'élément <img>
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

function openAddPhotoForm() {
  const popup = document.getElementById("popup");
  const addPhotoForm = document.getElementById("add-photo-form");

  if (popup) popup.classList.add("hidden"); // Cache modale principale
  if (addPhotoForm) addPhotoForm.classList.remove("hidden"); // Affiche modale d'ajout
  console.log("'add-photo-form' affichée via openAddPhotoForm !");
}

handleAuthButtons(); // affichage des boutons Login/Logout
setupEditButton(); // Config bouton Modifier
setupFilters(); // Config filtres
setupModals(); // Config interactions des modales
setupClosePopupButton(); // Config fermeture de modale
getWorks(); // Charge projets
