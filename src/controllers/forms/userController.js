import { createUser, generateRandomUsers } from '/src/services/userService.js';

function initializeUserController() {
    const userName = document.getElementById("user_name");
    const userAge = document.getElementById("user_age");
    const vulnerabilityContext = document.getElementById("vulnerability_context");
    const userGender = document.getElementById("user_gender");
    const registerUserButton = document.getElementById("register_user_button");
    const generateUsersButton = document.getElementById("generate_users_button");
    const userForm = document.getElementById("user_form");

    if (!registerUserButton) {
        console.error('Botón de registro no encontrado');
        return;
    }

    console.log('Inicializando controlador de usuario...');

    registerUserButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const user = {
            name: userName?.value || '',
            age: Number(userAge?.value || 0),
            context: vulnerabilityContext?.value || '',
            gender: userGender?.value || 'X'
        };

        if (validateData(user)) {
            try {
                console.dir(user);
                const response = await createUser(user);
                Swal.fire({
                    title: "Registro exitoso",
                    text: "Ya eres parte de Feel Your Emotions",
                    icon: "success"
                });
                if (userForm) {
                    userForm.reset();
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudo registrar el usuario",
                    icon: "error"
                });
            }
        }
    });

    generateUsersButton.addEventListener("click", () => {
        generateRandomUsers()
        .then((response) => {
            console.log(response);
            let jsonResponse = JSON.parse(response);
            let message = `${jsonResponse.count} ${jsonResponse.detail}`;
            console.log(message);
            Swal.fire({
                title: "Registro exitoso",
                text: message,
                icon: "success"
                });
        })
        .catch(() => {
            console.error("Error al crear usuarios de prueba");
            Swal.fire({
                title: "Error",
                text: "No se pudo generar usuarios de prueba",
                icon: "error"
            });
        });
    });

}

function validateData(user) {
    if (!user.name || !user.age || !user.context) {
        Swal.fire({
            title: "Necesitas ingresar datos",
            text: "Ingresa correctamente los campos requeridos",
            icon: "error"
        });
        return false;
    }
    return true;
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initializeUserController);