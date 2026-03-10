'use server';
/**
 * @fileOverview Um fluxo Genkit para fornecer insights personalizados sobre o ciclo menstrual.
 *
 * - personalizedCycleInsights - Uma função que analisa os dados do ciclo menstrual, sintomas e humor
 *   para gerar insights personalizados, correlações e sugestões de bem-estar.
 * - PersonalizedCycleInsightsInput - O tipo de entrada para a função personalizedCycleInsights.
 * - PersonalizedCycleInsightsOutput - O tipo de retorno para a função personalizedCycleInsights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Esquema de entrada para o fluxo de insights personalizados do ciclo.
 * Contém os dados necessários para que a IA analise o ciclo da usuária.
 */
const PersonalizedCycleInsightsInputSchema = z.object({
  lastMenstruationDate: z
    .string()
    .describe('Data da última menstruação no formato YYYY-MM-DD.'),
  flowDurationDays: z
    .number()
    .int()
    .describe('Duração típica da menstruação em dias.'),
  cycleLengthDays: z
    .number()
    .int()
    .describe('Duração típica do ciclo menstrual em dias.'),
  currentCycleDay: z
    .number()
    .int()
    .describe(
      'O dia atual do ciclo menstrual (ex: 1 para o primeiro dia da menstruação).'
    ),
  loggedData: z
    .array(
      z.object({
        date: z
          .string()
          .describe('Data do registro no formato YYYY-MM-DD.'),
        flowIntensity: z
          .enum(['nenhum', 'leve', 'médio', 'intenso'])
          .optional()
          .describe(
            'Intensidade do fluxo menstrual: "nenhum", "leve", "médio" ou "intenso".'
          ),
        symptoms: z
          .array(z.string())
          .optional()
          .describe(
            'Lista de sintomas experientes neste dia (ex: "dor de cabeça", "cólicas").'
          ),
        mood: z
          .enum(["feliz", "neutra", "triste", "irritada", "ansiosa", "energizada", "cansada", "outros"])
          .optional()
          .describe(
            'Humor neste dia (ex: "feliz", "neutra", "triste", "irritada").'
          ),
      })
    )
    .describe(
      'Uma lista de registros diários do ciclo atual e ciclos recentes, incluindo fluxo, sintomas e humor.'
    ),
});
export type PersonalizedCycleInsightsInput = z.infer<
  typeof PersonalizedCycleInsightsInputSchema
>;

/**
 * Esquema de saída para o fluxo de insights personalizados do ciclo.
 * Contém os insights, correlações e sugestões de bem-estar gerados pela IA.
 */
const PersonalizedCycleInsightsOutputSchema = z.object({
  insights: z
    .array(z.string())
    .describe('Observações e tendências personalizadas sobre o ciclo da usuária.'),
  correlations: z
    .array(z.string())
    .describe(
      'Conexões observadas entre sintomas, humor e fases do ciclo (menstruação, folicular, ovulação, lútea/TPM).'
    ),
  wellnessSuggestions: z
    .array(z.string())
    .describe('Recomendações práticas e gentis para gerenciar o ciclo e melhorar o bem-estar.'),
});
export type PersonalizedCycleInsightsOutput = z.infer<
  typeof PersonalizedCycleInsightsOutputSchema
>;

/**
 * Define o prompt Genkit que a IA usará para gerar insights do ciclo.
 * O prompt inclui instruções claras e formata os dados de entrada para a IA.
 */
const personalizedCycleInsightsPrompt = ai.definePrompt({
  name: 'personalizedCycleInsightsPrompt',
  input: { schema: PersonalizedCycleInsightsInputSchema },
  output: { schema: PersonalizedCycleInsightsOutputSchema },
  // O texto do prompt em Handlebars. Ele usa as variáveis definidas no esquema de entrada.
  // A IA agirá como uma assistente de saúde feminina.
  prompt: `Você é uma assistente especializada em saúde feminina e monitoramento de ciclo menstrual. Sua função é analisar os dados fornecidos e oferecer insights personalizados, possíveis correlações e sugestões de bem-estar de forma encorajadora e fácil de entender.

Aqui estão os dados da usuária:
- Data da última menstruação: {{{lastMenstruationDate}}}
- Duração típica da menstruação: {{{flowDurationDays}}} dias
- Duração típica do ciclo: {{{cycleLengthDays}}} dias
- Dia atual do ciclo: {{{currentCycleDay}}} (onde o dia 1 é o início da última menstruação)

Registros diários recentes e do ciclo atual:
{{#if loggedData}}
  {{#each loggedData}}
    - Data: {{{date}}},
      {{#if flowIntensity}}Fluxo: {{{flowIntensity}}}, {{/if}}
      {{#if mood}}Humor: {{{mood}}}, {{/if}}
      {{#if symptoms}}Sintomas: {{#each symptoms}}"{{this}}" {{/each}}{{else}}nenhum{{/if}}
  {{/each}}
{{else}}
  Nenhum registro diário detalhado fornecido. Forneça insights gerais com base nos dados do ciclo.
{{/if}}

Com base nessas informações, forneça:

1.  **Insights Personalizados:** Observações sobre o ciclo da usuária, tendências ou padrões específicos que você identificou. Por exemplo, "Você tende a sentir cólicas mais intensas no Dia X do seu ciclo" ou "Seu humor costuma ser 'irritada' nos dias que antecedem a menstruação."
2.  **Possíveis Correlações:** Conexões entre sintomas, humor e fases do ciclo (menstruação, folicular, ovulação, lútea/TPM). Por exemplo, "Dor de cabeça e fadiga podem estar correlacionados com o início da sua fase lútea."
3.  **Sugestões de Bem-Estar:** Recomendações práticas e gentis para gerenciar o ciclo e melhorar o bem-estar, considerando a fase atual do ciclo e os padrões observados. Por exemplo, "Considerando que você está na fase de ovulação, atividades físicas moderadas podem ser benéficas."

Responda em português brasileiro.`,
});

/**
 * Define o fluxo Genkit para gerar insights personalizados do ciclo menstrual.
 * Este fluxo invoca o prompt definido acima com os dados de entrada da usuária.
 */
const personalizedCycleInsightsFlow = ai.defineFlow(
  {
    name: 'personalizedCycleInsightsFlow',
    inputSchema: PersonalizedCycleInsightsInputSchema,
    outputSchema: PersonalizedCycleInsightsOutputSchema,
  },
  async (input) => {
    // Chama o prompt com os dados de entrada fornecidos.
    // A IA processará esses dados e retornará os insights, correlações e sugestões.
    const { output } = await personalizedCycleInsightsPrompt(input);
    // Retorna o resultado gerado pela IA.
    return output!;
  }
);

/**
 * Função wrapper exportada para chamar o fluxo personalizedCycleInsightsFlow.
 * Esta é a função que será chamada pelo código do frontend (Next.js).
 *
 * @param input Os dados de entrada para a análise do ciclo menstrual.
 * @returns Uma Promise que resolve para os insights personalizados do ciclo.
 *
 * Como este arquivo é chamado por outro:
 * No frontend (componente React, por exemplo), você importaria esta função:
 * `import { personalizedCycleInsights } from '@/ai/flows/personalized-cycle-insights';`
 * E então a chamaria:
 * `const insights = await personalizedCycleInsights({ /* seus dados aqui */ });`
 *
 * Onde modificar funções e textos:
 * - Para alterar a lógica de como os insights são gerados, modifique o texto do `prompt`
 *   na definição de `personalizedCycleInsightsPrompt` acima.
 * - Para alterar o formato dos dados de entrada ou saída, modifique `PersonalizedCycleInsightsInputSchema`
 *   e `PersonalizedCycleInsightsOutputSchema` respectivamente.
 */
export async function personalizedCycleInsights(
  input: PersonalizedCycleInsightsInput
): Promise<PersonalizedCycleInsightsOutput> {
  return personalizedCycleInsightsFlow(input);
}
