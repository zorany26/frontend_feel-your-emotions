const URL = "http://localhost:8000/api/user";

export async function createUser(newUser) {
    let postRequest = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser)
    };

    let serverResponse = await fetch(URL, postRequest);
    let user = await serverResponse.json();
    return user;
}

export async function generateRandomUsers() {
    let postRequest = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    };

    let serverResponse = await fetch(URL + 's/random', postRequest);
    let message = await serverResponse.text();
    return message;
}

export async function getUserById(id) {
    let getRequest = {
        method: "GET",
    };

    let serverResponse = await fetch(URL + "/" + id, getRequest);
    let user = await serverResponse.json();
    return user;
}

export async function getUsers() {
    let getRequest = {
        method: "GET",
    };

    let serverResponse = await fetch(URL + 's', getRequest);
    let users = await serverResponse.json();
    return users;
}

export async function updateUser(user, id) {
    let putRequest = {
        headers: {
        method: "PUT",
        "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
    };

    let serverResponse = await fetch(URL + "/" + id, putRequest);
    let userUpdated = await serverResponse.json();
    return userUpdated;
}

export async function deleteUserById(id) {
    let deleteRequest = {
    method: "DELETE",
    };

    let serverResponse = await fetch(URL + "/" + id, deleteRequest);
    let response = await serverResponse.json();
    return response;
}