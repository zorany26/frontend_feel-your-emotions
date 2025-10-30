import { getUsers, getUserById } from "/src/services/userService.js";
import { getSurveysByUserId } from '/src/services/surveyService.js';
import { queryChatGPT } from '/src/services/chatgptService.js';

function showViewInfo() {
  showLoading(true);
  let captionTabla = document.querySelector("caption");
  getUsers()
    .then(function (backendResponse) {
      console.log(backendResponse);
      showLoading(false);
      showTable(backendResponse);
      if (backendResponse.length != 0) {
        captionTabla.innerHTML = "Da click en la fila para ver detalles";
        let findInput = document.querySelector("#buscar");
        if (findInput) {
          findInput.removeAttribute("disabled");
        }
      } else {
        showLoading(false);
        captionTabla.innerHTML = "La tabla no cuenta con registros";
      }
    })
    .catch(function (error) {
      console.error(error);
      showLoading(false);
      captionTabla.innerHTML =
        "Hubo un error al traer la información desde el servidor 😕";
    });
}

function showTable(users) {
  let tableBody = document.querySelector("table tbody");
  if (!tableBody) return;
  
  tableBody.innerHTML = "";

  users.forEach((user) => {
    let row = document.createElement("tr");
    row.setAttribute("data-bs-toggle", "modal");
    row.setAttribute("data-bs-target", "#ventanaModal");
    row.setAttribute("id", `usr-${user.user_id}`);
    row.innerHTML = `
            <td class="text-start"> ${user.name} </td>
            <td> ${user.age} </td>
            <td> ${user.gender} </td>
            <td class="text-start"> ${user.context} </td>
        `;
    tableBody.appendChild(row);
  });
}

function initializeEventListeners() {
  // Event listener para la tabla
  let tableBody = document.querySelector("table tbody");
  if (tableBody) {
    tableBody.addEventListener("click", (event) => {
      let rowId = event.target.parentElement.id;
      console.log(rowId);
      if (rowId.startsWith("usr-")) {
        console.log("Showing modal for", rowId.slice(4));
        showUserWindowModal(rowId.slice(4));
      }
    });
  }

  // Event listener para el input de búsqueda
  let findInput = document.querySelector("#buscar");
  if (findInput) {
    findInput.addEventListener("keyup", () => {
      filterTable(findInput.value);
    });
  }
}

function showUserWindowModal(id) {
  let userNameH1 = document.getElementById("user-name");
  let userAgeInput = document.getElementById("user-age");
  let userGenderInput = document.getElementById("user-gender");
  let userContextTextArea = document.getElementById("user-context");

  let userData = null;
  let surveyData = null;

  getUserById(id)
    .then(function (backendResponse) {
      console.log(backendResponse);
      if (userNameH1) userNameH1.textContent = backendResponse.name;
      if (userAgeInput) userAgeInput.value = backendResponse.age;
      if (userGenderInput) userGenderInput.value = backendResponse.gender;
      if (userContextTextArea) userContextTextArea.value = backendResponse.context;
      userData = backendResponse;
      return userData
    })
    .catch(function (error) {
      console.error(error);
    });

  getSurveysByUserId(id)
    .then(function (backendResponse) {
      console.log(backendResponse);
      // obtener la encuesta mas reciente
      let recentSurvey = null;
      if (backendResponse.length > 0) {
        recentSurvey = backendResponse.reduce((prev, current) => {
          return (new Date(prev.created_at) > new Date(current.created_at)) ? prev : current;
        });
      }else {
        recentSurvey = null;
      }
      if (recentSurvey != null) {
        document.getElementById("user-mood").value = recentSurvey.mood;
        document.getElementById("user-sleep").value = recentSurvey.sleep;
        document.getElementById("user-social").value = recentSurvey.social;
        document.getElementById("user-anxiety").value = recentSurvey.anxiety;
        document.getElementById("user-energy").value = recentSurvey.energy;
        document.getElementById("user-stress").value = recentSurvey.stress;
        document.getElementById("user-hopeful").value = recentSurvey.hopeful;
        document.getElementById("crisis-alert").value = recentSurvey.crisis_alert ? "⚠️" : "👍🏻";
        document.getElementById("wellness-score").value = recentSurvey.wellness_score;
        surveyData = recentSurvey
        return surveyData
      }
    })
    .catch(function (error) {
      console.error(error);
    });
  
  // Esperar un momento para asegurar que los datos estén cargados
  console.log("data-1:", userData, surveyData)
  setTimeout(() => {
    console.log("data-2:", userData, surveyData)
    if (userData && surveyData) {
    let prompt = buildPrompt(userData, surveyData);
    console.log("promt ",prompt)
    document.getElementById("markdown-container").innerHTML = "🖐🏻 Espera un momento... ⏳";
    queryChatGPT(prompt)
      .then(function (backendResponse) {
      console.log(backendResponse);
      // Convierte Markdown a HTML usando la librería "marked"
      const htmlContent = marked.parse(backendResponse);
      // Inserta el HTML resultante en el contenedor
      document.getElementById("markdown-container").innerHTML = htmlContent;
    })
      .catch(function (error) {
      console.error(error);
      document.getElementById("markdown-container").innerHTML = error
    });
    }
  }, 1000);
  
}

async function filterTable(filterText) {
  try {
    let previousData = await getUsers();

    if (previousData != null) {
      let usersMatch = previousData.filter((user) => {
        return (
          user.name.toLowerCase().includes(filterText.toLowerCase()) == true
        );
      });
      console.log(usersMatch);
      showTable(usersMatch);
    }
  } catch (error) {
    console.error(error);
  }
}

function showLoading(show) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const tableContainer = document.getElementById('table-container');
    const noDataMessage = document.getElementById('no-data-message');
    
    if (show) {
        if (loadingSpinner) loadingSpinner.classList.remove('d-none');
        if (tableContainer) tableContainer.classList.add('d-none');
        if (noDataMessage) noDataMessage.classList.add('d-none');
    } else {
        if (loadingSpinner) loadingSpinner.classList.add('d-none');
    }
}

function buildPrompt(userData, surveyData) {
        return `
            Análisis emocional para ${userData.name}:
            - Edad: ${userData.age}
            - Contexto de vulnerabilidad: ${userData.context}
            - Estado de ánimo (1 a 5): ${surveyData.mood}
            - Nivel de ansiedad (1 a 5): ${surveyData.anxiety}
            - Calidad de sueño (1 a 5): ${surveyData.sleep}
            - Conexión social (1 a 5): ${surveyData.social}
            - Nivel de energía (1 a 5): ${surveyData.energy}
            - Nivel de esperanza (1 a 5): ${surveyData.hopeful}
            - Nivel de estrés (1 a 5): ${surveyData.stress}
            - Puntaje de bienestar calculado: ${surveyData.wellness_score}
            - Situación de crisis: ${surveyData.crisis_alert ? 'Sí' : 'No'}

            Por favor, proporciona recomendaciones personalizadas y empáticas para mejorar el bienestar emocional. Se lo mas conciso posible, como mucho dos o tres párrafos, máximo 200 tokens.
        `.trim();
    }

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando vista de usuarios...');
  showViewInfo();
  initializeEventListeners();
});