'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCycleData } from '@/context/cycle-data-context';
import { Moon, ShieldAlert, LockKeyhole, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { UserProfile } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { AppIntroCarousel } from './app-intro-carousel';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_SOS_MESSAGE } from '@/lib/config';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from './ui/separator';

// Esquema atualizado para incluir senha
const formSchema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    birthDate: z.coerce.date({
      required_error: 'A data de nascimento é obrigatória.',
    }),
    lastMenstruationDate: z.coerce.date({
      required_error: 'A data da última menstruação é obrigatória.',
    }),
    cycleLengthDays: z.coerce
      .number({
        invalid_type_error: 'Deve ser um número válido.',
        required_error: 'A duração do ciclo é obrigatória.',
      })
      .int()
      .min(1, 'A duração do ciclo é obrigatória.')
      .gte(15, 'O ciclo deve ter pelo menos 15 dias.'),
    flowDurationDays: z.coerce
      .number({
        invalid_type_error: 'Deve ser um número válido.',
        required_error: 'A duração da menstruação é obrigatória.',
      })
      .int()
      .min(1, 'A duração da menstruação é obrigatória.'),
    pin: z
      .string()
      .min(4, 'A senha deve ter 4 dígitos.')
      .max(4, 'A senha deve ter 4 dígitos.')
      .regex(/^\d+$/, 'A senha deve conter apenas números.'),
    confirmPin: z.string(),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'As senhas não correspondem.',
    path: ['confirmPin'],
  });

export default function OnboardingForm() {
  const { updateUserProfile } = useCycleData();
  const { toast } = useToast();
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showProfileConfirmation, setShowProfileConfirmation] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cycleLengthDays: 28,
      flowDurationDays: 5,
      pin: '',
      confirmPin: '',
    },
  });

  // Step 1: Form is submitted
  function onSubmit(values: z.infer<typeof formSchema>) {
    setFormData(values);
    setShowLocationDialog(true); // Open location dialog first
  }

  // Step 2: User interacts with location dialog
  const handleLocationRequest = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocalização não suportada',
        description: 'Seu navegador não suporta este recurso.',
      });
      setShowLocationDialog(false);
      setShowProfileConfirmation(true);
      return;
    }

    setIsRequestingLocation(true);

    // Definimos um timeout de segurança para não travar a UI se o navegador demorar
    const safetyTimeout = setTimeout(() => {
        setIsRequestingLocation(false);
        setShowLocationDialog(false);
        setShowProfileConfirmation(true);
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      () => {
        clearTimeout(safetyTimeout);
        setIsRequestingLocation(false);
        setShowLocationDialog(false);
        toast({
          title: 'Permissão concedida!',
          description: 'A localização para o SOS foi ativada.',
        });
        setShowProfileConfirmation(true); 
      },
      (error) => {
        clearTimeout(safetyTimeout);
        setIsRequestingLocation(false);
        setShowLocationDialog(false);
        
        if (error.code === 1) { // PERMISSION_DENIED
          toast({
            variant: 'destructive',
            title: 'Permissão de localização negada',
            description: 'Você pode ativá-la depois nas configurações se desejar usar o SOS.',
          });
        }
        setShowProfileConfirmation(true);
      },
      { timeout: 8000 }
    );
  };

  const handleSkipLocation = () => {
    setShowLocationDialog(false);
    setShowProfileConfirmation(true);
  };

  // Step 3: User confirms profile creation
  function handleConfirmAndSave() {
    if (!formData) return;

    const userProfile: Partial<Omit<UserProfile, 'uid'>> = {
      name: formData.name,
      birthDate: format(formData.birthDate, 'yyyy-MM-dd'),
      lastMenstruationDate: format(formData.lastMenstruationDate, 'yyyy-MM-dd'),
      cycleLengthDays: formData.cycleLengthDays,
      flowDurationDays: formData.flowDurationDays,
      sosMessage: DEFAULT_SOS_MESSAGE,
      isLockEnabled: true,
      lockPin: formData.pin,
    };

    updateUserProfile(userProfile);
    toast({
      title: 'Bem-vinda!',
      description: 'Seu perfil foi criado com sucesso.',
    });
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center justify-center text-center pb-4">
          <Moon className="w-14 h-14 text-primary mb-2" />
          <h1 className="text-3xl font-bold text-foreground">
            Bem-vinda à MoodLua
          </h1>
          <p className="text-muted-foreground mt-2">
            Conheça o que podemos fazer por você.
          </p>
        </div>

        <AppIntroCarousel />

        <p className="text-muted-foreground text-center mt-6 mb-4 max-w-sm">
          Agora, vamos configurar seu perfil para uma experiência personalizada e segura.
        </p>

        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="text" placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value instanceof Date
                              ? format(field.value, 'yyyy-MM-dd')
                              : typeof field.value === 'string'
                              ? field.value
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? new Date(e.target.value + 'T00:00:00')
                                : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastMenstruationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Última Menstruação</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value instanceof Date
                              ? format(field.value, 'yyyy-MM-dd')
                              : typeof field.value === 'string'
                              ? field.value
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? new Date(e.target.value + 'T00:00:00')
                                : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cycleLengthDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground text-xs pl-1">
                          Duração do Ciclo (dias)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="flowDurationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground text-xs pl-1">
                          Duração da Menstruação
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="!my-6" />

                <div className="space-y-2 text-center">
                    <h3 className="font-semibold flex items-center justify-center gap-2">
                        <LockKeyhole className="h-5 w-5" />
                        Crie uma senha de acesso
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Use uma senha de 4 dígitos para proteger seus dados.
                    </p>
                </div>

                 <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="Senha de 4 dígitos"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="confirmPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="Confirme a senha"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-bold"
                >
                  Criar Perfil e Começar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Location Permission Dialog */}
      <AlertDialog
        open={showLocationDialog}
        onOpenChange={isRequestingLocation ? () => {} : setShowLocationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-2">
              <ShieldAlert className="w-10 h-10 text-primary" />
            </div>
            <AlertDialogTitle className="text-center">
              Ative o Recurso de Emergência (SOS)
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              O MoodLua possui um botão de SOS para sua segurança. Para que ele
              funcione, precisamos da sua permissão para acessar a localização.
              Quando você acionar o SOS, um link do mapa com sua posição será
              enviado para seus contatos de confiança.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel onClick={handleSkipLocation} disabled={isRequestingLocation}>
              Pular por agora
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLocationRequest} disabled={isRequestingLocation}>
              {isRequestingLocation ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Solicitando...
                </>
              ) : 'Permitir Localização'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Confirmation Dialog */}
      <AlertDialog
        open={showProfileConfirmation}
        onOpenChange={setShowProfileConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bem-vinda, {formData?.name}!</AlertDialogTitle>
            <AlertDialogDescription>
              Seu perfil está pronto. Ao continuar, você será direcionada para o
              painel principal, onde poderá começar a acompanhar seu ciclo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmAndSave}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
