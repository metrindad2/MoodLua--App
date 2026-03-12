'use client';

import CycleCalendar from '@/components/cycle-calendar';
import { useCycleData } from '@/context/cycle-data-context';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Página do Calendário.
 *
 * Esta página é um "componente de cliente" ('use client') porque precisa interagir
 * com os dados do usuário (que vêm do `localStorage` através do Contexto) e
 * com o estado do componente de calendário.
 *
 * Como funciona:
 * 1. Usa `useCycleData` para obter o perfil da usuária e os logs diários.
 * 2. Se os dados ainda estiverem carregando, exibe um esqueleto de carregamento.
 * 3. Se não houver perfil, mostra uma mensagem para a usuária configurar seu ciclo primeiro.
 * 4. Se houver um perfil, ele usa a função `calculateCycleInfo` para obter as previsões.
 * 5. Finalmente, renderiza o componente `CycleCalendar`, passando todas as informações
 *    necessárias para que ele possa "colorir" os dias corretamente.
 */
export default function CalendarPage() {
  const { userProfile, dailyLogs, loading } = useCycleData();

  if (loading) {
    return <div className="p-4"><Skeleton className="w-full h-[360px] rounded-md" /></div>;
  }

  if (!userProfile) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Por favor, configure seu ciclo na página inicial para ver o calendário.
      </div>
    );
  }

  const cycleInfo = calculateCycleInfo(userProfile);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-primary">Calendário</h2>
      <CycleCalendar cycleInfo={cycleInfo} dailyLogs={dailyLogs} />
      {/* Legenda atualizada para corresponder ao design da imagem */}
      <div className="mt-6 flex items-center gap-6">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Período</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span>Previsão</span>
        </div>
      </div>
    </div>
  );
}
