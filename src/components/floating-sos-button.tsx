'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { SosSheet } from '@/components/sos-sheet';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function FloatingSosButton() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast, dismiss } = useToast();

  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    tapCount.current += 1;

    if (tapCount.current === 1) {
      // Primeiro toque
      const { id } = toast({
        description: 'Toque novamente para abrir o SOS.',
        duration: 2000,
      });
      tapTimer.current = setTimeout(() => {
        // Reseta se não houver segundo toque
        tapCount.current = 0;
        dismiss(id);
      }, 2000);
    } else if (tapCount.current === 2) {
      // Segundo toque
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
      dismiss(); // Fecha o toast do primeiro toque
      tapCount.current = 0;
      setIsSheetOpen(true);
    }
  }, [toast, dismiss]);

  return (
    <>
      <Button
        onClick={handleTap}
        className={cn(
          'fixed bottom-24 right-4 z-50 h-16 w-16 rounded-full shadow-lg',
          'bg-accent/70 text-accent-foreground backdrop-blur-sm',
          'opacity-70 hover:opacity-100 focus:opacity-100 transition-opacity',
          'flex items-center justify-center'
        )}
        aria-label="Abrir opções de Emergência SOS com dois toques"
      >
        <Heart className="h-8 w-8 fill-accent-foreground/20" />
      </Button>
      <SosSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
