/*
 * script.js
 * Este arquivo contém toda a lógica do calendário.
 * Ele é responsável por calcular os dias, renderizá-los na tela
 * e lidar com as interações do usuário (clicar nos botões e nos dias).
 */

// Espera o HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DOS ELEMENTOS DO HTML ---
    // Pegamos as referências dos elementos que vamos precisar manipular.
    // É como dar um "apelido" para cada parte do nosso HTML.
    const monthYearElement = document.getElementById('month-year');
    const daysElement = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    // --- 2. VARIÁVEIS DE ESTADO ---
    // `currentDate` guarda a data que o calendário está mostrando no momento.
    // Começamos com a data de hoje.
    let currentDate = new Date();

    // --- 3. FUNÇÃO PRINCIPAL: RENDERIZAR O CALENDÁRIO ---
    // Esta é a função mais importante. Ela desenha o calendário na tela.
    const renderCalendar = () => {
        // Pega o ano e o mês da nossa `currentDate`
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // --- A. ATUALIZA O CABEÇALHO ---
        // Define o texto do cabeçalho, por exemplo: "Março 2026"
        // `toLocaleString` é uma forma fácil de pegar o nome do mês no idioma certo.
        const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
        monthYearElement.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

        // --- B. LIMPA O GRID DE DIAS ---
        // Antes de desenhar os novos dias, limpamos os que já estavam lá.
        daysElement.innerHTML = '';

        // --- C. CÁLCULOS DAS DATAS ---
        // Descobre em qual dia da semana o mês começa (0=Domingo, 1=Segunda, ...)
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        // Descobre o último dia do mês anterior
        const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

        // Descobre o último dia do mês atual
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        
        // --- D. RENDERIZA OS DIAS DO MÊS ANTERIOR (SE NECESSÁRIO) ---
        // Para preencher os espaços vazios no início do calendário.
        for (let i = firstDayOfMonth; i > 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.textContent = lastDateOfPrevMonth - i + 1;
            dayElement.classList.add('prev-month-day'); // Adiciona classe para estilizar como "outro mês"
            daysElement.appendChild(dayElement);
        }

        // --- E. RENDERIZA OS DIAS DO MÊS ATUAL ---
        // Loop de 1 até o último dia do mês.
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;

            // Verifica se este dia é o dia de hoje
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add('current-day'); // Adiciona classe para destacar o dia atual
            }

            // Adiciona evento de clique para cada dia
            dayElement.addEventListener('click', () => {
                // Remove a seleção de qualquer outro dia que já estivesse selecionado
                const selected = document.querySelector('.selected-day');
                if (selected) {
                    selected.classList.remove('selected-day');
                }
                // Adiciona a classe de seleção ao dia clicado
                dayElement.classList.add('selected-day');
            });

            daysElement.appendChild(dayElement);
        }

        // --- F. RENDERIZA OS DIAS DO PRÓXIMO MÊS (SE NECESSÁRIO) ---
        // Para preencher os espaços vazios no final e garantir que o grid tenha 6 semanas (42 dias).
        const totalCells = daysElement.children.length;
        const remainingCells = 42 - totalCells;
        
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            dayElement.classList.add('next-month-day');
            daysElement.appendChild(dayElement);
        }
    };

    // --- 4. EVENT LISTENERS PARA OS BOTÕES ---
    // Quando o botão "anterior" é clicado:
    prevMonthBtn.addEventListener('click', () => {
        // Diminui o mês da `currentDate` em 1. O objeto Date lida com a virada de ano.
        currentDate.setMonth(currentDate.getMonth() - 1);
        // Renderiza o calendário novamente com a nova data.
        renderCalendar();
    });

    // Quando o botão "próximo" é clicado:
    nextMonthBtn.addEventListener('click', () => {
        // Aumenta o mês da `currentDate` em 1.
        currentDate.setMonth(currentDate.getMonth() + 1);
        // Renderiza o calendário novamente.
        renderCalendar();
    });
    
    // --- 5. CHAMADA INICIAL ---
    // Renderiza o calendário pela primeira vez quando a página carrega.
    renderCalendar();
});
