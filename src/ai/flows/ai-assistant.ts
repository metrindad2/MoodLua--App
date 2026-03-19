'use server';
/**
 * @fileOverview Um fluxo Genkit para um assistente de IA geral sobre saúde feminina.
 *
 * - aiAssistant - A função principal que responde às perguntas da usuária.
 * - AiAssistantInput - O tipo de entrada, contendo a pergunta e o histórico.
 * - Message - A estrutura de uma única mensagem no histórico.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define a estrutura de uma mensagem, que pode ser do usuário ou da assistente.
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

// Define a estrutura da entrada para o nosso fluxo de IA.
// Inclui o histórico do chat e a nova pergunta da usuária.
const AiAssistantInputSchema = z.object({
  history: z.array(MessageSchema).optional(),
  question: z.string(),
});
export type AiAssistantInput = z.infer<typeof AiAssistantInputSchema>;

// O prompt que instrui a IA sobre como se comportar.
// É aqui que definimos a "personalidade" e as regras da nossa assistente.
const assistantPrompt = ai.definePrompt({
  name: 'aiAssistantPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  // O sistema é uma instrução de alto nível que a IA sempre seguirá.
  system: `Você é uma assistente de IA do aplicativo MoodLua, especializada em saúde e bem-estar feminino.
Sua personalidade é acolhedora, empática e informativa.
Responda às perguntas de forma clara, educativa e segura.
NUNCA forneça conselhos médicos, diagnósticos ou prescrições.
Sempre que uma pergunta parecer de natureza médica, recomende fortemente que a usuária consulte um(a) profissional de saúde qualificado(a).
Se a pergunta for sobre segurança pessoal ou emergências, reforce a importância de usar a função SOS do app e contatar as autoridades ou pessoas de confiança.
Mantenha as respostas concisas e fáceis de entender.`,
  // A entrada do prompt é apenas a pergunta atual.
  input: { schema: z.object({ question: z.string() }) },
  // O prompt principal agora é mais simples. O histórico é gerenciado pelo Genkit.
  prompt: `{{{question}}}`,
});

// O fluxo Genkit que orquestra a chamada para a IA.
const aiAssistantFlow = ai.defineFlow(
  {
    name: 'aiAssistantFlow',
    inputSchema: AiAssistantInputSchema,
    outputSchema: z.string(), // A saída será apenas o texto da resposta.
  },
  async (input) => {
    // Converte o histórico do nosso app para o formato que o Genkit espera.
    const history = input.history?.map(msg => ({
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        content: [{ text: msg.content }]
    })) || [];
      
    // Chama o prompt com os dados de entrada.
    const response = await ai.generate({
      prompt: assistantPrompt,
      // O histórico é passado para a função `generate` para gerenciar a conversa.
      history: history,
      // O `input` para o prompt é apenas a pergunta.
      input: { question: input.question },
    });
    // Retorna o texto da resposta gerada pela IA.
    return response.text;
  }
);

/**
 * Função wrapper que será chamada pelo nosso frontend.
 * Ela encapsula a chamada ao fluxo Genkit.
 *
 * @param input Os dados de entrada contendo a pergunta e o histórico.
 * @returns Uma Promise que resolve para a resposta em string da IA.
 */
export async function aiAssistant(input: AiAssistantInput): Promise<string> {
  return aiAssistantFlow(input);
}
