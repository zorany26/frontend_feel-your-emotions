import {
  getUsers,
  getUserById,
} from "/src/services/userService.js";

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

  getUserById(id)
    .then(function (backendResponse) {
      console.log(backendResponse);
      if (userNameH1) userNameH1.textContent = backendResponse.name;
      if (userAgeInput) userAgeInput.value = backendResponse.age;
      if (userGenderInput) userGenderInput.value = backendResponse.gender;
      if (userContextTextArea) userContextTextArea.value = backendResponse.context;
    })
    .catch(function (error) {
      console.error(error);
    });
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

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando vista de usuarios...');
  showViewInfo();
  initializeEventListeners();
});