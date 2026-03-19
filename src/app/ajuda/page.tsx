'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { MessageCircleOff } from 'lucide-react';

export default function AjudaPage() {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <MessageCircleOff className="w-12 h-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Funcionalidade Removida
          </CardTitle>
          <CardDescription className="pt-2">
            A funcionalidade de ajuda com IA foi removida.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
           <p className="text-sm text-muted-foreground/80">
            Esta página não está mais acessível pelo menu de navegação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
