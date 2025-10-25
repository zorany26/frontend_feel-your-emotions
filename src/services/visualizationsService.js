const URL = "http://localhost:8000/api/";

export async function getVisualizationByGraph(graphType) {
    const allowedTypes = [
        'mood-distribution',
        'gender-analysis',
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

    let serverResponse = await fetch(URL + "visualization/" + graphType , getRequest);
    if (!serverResponse.ok) throw new Error("No se pudo obtener el SVG");
    let svgText = await serverResponse.text();
    return svgText;
}

export async function getDescriptiveStatistics(){
    let getRequest = {
        method: "GET"
    };
    let serverResponse = await fetch(URL + "statistics" , getRequest);
    if (!serverResponse.ok) throw new Error("No se pudo obtener las estadísticas descriptivas");
    let stats = await serverResponse.json();
    return stats;
}