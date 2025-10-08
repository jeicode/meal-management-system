// src/services/ai.service.ts

import { GoogleGenAI, FunctionDeclaration } from '@google/genai';
import { sanitizeFunctionName } from '../../utils/ai.utils';
import { environment } from '../../../../config/environment.config';
import { mcpClient } from '../../../../config/mcp-client.config';

const SYSTEM_INSTRUCTION = `
ERES UN ASISTENTE PROACTIVO Y AUTÓNOMO.

REGLA CRÍTICA: NUNCA preguntes por detalles no esenciales (como nombres, colores, o preferencias si pueden ser asumidas) si el usuario te pide una creación. Si un detalle falta, **SIEMPRE invéntalo**.

EJEMPLO: Si el usuario dice 'crea un plato random', la respuesta debe ser la creación completa (incluyendo nombre y detalles) en un solo paso. NO respondas '¿Qué nombre quieres que le ponga?'.

SOLO puedes preguntar si la información es ABSOLUTAMENTE CRÍTICA y no se puede inferir o inventar, como credenciales de seguridad o una decisión que comprometa el flujo de la conversación.
`;

const ai = new GoogleGenAI({
  apiKey: environment.GOOGLE_API_KEY,
});

const AI_MODEL = 'gemini-2.0-flash';
let conversationHistory = '';

/**
 * Interfaz para el resultado de la ejecución de una herramienta.
 */
interface ToolResult {
  name: string; // Nombre sanitizado
  originalName: string; // Nombre original de la herramienta MCP
  response: any; // Respuesta de la herramienta
}

/**
 * Procesa la lógica completa de la orquestación de llamadas a Gemini,
 * incluyendo la detección, ejecución y respuesta final con herramientas.
 *
 * @param text El texto de la consulta del usuario.
 * @returns Un objeto con la respuesta final de la IA y la información de las herramientas usadas.
 */
export async function getAiResponseWithTools(
  text: string,
): Promise<{ data: string; toolsUsed?: string[]; toolResults?: ToolResult[] }> {
  // 1. Obtener y preparar las herramientas
  const toolsResponse = await mcpClient.listTools();
  const nameMap = new Map<string, string>(); // Mapa para des-sanitizar

  const functionDeclarations: FunctionDeclaration[] = toolsResponse.tools.map(tool => {
    const sanitizedName = sanitizeFunctionName(tool.name);
    nameMap.set(sanitizedName, tool.name);

    return {
      name: sanitizedName,
      description: tool.description || '',
      parameters: tool.inputSchema as any,
    };
  });

  // 2. Primera llamada a Gemini (detección de herramientas)
  const response = await ai.models.generateContent({
    model: AI_MODEL,
    contents: text,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [
        {
          functionDeclarations: functionDeclarations,
        },
      ],
    },
  });

  const functionCalls = response.functionCalls;

  // 3. Manejo de llamadas a funciones
  if (functionCalls && functionCalls.length > 0) {
    console.log(
      'Function calls detected:',
      functionCalls.map(fc => fc.name),
    );

    // Ejecuta las herramientas en paralelo
    const toolResults: ToolResult[] = await Promise.all(
      functionCalls.map(async functionCall => {
        const sanitizedName = functionCall.name || '';
        const originalName = nameMap.get(sanitizedName) || sanitizedName;

        const toolResult = await mcpClient.callTool(originalName, functionCall.args || {});

        return {
          name: sanitizedName,
          originalName: originalName,
          response: toolResult.content,
        };
      }),
    );

    // 4. Construir el historial y Segunda llamada a Gemini (respuesta final)
    conversationHistory += text + '\n\n';

    functionCalls.forEach((fc, index) => {
      conversationHistory += `[Function Call: ${fc.name}]\n`;
      conversationHistory += `Arguments: ${JSON.stringify(fc.args)}\n`;
      conversationHistory += `Result: ${JSON.stringify(toolResults[index].response)}\n\n`;
    });

    const finalResponse = await ai.models.generateContent({
      model: AI_MODEL,
      contents: conversationHistory,
      config: {
        systemInstruction:
          "You are a helpful assistant. Use the function call results provided above to answer the user's question accurately.",
      },
    });

    return {
      data: finalResponse.text || '',
      toolsUsed: toolResults.map(r => r.originalName),
      toolResults: toolResults,
    };
  }

  // 5. Respuesta sin usar herramientas
  return {
    data: response.text || '',
  };
}
