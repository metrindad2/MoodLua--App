'use client';

import React from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  FileText, 
  Scale, 
  MapPin, 
  Info, 
  UserCheck, 
  Building2, 
  HeartPulse, 
  HandHelping,
  AlertTriangle,
  ShieldAlert,
  Smartphone,
  AppWindow,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OFFICIAL_LINKS, PREDEFINED_CONTACTS } from '@/lib/config';

export default function ProtecaoPage() {
  return (
    <div className="p-4 space-y-8 pb-10">
      {/* HERO / CABEÇALHO */}
      <section className="text-center space-y-4 py-6">
        <div className="flex justify-center mb-2">
          <div className="relative">
             <ShieldCheck className="w-16 h-16 text-primary animate-pulse" />
             <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
             </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground leading-tight">
          Proteção e ajuda para você
        </h1>
        <p className="text-muted-foreground text-lg max-w-sm mx-auto">
          Conheça o SP Mulher Segura e encontre informações e serviços oficiais de proteção e atendimento às mulheres.
        </p>
        <Button asChild size="lg" className="rounded-full shadow-lg">
          <a href={OFFICIAL_LINKS.SP_MULHER_SEGURA} target="_blank" rel="noopener noreferrer">
            Conhecer o SP Mulher Segura
            <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </Button>
      </section>

      {/* CARD SP MULHER SEGURA */}
      <Card className="border-primary/20 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
           <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Oficial</Badge>
        </div>
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            SP Mulher Segura
          </CardTitle>
          <CardDescription className="text-primary font-semibold">
            Aplicativo oficial do Governo do Estado de São Paulo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <p className="text-sm leading-relaxed">
            O SP Mulher Segura reúne recursos de proteção, orientação e acesso à rede de atendimento para mulheres em situação de violência.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: FileText, text: 'Registro de boletim de ocorrência' },
              { icon: Scale, text: 'Solicitação de medida protetiva' },
              { icon: MapPin, text: 'Localização de serviços da rede' },
              { icon: Info, text: 'Informações e orientações' },
              { icon: UserCheck, text: 'Cadastro de pessoa de confiança' },
              { icon: ShieldCheck, text: 'Recursos de proteção personalizados' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 p-4 rounded-xl space-y-3 border border-primary/10">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Baixe o Aplicativo Oficial
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-10 text-xs gap-2" asChild>
                <a href={OFFICIAL_LINKS.SP_MULHER_IOS} target="_blank" rel="noopener noreferrer">
                  <AppWindow className="w-4 h-4" /> iOS
                </a>
              </Button>
              <Button variant="outline" size="sm" className="h-10 text-xs gap-2" asChild>
                <a href={OFFICIAL_LINKS.SP_MULHER_ANDROID} target="_blank" rel="noopener noreferrer">
                  <AppWindow className="w-4 h-4" /> Android
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg py-7 rounded-xl shadow-md">
              <a href={OFFICIAL_LINKS.SP_MULHER_SEGURA} target="_blank" rel="noopener noreferrer">
                Site SP Mulher Segura
              </a>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground italic">
              Você será direcionada para o serviço oficial do Governo do Estado de São Paulo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO REDE DE PROTEÇÃO */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold px-1 text-primary">Rede de Proteção e Apoio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              name: 'As Justiceiras', 
              icon: Users, 
              desc: 'Rede de apoio multidisciplinar com advogadas, psicólogas e assistentes sociais voluntárias.',
              link: OFFICIAL_LINKS.JUSTICEIRAS
            },
            { 
              name: 'Delegacia da Mulher — DDM', 
              icon: Building2, 
              desc: 'Rede especializada de atendimento para denúncias e proteção.',
              link: OFFICIAL_LINKS.DDM_ONLINE
            },
            { 
              name: 'Defensoria Pública', 
              icon: Scale, 
              desc: 'Orientação e assistência jurídica gratuita para mulheres que não podem pagar.',
              link: OFFICIAL_LINKS.DEFENSORIA
            },
            { 
              name: 'Ministério Público', 
              icon: FileText, 
              desc: 'Fiscalização da lei e promoção de medidas de proteção à vida.',
              link: OFFICIAL_LINKS.MP_SP
            },
            { 
              name: 'Unidades de Saúde', 
              icon: HeartPulse, 
              desc: 'Acolhimento médico e psicológico em unidades do SUS e hospitais.',
              link: OFFICIAL_LINKS.SAUDE_SP
            },
            { 
              name: 'Assistência Social', 
              icon: HandHelping, 
              desc: 'Apoio social através dos CRAS e CREAS em todo o estado.',
              link: OFFICIAL_LINKS.ASSISTENCIA_SOCIAL
            }
          ].map((item, i) => (
            <Card key={i} className="hover:border-primary/40 transition-colors border-primary/10 shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <item.icon className="w-5 h-5 text-primary" />
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                <Button variant="ghost" size="sm" className="h-8 text-xs p-0 text-primary hover:bg-transparent" asChild>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Saiba mais <ExternalLink className="ml-1 w-3 h-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SEÇÃO SE VOCÊ ESTÁ EM PERIGO */}
      <section className="bg-destructive/10 border-l-4 border-destructive p-6 rounded-r-xl space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <h2 className="text-lg font-bold text-destructive">Se você está em perigo</h2>
        </div>
        <p className="text-sm font-medium">
          Procure ajuda de emergência através dos canais oficiais:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PREDEFINED_CONTACTS.map((contact) => (
            <Button key={contact.id} variant="outline" className="border-destructive/30 hover:bg-destructive/5 bg-background" asChild>
              <a href={`tel:${contact.phone}`} className="flex flex-col items-center justify-center gap-1 h-auto py-3">
                <span className="text-xl font-bold text-destructive">{contact.phone}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{contact.name}</span>
              </a>
            </Button>
          ))}
        </div>
      </section>

      {/* FOOTER INFORMATIVO */}
      <footer className="bg-muted/30 p-6 rounded-xl space-y-3 text-center border border-muted">
        <h3 className="text-sm font-bold flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          O Mood Lua não substitui os serviços oficiais
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          O Mood Lua oferece informação e apoio. Em situações que exigem atendimento policial, médico, jurídico ou assistencial, procure sempre os serviços oficiais citados nesta página.
        </p>
      </footer>
    </div>
  );
}
