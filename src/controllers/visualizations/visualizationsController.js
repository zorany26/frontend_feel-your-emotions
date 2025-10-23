import { getUsers } from "/src/services/userService.js";
import { getVisualizationByGraph } from "/src/services/visualizationsService.js";

// --- Referencias principales ---
let visualizationTypeSelect = document.getElementById("visualization-type");
let chartContainer = document.getElementById("chart-container");
let svg = null;

// --- Botones de zoom ---
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const resetBtn = document.getElementById("zoom-reset");

// --- Variables de control ---
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX, startY;
let containerRect;

// --- Función para aplicar transformaciones ---
function updateTransform() {
  if (!svg) return;
  svg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
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
  if (svg) svg.style.cursor = "grab";
}

// --- Cargar y preparar el SVG dinámico ---
function showVisualization(selectedGraph = "mood-distribution") {
  getVisualizationByGraph(selectedGraph)
    .then((backendResponse) => {
      // Limpia el contenedor
      chartContainer.innerHTML = "";

      // 🔹 Convierte el texto SVG en un DOM real
      const parser = new DOMParser();
      const doc = parser.parseFromString(backendResponse, "image/svg+xml");
      svg = doc.documentElement;

      // 🔹 Inserta el SVG en el contenedor
      chartContainer.appendChild(svg);

      // Calcula tamaño del contenedor
      containerRect = chartContainer.getBoundingClientRect();

      // Reinicia transformaciones
      zoomLevel = 1;
      panX = 0;
      panY = 0;
      updateTransform();

      // Limpia listeners previos
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      // --- Eventos de paneo ---
      svg.addEventListener("mousedown", (e) => {
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        svg.style.cursor = "grabbing";
      });

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    })
    .catch((error) => {
      console.error(error);
    });
}

// --- Selector de visualización ---
visualizationTypeSelect.addEventListener("change", () => {
  const selectedGraph = visualizationTypeSelect.value;
  console.log("Selected graph:", selectedGraph);
  showVisualization(selectedGraph);
});

// --- Controles de zoom ---
zoomInBtn.addEventListener("click", () => {
  zoomLevel = Math.min(zoomLevel * 1.2, 5);
  limitPan();
  updateTransform();
});

zoomOutBtn.addEventListener("click", () => {
  zoomLevel = Math.max(zoomLevel / 1.2, 0.5);
  limitPan();
  updateTransform();
});

resetBtn.addEventListener("click", () => {
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  updateTransform();
});

// --- Zoom con la rueda del mouse ---
chartContainer.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 1.1 : 0.9;
  zoomLevel = Math.min(Math.max(zoomLevel * delta, 0.5), 5);
  limitPan();
  updateTransform();
});

// --- Inicialización ---
showVisualization();
