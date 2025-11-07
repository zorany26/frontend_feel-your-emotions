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
        Swal.fire({
            title: "Espera un momento",
            text: "Los usuarios de prueba se están generando",
            icon: "info",
            timer: 1500,
            showConfirmButton: false
        });
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
    // Validar que todos los campos requeridos estén presentes
    if (!user.name || !user.age || !user.context) {
        Swal.fire({
            title: "Datos incompletos",
            text: "Todos los campos marcados son requeridos",
            icon: "error"
        });
        return false;
    }

    // Validar el nombre (no vacío y al menos 2 caracteres)
    if (user.name.trim().length < 2) {
        Swal.fire({
            title: "Nombre inválido",
            text: "El nombre debe tener al menos 2 caracteres",
            icon: "error"
        });
        return false;
    }

    // Validar la edad (entre 13 y 25 años)
    if (user.age < 13 || user.age > 25) {
        Swal.fire({
            title: "Edad fuera de rango",
            text: "La edad debe estar entre 13 y 25 años",
            icon: "error"
        });
        return false;
    }

    // Validar el contexto (no vacío y al menos 10 caracteres)
    if (user.context.trim().length < 10) {
        Swal.fire({
            title: "Contexto inválido",
            text: "Por favor, proporciona más detalles en el contexto (mínimo 10 caracteres)",
            icon: "error"
        });
        return false;
    }

    return true;
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initializeUserController);