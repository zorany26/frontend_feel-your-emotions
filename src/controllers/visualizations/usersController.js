import {
  getUsers,
  getUserById,
  generateRandomUsers,
} from "/src/services/userService.js";

function showViewInfo() {
  let captionTabla = document.querySelector("caption");
  getUsers()
    .then(function (backendResponse) {
      console.log(backendResponse);
      showTable(backendResponse);
      if (backendResponse.length != 0) {
        captionTabla.innerHTML = "Da click en la fila para ver detalles";
        findInput.removeAttribute("disabled");
      } else {
        captionTabla.innerHTML = "La tabla no cuenta con registros";
        // crear botón para crear nuevo usuario
        let createRandomUsersBtn = document.createElement("button");
        createRandomUsersBtn.classList.add("btn", "btn-primary", "mt-3");
        createRandomUsersBtn.textContent = "Crear usuarios de prueba";
        captionTabla.appendChild(createRandomUsersBtn);
        createRandomUsersBtn.addEventListener("click", () => {
          generateRandomUsers()
            .then((response) => {
              console.log(response);
            })
            .catch(() => {
              console.error("Error al crear usuarios de prueba");
            });
          // borrar botón después de crear usuarios
          createRandomUsersBtn.remove();
        });
      }
    })
    .catch(function (error) {
      console.error(error);
      captionTabla.innerHTML =
        "Hubo un error al traer la información desde el servidor 😕";
    });
}

function showTable(users) {
  let tableBody = document.querySelector("table tbody");
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

let tableBody = document.querySelector("table tbody");
tableBody.addEventListener("click", (event) => {
  let rowId = event.target.parentElement.id;
  console.log(rowId);
  if (rowId.startsWith("usr-")) {
    console.log("Showing modal for", rowId.slice(4));
    showUserWindowModal(rowId.slice(4));
  }
});

function showUserWindowModal(id) {
  let userNameH1 = document.getElementById("user-name");
  let userAgeInput = document.getElementById("user-age");
  let userGenderInput = document.getElementById("user-gender");
  let userContextTextArea = document.getElementById("user-context");

  getUserById(id)
    .then(function (backendResponse) {
      console.log(backendResponse);
      userNameH1.textContent = backendResponse.name;
      userAgeInput.value = backendResponse.age;
      userGenderInput.value = backendResponse.gender;
      userContextTextArea.value = backendResponse.context;
    })
    .catch(function (error) {
      console.error(error);
    });
}

let findInput = document.querySelector("#buscar");

findInput.addEventListener("keyup", () => {
  filterTable(findInput.value);
});

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

showViewInfo();