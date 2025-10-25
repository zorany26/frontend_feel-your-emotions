import { getUsers } from '/src/services/userService.js';
import { getSurveys, getCrisisSurveys, getSurveysByUserId } from '/src/services/surveyService.js';

let surveys = [];
let users = [];
let currentFilter = 'all';

async function initReports() {
    console.log('Inicializando controlador de reportes...');
    try {
        users = await loadUsers();
        await loadAllSurveys();
        setupEventListeners();
        setCurrentYear();
        console.log('Controlador de reportes inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar controlador de reportes:', error);
        showError('Error al cargar los reportes. Por favor recarga la página.');
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

function populateUserSelect(userList) {
    const userSelect = document.getElementById('user-select');
    if (!userSelect) return;
    
    userSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
    userList.forEach(user => {
        const option = document.createElement('option');
        option.value = user.user_id;
        option.textContent = user.name;
        userSelect.appendChild(option);
    });
}

async function loadAllSurveys() {
    try {
        showLoading(true);
        const surveyList = await getSurveys();
        surveys = surveyList;
        currentFilter = 'all';
        updateFilterInfo('Todas las encuestas');
        renderSurveys(surveys);
        showLoading(false);
    } catch (error) {
        console.error('Error al cargar encuestas:', error);
        showError('Error al cargar las encuestas.');
        showLoading(false);
        renderNoData();
    }
}

async function loadCrisisSurveys() {
    try {
        showLoading(true);
        const crisisSurveys = await getCrisisSurveys();
        surveys = crisisSurveys;
        currentFilter = 'crisis';
        updateFilterInfo('Encuestas en estado de crisis');
        renderSurveys(surveys);
        showLoading(false);
    } catch (error) {
        console.error('Error al cargar encuestas de crisis:', error);
        showError('Error al cargar las encuestas de crisis.');
        showLoading(false);
        renderNoData();
    }
}

async function loadSurveysByUser(userId) {
    if (!userId) {
        showError('Por favor selecciona un usuario.');
        return;
    }
    
    try {
        showLoading(true);
        const userSurveys = await getSurveysByUserId(userId);
        surveys = userSurveys;
        currentFilter = `user_${userId}`;
        
        const selectedUser = users.find(user => user.user_id == userId);
        const userName = selectedUser ? selectedUser.name : userId;
        updateFilterInfo(`Encuestas del usuario: ${userName}`);
        
        renderSurveys(surveys);
        showLoading(false);
    } catch (error) {
        console.error('Error al cargar encuestas del usuario:', error);
        showError('Error al cargar las encuestas del usuario.');
        showLoading(false);
        renderNoData();
    }
}

function renderSurveys(surveyList) {
    const tbody = document.getElementById('surveys-tbody');
    const totalCount = document.getElementById('total-count');
    const noDataMessage = document.getElementById('no-data-message');
    const tableContainer = document.getElementById('table-container');
    
    if (!tbody || !totalCount) return;
    
    if (surveyList.length === 0) {
        renderNoData();
        return;
    }
    
    // Mostrar tabla y ocultar mensaje de no datos
    tableContainer.classList.remove('d-none');
    noDataMessage.classList.add('d-none');
    
    // Actualizar contador
    totalCount.textContent = `${surveyList.length} encuesta${surveyList.length !== 1 ? 's' : ''}`;
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    surveyList.forEach(survey => {
        let user_name
        users.forEach(user => {
            if (user.user_id === survey.user_id) {
                user_name = user.name;
        }});
        const row = document.createElement('tr');
        
        // Formatear fecha
        const date = formatDate(survey.date);
        
        row.innerHTML = `
            <td>${user_name}</td>
            <td>${date}</td>
            <td>${survey.survey_type}</td>
            <td>${survey.wellness_score}</td>
            <td>${survey.crisis_alert ? '⚠️' : '👍🏻'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="showSurveyDetail('${survey.survey_id}')">
                    Ver Detalles
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function renderNoData() {
    const tbody = document.getElementById('surveys-tbody');
    const noDataMessage = document.getElementById('no-data-message');
    const tableContainer = document.getElementById('table-container');
    const totalCount = document.getElementById('total-count');
    
    if (tbody) tbody.innerHTML = '';
    if (totalCount) totalCount.textContent = '0 encuestas';
    
    if (tableContainer) tableContainer.classList.add('d-none');
    if (noDataMessage) noDataMessage.classList.remove('d-none');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

function showSurveyDetail(surveyId) {
    const survey = surveys.find(s => s.survey_id  == surveyId);
    let user_name
    users.forEach(user => {
        if (user.user_id === survey.user_id) {
            user_name = user.name;
    }});
    console.log('Mostrando detalles de la encuesta:', surveyId, survey);
    if (!survey) {
        showError('No se pudo encontrar la encuesta.');
        return;
    }
    
    const modalBody = document.getElementById('modal-body-content');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Información General</h6>
                <ul class="list-unstyled">
                    <li><strong>Usuario:</strong> ${user_name}</li>
                    <li><strong>Fecha:</strong> ${formatDate(survey.date)}</li>
                    <li><strong>Periodicidad:</strong> ${survey.survey_type}</li>
                    <li><strong>Puntaje Bienestar:</strong> ${survey.wellness_score}</li>
                    <li><strong>Alerta de crisis:</strong> ${survey.crisis_alert ? '⚠️' : '👍🏻'}</li>
                </ul>
            </div>
            <div class="col-md-6">
                <h6>Respuestas</h6>
                <ul class="list-unstyled">
                    <li><strong>Ánimo:</strong> ${survey.mood}</li>
                    <li><strong>Ansiedad:</strong> ${survey.anxiety}</li>
                    <li><strong>Calidad de sueño:</strong> ${survey.sleep}</li>
                    <li><strong>Conexión social:</strong> ${survey.social}</li>
                    <li><strong>Energía:</strong> ${survey.energy}</li>
                    <li><strong>Estrés:</strong> ${survey.stress}</li>
                    <li><strong>Esperanza:</strong> ${survey.hopeful}</li>
                </ul>
            </div>
        </div>
        ${survey.comments ? `
            <div class="mt-3">
                <h6>Comentarios</h6>
                <div class="alert alert-light">
                    ${survey.comments}
                </div>
            </div>
        ` : ''}
    `;
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('surveyDetailModal'));
    modal.show();
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

function updateFilterInfo(filterText) {
    const filterInfo = document.getElementById('filter-info');
    const filterTextElement = document.getElementById('filter-text');
    
    if (filterInfo && filterTextElement) {
        filterTextElement.textContent = filterText;
        filterInfo.classList.remove('d-none');
    }
}

function setupEventListeners() {
    // Botón mostrar todas
    const showAllBtn = document.getElementById('show-all-btn');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', loadAllSurveys);
    }
    
    // Botón mostrar crisis
    const showCrisisBtn = document.getElementById('show-crisis-btn');
    if (showCrisisBtn) {
        showCrisisBtn.addEventListener('click', loadCrisisSurveys);
    }
    
    // Botón filtrar por usuario
    const showByUserBtn = document.getElementById('show-by-user-btn');
    const userSelect = document.getElementById('user-select');
    if (showByUserBtn && userSelect) {
        showByUserBtn.addEventListener('click', () => {
            const userId = userSelect.value;
            loadSurveysByUser(userId);
        });
    }
    
    // Botón actualizar
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            switch (currentFilter) {
                case 'all':
                    loadAllSurveys();
                    break;
                case 'crisis':
                    loadCrisisSurveys();
                    break;
                default:
                    if (currentFilter.startsWith('user_')) {
                        const userId = currentFilter.replace('user_', '');
                        loadSurveysByUser(userId);
                    } else {
                        loadAllSurveys();
                    }
            }
        });
    }
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

// Hacer la función global para poder usarla desde el HTML
window.showSurveyDetail = showSurveyDetail;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initReports);