'use server';
/**
 * @fileOverview Um fluxo Genkit para um assistente de IA de saúde feminina.
 *
 * - aiAssistant - Uma função que recebe uma pergunta e o histórico de um chat
 *   para gerar uma resposta informativa e empática sobre saúde feminina.
 * - AiAssistantInput - O tipo de entrada para a função aiAssistant.
 * - AiAssistantOutput - O tipo de retorno para a função aiAssistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Define a estrutura para cada mensagem no histórico do chat.
 */
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

/**
 * Esquema de entrada para o fluxo do assistente de IA.
 * Contém a pergunta atual da usuária e o histórico da conversa.
 */
const AiAssistantInputSchema = z.object({
  question: z.string().describe('A pergunta atual da usuária.'),
  history: z
    .array(ChatMessageSchema)
    .describe('O histórico da conversa até o momento.'),
});
export type AiAssistantInput = z.infer<typeof AiAssistantInputSchema>;

/**
 * Esquema de saída para o fluxo do assistente de IA.
 * Contém a resposta gerada pela IA.
 */
const AiAssistantOutputSchema = z.object({
  answer: z.string().describe('A resposta da IA para a pergunta da usuária.'),
});
export type AiAssistantOutput = z.infer<typeof AiAssistantOutputSchema>;

/**
 * Define o prompt Genkit que a IA usará para responder às perguntas.
 * O prompt inclui instruções claras sobre o tom, o papel e as limitações da IA.
 */
const aiAssistantPrompt = ai.definePrompt({
  name: 'aiAssistantPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: AiAssistantInputSchema },
  output: { schema: AiAssistantOutputSchema },
  // O texto do prompt em Handlebars.
  prompt: `Você é a assistente de IA do aplicativo MoodLua, focada em saúde feminina e bem-estar. Seu nome é Lua.
Seu tom é empático, informativo e acolhedor, como uma conversa com uma amiga experiente.

**Sua Missão:**
- Responder a dúvidas sobre ciclo menstrual, sintomas, TPM, fertilidade, bem-estar e segurança pessoal.
- Fornecer informações educativas e gerais.
- Encorajar hábitos saudáveis e o autoconhecimento.

**Regras CRÍTICAS:**
1.  **NÃO FORNEÇA ACONSELHAMENTO MÉDICO:** Você não é uma profissional de saúde. Para qualquer questão que se assemelhe a um diagnóstico, prescrição ou tratamento, você DEVE, SEMPRE, instruir a usuária a consultar um médico ou ginecologista. Use frases como: "É muito importante conversar com um médico sobre isso" ou "Para ter certeza, o ideal é buscar a orientação de um profissional de saúde".
2.  **SEGURANÇA PRIMEIRO:** Se a pergunta for sobre uma emergência (ex: violência, risco de vida), sua primeira ação é instruir a usuária a ligar para os serviços de emergência locais (como 190 para polícia ou 180 para a Central de Atendimento à Mulher no Brasil) ou a usar a função SOS do aplicativo.
3.  **SEJA CONCISA:** Responda de forma clara e direta, usando parágrafos curtos e listas quando apropriado.

**Contexto da Conversa:**
Este é o histórico da conversa. Use-o para entender o contexto da pergunta atual.
{{#each history}}
  - {{#if (eq role 'user')}}Usuária{{else}}Lua{{/if}}: {{{content}}}
{{/each}}

**Pergunta Atual da Usuária:**
"{{{question}}}"

Com base em tudo isso, gere uma resposta (answer) para a pergunta da usuária.`,
});

/**
 * Define o fluxo Genkit para o assistente de IA.
 * Este fluxo invoca o prompt definido acima com os dados de entrada.
 */
const aiAssistantFlow = ai.defineFlow(
  {
    name: 'aiAssistantFlow',
    inputSchema: AiAssistantInputSchema,
    outputSchema: AiAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await aiAssistantPrompt(input);
    return output!;
  }
);

/**
 * Função wrapper exportada para chamar o fluxo aiAssistantFlow.
 *
 * @param input Os dados de entrada contendo a pergunta e o histórico.
 * @returns Uma Promise que resolve para a resposta da IA.
 */
export async function aiAssistant(
  input: AiAssistantInput
): Promise<AiAssistantOutput> {
  return aiAssistantFlow(input);
}
