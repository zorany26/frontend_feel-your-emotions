import { getUsers } from '/src/services/userService.js';
import { getSurveyQuestions, createSurvey } from '/src/services/surveyService.js';

let questions = [];
let users = [];

async function initSurvey() {
    console.log('Inicializando controlador de encuesta...');
    try {
        users = await loadUsers();
        questions = await loadQuestions();
        setupEventListeners();
        setCurrentYear();
        console.log('Controlador de encuesta inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar controlador de encuesta:', error);
        showError('Error al cargar la encuesta. Por favor recarga la página.');
    }
}

async function loadUsers() {
    try {
        const userList = await getUsers();
        populateUserSelect(userList);
        return userList;
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        showError('Error al cargar la lista de usuarios.');
        return [];
    }
}

async function loadQuestions() {
    try {
        const questionList = await getSurveyQuestions();
        console.log('Preguntas de la encuesta cargadas:', questionList);
        renderQuestions(questionList);
        return questionList;
    } catch (error) {
        console.error('Error al cargar preguntas:', error);
        showError('Error al cargar las preguntas de la encuesta.');
    }
}

function populateUserSelect(userList) {
    const userSelect = document.getElementById('username');
    if (!userSelect) return;
    userSelect.innerHTML = '<option value="">Selecciona un usuario</option>';
    userList.forEach(user => {
        const option = document.createElement('option');
        option.value = user.user_id;
        option.textContent = user.name;
        userSelect.appendChild(option);
    });
}

function renderQuestions(questionList) {
    const container = document.getElementById('questions-container');
    const questionMin = 1;
    const questionMax = 5;
    if (!container) return;
    container.innerHTML = '';
    const questionIndexes = Object.keys(questionList);
    questionIndexes.forEach((index) => {
        const question = questionList[index];
        console.log('Renderizando pregunta:', question, "índice:", index);
        const questionDiv = document.createElement('div');
        questionDiv.className = 'mb-4';
        const questionId = `question_${index}`;
        const outputId = `output_${index}`;
        questionDiv.innerHTML = `
            <fieldset>
                <legend class="col-form-label">${question} *</legend>
                <div class="d-flex gap-2 flex-wrap align-items-center">
                    <div class="container d-flex justify-content-between w-100 mb-1">
                        <span class="align-self-start small text-muted">${questionMin}</span>
                        <span class="align-self-end small text-muted">${questionMax}</span>
                    </div>
                    <input 
                        type="range" 
                        id="${questionId}" 
                        name="${index}" 
                        min="${questionMin}" 
                        max="${questionMax}" 
                        value="${Math.ceil((questionMin + questionMax) / 2)}" 
                        class="form-range flex-grow-1" 
                        aria-valuemin="${questionMin}" 
                        aria-valuemax="${questionMax}"
                        required>
                    <output for="${questionId}" id="${outputId}" class="badge bg-primary min-width-40">
                        ${Math.ceil((questionMin + questionMax) / 2)}
                    </output>
                </div>
                <div class="invalid-feedback">Por favor responde esta pregunta.</div>
            </fieldset>
        `;
        container.appendChild(questionDiv);
        // Agregar event listener para actualizar el valor mostrado
        const rangeInput = questionDiv.querySelector(`#${questionId}`);
        const output = questionDiv.querySelector(`#${outputId}`);
        rangeInput.addEventListener('input', () => {
            output.textContent = rangeInput.value;
        });
    });
}

function setupEventListeners() {
    const surveyForm = document.getElementById('survey-form');
    if (!surveyForm) {
        console.error('Formulario de encuesta no encontrado');
        return;
    }
    surveyForm.addEventListener('submit', handleSubmit);
    surveyForm.addEventListener('reset', handleReset);
}

async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }
    const formData = new FormData(e.target);
    const surveyData = processSurveyData(formData);
    try {
        await createSurvey(surveyData);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: "¡Gracias!",
                text: "Tu encuesta ha sido registrada exitosamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            alert('¡Gracias por completar la encuesta!');
        }
        e.target.reset();
    } catch (error) {
        console.error('Error al enviar encuesta:', error);
        showError('Error al enviar la encuesta. Por favor intenta nuevamente.');
    }
}

function processSurveyData(formData) {
    const data = Object.fromEntries(formData.entries());
    console.log('Datos del formulario procesados:', data);
    const surveyData = {
        user_id: data.username,
        survey_type: data.frequency,
        mood: data.mood,
        anxiety: data.anxiety,
        sleep:  data.sleep,
        social: data.social,
        energy: data.energy,
        stress: data.stress,
        hopeful: data.hopeful
    };
    return surveyData;
}

function validateForm() {
    const form = document.getElementById('survey-form');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    requiredFields.forEach(field => {
        const isFieldValid = field.checkValidity();
        if (!isFieldValid) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    if (!isValid) {
        showError('Por favor completa todos los campos requeridos.');
    }
    return isValid;
}

function handleReset() {
    const form = document.getElementById('survey-form');
    const invalidFields = form.querySelectorAll('.is-invalid');
    const outputs = form.querySelectorAll('output');
    invalidFields.forEach(field => field.classList.remove('is-invalid'));
    outputs.forEach(output => {output.textContent = '3';});
}


function showError(message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: "Error",
            text: message,
            icon: "error"
        });
    } else {
        alert(message);
    }
}

function setCurrentYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

document.addEventListener('DOMContentLoaded', initSurvey);