import { createUser } from '/src/services/userService.js';

function initializeUserController() {
    const userName = document.getElementById("user_name");
    const userAge = document.getElementById("user_age");
    const vulnerabilityContext = document.getElementById("vulnerability_context");
    const userGender = document.getElementById("user_gender");
    //const userPhone = document.getElementById("user_phone");
    const registerUserButton = document.getElementById("register_user_button");
    const userForm = document.getElementById("user_form");

    if (!registerUserButton) {
        console.error('Register button not found');
        return;
    }

    registerUserButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const user = {
            name: userName.value,
            age: Number(userAge.value),
            context: vulnerabilityContext.value,
            gender: userGender.value
            //phone: userPhone?.value || ''
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
                userForm.reset();
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

// Initialize controller when the module is loaded
initializeUserController();