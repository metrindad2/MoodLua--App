# CycleGuard: Monitoramento de Ciclo e Segurança

Este é um aplicativo Next.js para monitoramento do ciclo menstrual com uma função de segurança SOS, criado pelo Firebase Studio.

O projeto foi estruturado para ser didático e fácil de modificar, ideal para quem está aprendendo a programar com Next.js e React.

## Como Iniciar o Projeto

Este aplicativo foi projetado para ser executado como um site, mas com a aparência de um aplicativo de celular.

### 1. Abrir no Visual Studio Code
- Abra a pasta do projeto no VS Code. A estrutura de arquivos e pastas estará visível na barra lateral esquerda.

### 2. Rodar o Aplicativo
- Abra o terminal integrado do VS Code (`View` > `Terminal` ou `Ctrl+``).
- Digite o comando `npm install` e pressione Enter. Isso instalará todas as dependências do projeto.
- Após a instalação, digite o comando `npm run dev` e pressione Enter.
- Abra o seu navegador e acesse o endereço `http://localhost:9002`. Você verá o aplicativo funcionando.

## Como Aprender e Modificar

O código foi comentado para explicar o que cada parte faz. Aqui estão os pontos principais para você começar a modificar:

### Como os Arquivos se Conectam

- **`src/app/layout.tsx`**: É o arquivo principal que envolve todas as páginas. Ele define a estrutura HTML base, fontes e provedores de contexto (como o `CycleDataProvider` que gerencia os dados do app).
- **`src/app/page.tsx`**: É a página inicial. Ela usa o "contexto" para verificar se a usuária já inseriu seus dados. Se não, mostra o formulário de boas-vindas (`OnboardingForm`); se sim, mostra o painel principal (`Dashboard`).
- **`src/components/`**: Contém os blocos de construção da interface (componentes React), como botões, diálogos e o painel principal.
- **`src/context/cycle-data-context.tsx`**: Este é o "cérebro" do lado do cliente. Ele gerencia todos os dados do aplicativo (perfil, logs diários, configurações de SOS) e os salva no `localStorage` do navegador, para que as informações não se percam ao fechar a aba.
- **`src/lib/`**: Contém arquivos de utilidades, como `cycle-utils.ts` para os cálculos de previsão do ciclo e `types.ts` para definir a estrutura dos dados.

### Alterando Cores e Estilos
- As cores principais do aplicativo estão no arquivo `src/app/globals.css`, dentro do bloco `:root`.
- As variáveis `--primary`, `--secondary`, `--accent` e `--background` controlam as cores. Você pode alterar os valores HSL para mudar o tema.
- O aplicativo usa Tailwind CSS para estilização. As classes como `bg-primary`, `text-accent-foreground`, etc., usam as cores que você definiu em `globals.css`.

### Alterando Textos
- Os textos da interface estão diretamente nos arquivos de componente (`.tsx`) em `src/components/` e `src/app/`.
- Por exemplo, para alterar os textos do painel principal, edite o arquivo `src/components/dashboard.tsx`.

### Alterando a Função SOS
- As configurações padrão do SOS (número da polícia, mensagem) estão em `src/lib/config.ts`.
- A lógica de funcionamento do botão está em `src/components/sos-button.tsx`.
- Os contatos de emergência são salvos e gerenciados através da página de Configurações do app.

### Adicionando Novas Funcionalidades
1. **Crie um novo componente**: Em `src/components/`, crie um novo arquivo `.tsx` para sua funcionalidade (ex: `minha-nova-funcao.tsx`).
2. **Adicione a lógica**: Se precisar de novos dados, atualize o `CycleDataContext` para armazená-los.
3. **Crie uma nova página**: Crie uma nova pasta em `src/app/` (ex: `src/app/minha-pagina/`) e dentro dela um arquivo `page.tsx`.
4. **Adicione navegação**: No componente `src/components/app-shell.tsx`, adicione um link para sua nova página no cabeçalho ou no menu de navegação.

Explore os arquivos e os comentários para entender como cada peça funciona. Boa sorte com seus estudos e desenvolvimento!
