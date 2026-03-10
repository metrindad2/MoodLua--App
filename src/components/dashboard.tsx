'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Calendar, CalendarClock, Brain } from 'lucide-react';
import LogEntryDialog from './log-entry-dialog';
import { format } from 'date-fns';

/**
 * Dashboard é a tela principal que a usuária vê após o login.
 * Ele exibe um resumo do estado atual do ciclo e fornece ações rápidas.
 */
export default function Dashboard() {
  const { userProfile, updateUserProfile } = useCycleData();
  
  // Se não houver perfil, não há o que mostrar. A página principal (page.tsx) já cuida disso.
  if (!userProfile) return null;

  // Usa a "calculadora" de ciclo para obter as previsões.
  const cycleInfo = calculateCycleInfo(userProfile);

  const handleRegisterMenstruation = () => {
    // Atualiza o perfil da usuária com a data de hoje como o início da nova menstruação.
    updateUserProfile({
      ...userProfile,
      lastMenstruationDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <div className="p-4 space-y-4">
      {cycleInfo && (
        <Card className="bg-gradient-to-br from-primary to-purple-800 text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold">
              Dia {cycleInfo.currentCycleDay}
            </CardTitle>
            <CardDescription className="text-center text-primary-foreground/80">
              do seu ciclo
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-primary-foreground/80">Próxima Menstruação</p>
              <p className="font-semibold">em {cycleInfo.daysUntilNextPeriod} dias</p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/80">Fase Atual</p>
              <p className="font-semibold">
                {cycleInfo.isMenstruating ? 'Menstrual' :
                 cycleInfo.isFertile ? 'Fértil' :
                 cycleInfo.isPms ? 'TPM / Lútea' : 'Folicular'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Button 
        onClick={handleRegisterMenstruation}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
      >
        <Droplets className="mr-2 h-5 w-5" />
        Registrar Início da Menstruação
      </Button>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registro Diário</CardTitle>
            <CardDescription>Adicione sintomas, fluxo e humor do dia.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* O LogEntryDialog é um botão que abre um pop-up para registro */}
            <LogEntryDialog />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
