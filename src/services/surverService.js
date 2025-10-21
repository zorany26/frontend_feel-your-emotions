const URL = "http://localhost:8000/api/survey";

export async function createSurvey(newSurvey) {
    let postRequest = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newSurvey),
    };

    let serverResponse = await fetch(URL, postRequest);
    let survey = await serverResponse.json();
    return survey;
}

export async function getSurveyQuestions() {
    let getRequest = {
        method: "GET",
    };

    let serverResponse = await fetch(URL + "/questions", getRequest);
    let questions = await serverResponse.json();
    return questions;
}

export async function getSurveyById(id) {
    let getRequest = {
        method: "GET",
    };

    let serverResponse = await fetch(URL + "/" + id, getRequest);
    let survey = await serverResponse.json();
    return survey;
}

export async function getSurveys() {
    let getRequest = {
        method: "GET",
    };

    let serverResponse = await fetch(URL + 's', getRequest);
    let surveys = await serverResponse.json();
    return surveys;
}

export async function getSurveysByUserId(id) {
    let getRequest = {
        method: "GET",
    };

    let serverResponse = await fetch(URL + 's/user/' + id, getRequest);
    let surveys = await serverResponse.json();
    return surveys;
}

export async function getCrisisSurveys() {
    let getRequest = {
        method: "GET",
    };

    let serverResponse = await fetch(URL + 's/crisis', getRequest);
    let surveys = await serverResponse.json();
    return surveys;
}

export async function updateSurvey(survey, id) {
    let putRequest = {
        headers: {
        method: "PUT",
        "Content-Type": "application/json",
    },
    body: JSON.stringify(survey),
    };

    let serverResponse = await fetch(URL + "/" + id, putRequest);
    let surveyUpdated = await serverResponse.json();
    return surveyUpdated;
}

export async function deleteSurveyById(id) {
    let deleteRequest = {
    method: "DELETE",
    };

    let serverResponse = await fetch(URL + "/" + id, deleteRequest);
    let response = await serverResponse.json();
    return response;
}