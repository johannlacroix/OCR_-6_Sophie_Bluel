const url = "http://localhost:5678/api/works";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY1MTg3NDkzOSwiZXhwIjoxNjUxOTYxMzM5fQ.JGN1p8YIfR-M-5eQ-Ypy6Ima5cKA4VbfL2xMr2MgHm4";
console.log("Le script est chargé !");

let worksData = []; // Var pour stocker data des travaux

// récupérer et afficher les travaux
const getWorks = async () => {
  try {
    console.log("Tentative de récupération des données...");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
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

// Fonct pr afficher travaux /filtre
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

    // générer éléments HTML pr chaque travail
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

// fonct° pour configurer filtres
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

// initialise script js au chargmnt de la page
window.onload = () => {
  getWorks(); // charge les travaux
  setupFilters(); // config filtres une fois le DOM chargé
  const editButton = document.getElementById("edit-button");
  const token = localStorage.getItem("token");

  if (token && editButton) {
    // utilisateur connecté et bouton apparait
    editButton.style.display = "inline-block"; // affiche le bouton
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.getElementById("edit-button");
  const popup = document.getElementById("popup");
  const closePopupButton = document.getElementById("close-popup");
  const galleryThumbnails = document.querySelector(".gallery-thumbnails");

  // ouvrir la pop-up
  editButton.addEventListener("click", () => {
    fillGalleryThumbnails();
    popup.classList.remove("hidden");
  });

  // fermer la popup
  closePopupButton.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  // remplir miniatures de la galerie
  function fillGalleryThumbnails() {
    galleryThumbnails.innerHTML = ""; // vider anciennes miniatures

    worksData.forEach((work, index) => {
      const thumbnailContainer = document.createElement("div");
      thumbnailContainer.classList.add("thumbnail-container");

      const imgElement = document.createElement("img");
      imgElement.src = work.imageUrl;
      imgElement.alt = work.title;

      const deleteIcon = document.createElement("img");
      deleteIcon.src = "./assets/icons/trash.png"; // chemin vers icône poubelle
      deleteIcon.alt = "Supprimer";
      deleteIcon.classList.add("delete-icon");

      // ajouter icône poubelle sur miniatures
      thumbnailContainer.appendChild(imgElement);
      thumbnailContainer.appendChild(deleteIcon);
      galleryThumbnails.appendChild(thumbnailContainer);

      // ecouter clic sur icône poubelle
      deleteIcon.addEventListener("click", () => {
        deleteImage(index);
      });
    });
  }

  // fonction pour supprimer une image de la galerie
  function deleteImage(index) {
    if (confirm("Voulez-vous vraiment supprimer cette image ?")) {
      worksData.splice(index, 1); // Supp. image du tableau des data
      fillGalleryThumbnails(); // Mise à jour de affichage miniatures
    }
  }

  // explorateur de fichiers pr ajouter photo
  const addPhotosButton = document.getElementById("add-photos");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  // ouvrir l'explorateur de fichiers quand clic Ajouter des photos
  addPhotosButton.addEventListener("click", () => {
    fileInput.click();
  });

  // selection des fichiers
  fileInput.addEventListener("change", (event) => {
    const files = event.target.files;
    console.log("Fichiers sélectionnés :", files);

    // Ex: pr afficher noms de fichiers ds console
    for (const file of files) {
      console.log(`Nom du fichier : ${file.name}`);
    }
  });
});
