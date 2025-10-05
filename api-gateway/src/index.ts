import { environment } from "./config/environment.config";
import { runServer } from "./config/http-server.config";
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});

runServer({ PORT: environment.PORT });

// const mcpServer = new McpServer({ name: "supabase-mcp", version: "1.0.0" });



async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: "dame las 3 mejores recetas de pollo",
        config: {
            thinkingConfig: {
                thinkingBudget: 0, // Disables thinking
            },
        }

    });
    console.log(response.text);
}


main();