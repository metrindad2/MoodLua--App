'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Baby } from 'lucide-react';

export default function PregnancyPage() {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Baby className="w-12 h-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Acompanhamento de Gravidez
          </CardTitle>
          <CardDescription className="pt-2">
            Esta funcionalidade está em desenvolvimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
           <p className="text-sm text-muted-foreground/80">
            Em breve, você poderá acompanhar sua gravidez por aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
