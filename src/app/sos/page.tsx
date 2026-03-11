'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SosSheet } from '@/components/sos-sheet';

export default function SOSPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
        <Card className="w-full bg-transparent border-0 shadow-none">
          <CardHeader>
            <div className="flex justify-center items-center flex-col gap-2">
              <ShieldAlert className="h-10 w-10 text-primary" />
              <CardTitle className="text-primary text-3xl font-bold">Emergência SOS</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Pressione o coração para abrir as opções de emergência.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
              <Button
                onClick={() => setIsSheetOpen(true)}
                className="rounded-full h-48 w-48 shadow-lg shadow-primary/10 transform transition-all duration-300 ease-in-out hover:scale-105 bg-primary/10 text-primary hover:bg-primary/20"
                aria-label={'Abrir opções de Emergência SOS'}
              >
                <Heart className="h-32 w-32 fill-primary/20" />
              </Button>
              <p className="mt-6 text-muted-foreground font-semibold">Pressione para ver as opções</p>
          </CardContent>
        </Card>
      </div>
      <SosSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
