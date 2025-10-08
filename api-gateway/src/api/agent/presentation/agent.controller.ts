import { ServerResponse } from 'http';
import { getAiResponseWithTools } from '../domain/services/ai.service';
import { sendResponse } from '../../../shared/utils/http/http.utils';
import { Request } from '../../../core/interfaces/http.interface';

export async function agentController(req: Request, res: ServerResponse) {
  try {
    const { text } = req.body;
    if (!text) {
      return sendResponse({
        res,
        status: 400,
        data: { error: { message: 'text query parameter is required' } },
      });
    }
    const result = await getAiResponseWithTools(String(text));
    return sendResponse({
      res,
      status: 200,
      data: result,
    });
  } catch (error) {
    // Manejo de errores centralizado
    const errorMessage = error instanceof Error ? error.message : 'Error generating orders with AI';

    return sendResponse({
      res,
      status: 500,
      data: {
        error: { message: errorMessage },
      },
    });
  }
}
