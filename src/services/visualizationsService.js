const URL = "http://localhost:8000/api/visualization";

export async function getVisualizationByGraph(graphType) {
    const allowedTypes = [
        'mood-distribution',
        'trend-analysis',
        'correlation-heatmap',
        'risk-analysis',
        'context-analysis'
    ];
    if (!allowedTypes.includes(graphType)) {
        throw new Error(`Tipo de visualización no permitido: ${graphType}`);
    }
    let getRequest = {
        method: "GET",
        headers: {
            "Accept": "image/svg+xml",
        }
    };

    let serverResponse = await fetch(URL + "/" + graphType , getRequest);
    if (!serverResponse.ok) throw new Error("No se pudo obtener el SVG");
    let svgText = await serverResponse.text();
    return svgText;
}