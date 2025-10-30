const URL = "https://api.openai.com/v1/chat/completions";

const OPENAI_API_KEY = "" //Ingresar API KEY

export async function queryChatGPT(prompt) {
    const response = await fetch(URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres un asistente útil y preciso." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 200
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Error API ChatGPT: ${err}`);
    }

    const data = await response.json();
    // Devuelve el texto generado por ChatGPT
    return data.choices[0]?.message?.content || "No se pudo generar respuesta";
}