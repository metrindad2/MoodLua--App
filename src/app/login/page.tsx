'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <UserCheck className="w-12 h-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Login não é necessário
          </CardTitle>
          <CardDescription className="pt-2">
            O MoodLua agora salva seus dados diretamente neste dispositivo, sem
            a necessidade de uma conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground/80">
            Suas informações são privadas e ficam apenas com você.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Ir para a página inicial</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
