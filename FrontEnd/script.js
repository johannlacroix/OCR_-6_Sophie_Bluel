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
      console.log("Ajout d'un écouteur sur :", button);
      button.addEventListener("click", (event) => {
        const filter = event.target.getAttribute("data-filter");
        console.log(`Bouton cliqué : ${filter}`);
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
};
