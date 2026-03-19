'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <BrainCircuit className="w-12 h-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Funcionalidade Removida
          </CardTitle>
          <CardDescription className="pt-2">
            A funcionalidade de insights com IA foi removida.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground/80">
            Esta página não está mais acessível a partir do aplicativo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
