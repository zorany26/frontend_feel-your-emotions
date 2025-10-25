import { getUsers } from "/src/services/userService.js";
import { getVisualizationByGraph } from "/src/services/visualizationsService.js";

// --- Variables de control ---
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX, startY;
let containerRect;

// --- Variables para soporte táctil ---
let isTouch = false;
let initialDistance = 0;
let initialZoom = 1;

// --- Referencias principales ---
let svg = null;
let chartContainer = null;

// --- Función para aplicar transformaciones ---
function updateTransform() {
  if (!svg) return;
  
  console.log(`Aplicando transform: zoom=${zoomLevel.toFixed(2)}, pan=(${panX.toFixed(0)}, ${panY.toFixed(0)})`);
  
  svg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
  svg.style.transformOrigin = "center center";
}

// --- Limita valores dentro de un rango ---
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// --- Limita el paneo al área visible ---
function limitPan() {
  if (!containerRect) return;

  const scaledWidth = containerRect.width * zoomLevel;
  const scaledHeight = containerRect.height * zoomLevel;

  const maxPanX = (scaledWidth - containerRect.width) / 2;
  const maxPanY = (scaledHeight - containerRect.height) / 2;

  panX = clamp(panX, -maxPanX, maxPanX);
  panY = clamp(panY, -maxPanY, maxPanY);
}

// --- Handlers globales para paneo ---
function handleMouseMove(e) {
  if (!isPanning || !svg) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  limitPan();
  updateTransform();
}

function handleMouseUp() {
  isPanning = false;
  isTouch = false;
  if (svg) svg.style.cursor = "grab";
}

// --- Funciones para soporte táctil ---
function getTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function handleTouchStart(e) {
  e.preventDefault();
  isTouch = true;
  
  if (e.touches.length === 1) {
    isPanning = true;
    startX = e.touches[0].clientX - panX;
    startY = e.touches[0].clientY - panY;
  } else if (e.touches.length === 2) {
    isPanning = false;
    initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
    initialZoom = zoomLevel;
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!isTouch || !svg) return;
  
  if (e.touches.length === 1 && isPanning) {
    panX = e.touches[0].clientX - startX;
    panY = e.touches[0].clientY - startY;
    limitPan();
    updateTransform();
  } else if (e.touches.length === 2) {
    const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
    const scale = currentDistance / initialDistance;
    zoomLevel = Math.min(Math.max(initialZoom * scale, 0.5), 5);
    limitPan();
    updateTransform();
  }
}

function handleTouchEnd(e) {
  e.preventDefault();
  if (e.touches.length === 0) {
    isPanning = false;
    isTouch = false;
  } else if (e.touches.length === 1) {
    isPanning = true;
    startX = e.touches[0].clientX - panX;
    startY = e.touches[0].clientY - panY;
  }
}

// --- Función para configurar eventos en SVG existente ---
function setupSVGInteractions() {
  svg = chartContainer?.querySelector('svg');
  
  if (!svg) {
    console.log("No se encontró SVG en el contenedor");
    return;
  }

  console.log("Configurando interacciones para SVG existente");

  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.cursor = "grab";
  svg.style.userSelect = "none";
  svg.style.touchAction = "none";

  containerRect = chartContainer.getBoundingClientRect();

  zoomLevel = 1;
  panX = 0;
  panY = 0;
  updateTransform();

  // --- Eventos de paneo ---
  svg.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    svg.style.cursor = "grabbing";
  });

  // --- Eventos táctiles ---
  svg.addEventListener("touchstart", handleTouchStart, { passive: false });
  svg.addEventListener("touchmove", handleTouchMove, { passive: false });
  svg.addEventListener("touchend", handleTouchEnd, { passive: false });

  // --- Prevenir comportamiento por defecto ---
  svg.addEventListener("dragstart", (e) => e.preventDefault());
  svg.addEventListener("selectstart", (e) => e.preventDefault());
  svg.addEventListener("contextmenu", (e) => e.preventDefault());

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
}

// --- Cargar y preparar el SVG dinámico ---
function showVisualization(selectedGraph = "mood-distribution") {
  if (!chartContainer) return;
  
  getVisualizationByGraph(selectedGraph)
    .then((backendResponse) => {
      chartContainer.innerHTML = "";

      const parser = new DOMParser();
      const doc = parser.parseFromString(backendResponse, "image/svg+xml");
      svg = doc.documentElement;

      chartContainer.appendChild(svg);
      setupSVGInteractions();
    })
    .catch((error) => {
      console.error("Error al cargar la visualización:", error);
      chartContainer.innerHTML = "<p>Error al cargar la visualización</p>";
    });
}

// --- Función para inicializar la vista ---
function initializeVisualizationsView() {
    const visualizationTypeSelect = document.getElementById("visualization-type");
    chartContainer = document.getElementById("chart-container");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const resetBtn = document.getElementById("zoom-reset");

    if (!visualizationTypeSelect || !chartContainer) {
        console.error("Elementos de visualización no encontrados");
        return;
    }

    console.log('Inicializando vista de visualizaciones...');

    // --- Selector de visualización ---
    visualizationTypeSelect.addEventListener("change", () => {
        const selectedGraph = visualizationTypeSelect.value;
        console.log("Selected graph:", selectedGraph);
        showVisualization(selectedGraph);
    });

    // --- Controles de zoom ---
    if (zoomInBtn) {
        zoomInBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            zoomLevel = Math.min(zoomLevel * 1.2, 5);
            limitPan();
            updateTransform();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            zoomLevel = Math.max(zoomLevel / 1.2, 0.5);
            limitPan();
            updateTransform();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            zoomLevel = 1;
            panX = 0;
            panY = 0;
            updateTransform();
        });
    }

    // --- Zoom con la rueda del mouse ---
    chartContainer.addEventListener("wheel", (e) => {
        e.preventDefault();
        
        if (!svg) return;
        
        const rect = chartContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomPointX = (mouseX - rect.width / 2 - panX) / zoomLevel;
        const zoomPointY = (mouseY - rect.height / 2 - panY) / zoomLevel;
        
        const delta = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoomLevel = Math.min(Math.max(zoomLevel * delta, 0.5), 5);
        
        panX = mouseX - rect.width / 2 - zoomPointX * newZoomLevel;
        panY = mouseY - rect.height / 2 - zoomPointY * newZoomLevel;
        
        zoomLevel = newZoomLevel;
        limitPan();
        updateTransform();
    });

    // --- Manejo de redimensionamiento de ventana ---
    window.addEventListener("resize", () => {
        if (svg && chartContainer) {
            containerRect = chartContainer.getBoundingClientRect();
            limitPan();
            updateTransform();
        }
    });

    // Configurar interacciones para SVG existente
    setupSVGInteractions();
    
    // Cargar visualización por defecto
    showVisualization();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initializeVisualizationsView);
