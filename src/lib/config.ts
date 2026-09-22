// Este arquivo centraliza as configurações e links oficiais do aplicativo.
export const DEFAULT_SOS_MESSAGE = `🚨 SOS – Preciso de ajuda agora!
Estou em uma situação de risco e enviei este alerta pelo aplicativo.
📍 Minha localização atual é: {{localizacao}}
Por favor, tente entrar em contato comigo ou procure ajuda para mim.
Se não conseguir falar comigo, avise a polícia ou alguém próximo.`;

export const PREDEFINED_CONTACTS = [
  {
    id: 'predefined-190',
    name: 'Polícia Militar',
    phone: '190',
    isPredefined: true,
  },
  {
    id: 'predefined-153',
    name: 'GCM (Guarda Municipal)',
    phone: '153',
    isPredefined: true,
  },
  {
    id: 'predefined-192',
    name: 'SAMU (Emergência Médica)',
    phone: '192',
    isPredefined: true,
  },
  {
    id: 'predefined-193',
    name: 'Corpo de Bombeiros',
    phone: '193',
    isPredefined: true,
  },
  {
    id: 'predefined-180',
    name: 'Central da Mulher',
    phone: '180',
    isPredefined: true,
  },
];

export const OFFICIAL_LINKS = {
  SP_MULHER_SEGURA: 'https://www.saopaulo.sp.gov.br/spmulhersegura/',
  SP_MULHER_IOS: 'https://apps.apple.com/br/app/sp-mulher-segura/id6475302636',
  SP_MULHER_ANDROID: 'https://play.google.com/store/apps/details?id=br.gov.sp.ssp.spmulher',
  JUSTICEIRAS: 'https://justiceiras.org.br/',
  DDM_ONLINE: 'https://www.delegaciaeletronica.policiacivil.sp.gov.br/ssp-de-cidadao/pages/elucidacao/mulher',
  DEFENSORIA: 'https://www.defensoria.sp.def.br/',
  MP_SP: 'https://www.mpsp.mp.br/',
  SAUDE_SP: 'https://www.saude.sp.gov.br/',
  ASSISTENCIA_SOCIAL: 'https://www.desenvolvimentosocial.sp.gov.br/',
};
