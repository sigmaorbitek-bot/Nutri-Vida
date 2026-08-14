// ==================================================
// HORÁRIO DE FUNCIONAMENTO
// ==================================================

const horarioFuncionamento = {

    // Domingo
    0: null,

    // Segunda
    1: {
        abertura: "08:00",
        fechamento: "18:00"
    },

    // Terça
    2: {
        abertura: "08:00",
        fechamento: "18:00"
    },

    // Quarta
    3: {
        abertura: "08:00",
        fechamento: "18:00"
    },

    // Quinta
    4: {
        abertura: "08:00",
        fechamento: "18:00"
    },

    // Sexta
    5: {
        abertura: "08:00",
        fechamento: "18:00"
    },

    // Sábado
    6: {
        abertura: "08:00",
        fechamento: "13:00"
    }

};


// ==================================================
// NOMES DOS DIAS
// ==================================================

const nomesDias = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado"
];


// ==================================================
// VERIFICA SE A LOJA ESTÁ ABERTA
// ==================================================

function lojaEstaAberta() {

    const agora = new Date();

    const diaAtual = agora.getDay();

    const horarioHoje =
        horarioFuncionamento[diaAtual];

    // Dia fechado
    if (!horarioHoje) {
        return false;
    }

    const horaAtual =
        agora.getHours()
            .toString()
            .padStart(2, "0");

    const minutoAtual =
        agora.getMinutes()
            .toString()
            .padStart(2, "0");

    const horarioAtual =
        `${horaAtual}:${minutoAtual}`;

    return (
        horarioAtual >= horarioHoje.abertura &&
        horarioAtual <= horarioHoje.fechamento
    );
}


// ==================================================
// ATUALIZA O STATUS NA TELA
// ==================================================

function atualizarStatusLoja() {

    const statusLoja =
        document.getElementById("status-loja");

    const statusIcone =
        document.getElementById("status-icone");

    const statusTexto =
        document.getElementById("status-texto");

    const statusHorario =
        document.getElementById("status-horario");

    const botaoEntrar =
        document.getElementById("btn-entrar");

    // Se a página não possui esses elementos,
    // simplesmente não faz nada.
    if (
        !statusLoja ||
        !statusIcone ||
        !statusTexto ||
        !statusHorario ||
        !botaoEntrar
    ) {
        return;
    }

    const agora = new Date();

    const diaAtual = agora.getDay();

    const horarioHoje =
        horarioFuncionamento[diaAtual];


    // ==================================================
    // DIA FECHADO
    // ==================================================

    if (!horarioHoje) {

        statusIcone.textContent = "🔴";

        statusTexto.textContent =
            "Loja fechada hoje";

        statusHorario.textContent =
            `Hoje é ${nomesDias[diaAtual]}`;

        botaoEntrar.disabled = true;

        return;
    }


    // ==================================================
    // LOJA ABERTA
    // ==================================================

    if (lojaEstaAberta()) {

        statusIcone.textContent = "🟢";

        statusTexto.textContent =
            "Loja aberta";

        statusHorario.textContent =
            `Aberta até ${horarioHoje.fechamento}`;

        botaoEntrar.disabled = false;

        return;
    }


    // ==================================================
    // LOJA FECHADA
    // ==================================================

    statusIcone.textContent = "🔴";

    statusTexto.textContent =
        "Loja fechada";

    statusHorario.textContent =
        `Hoje: ${horarioHoje.abertura} às ${horarioHoje.fechamento}`;

    botaoEntrar.disabled = true;
}


// ==================================================
// ENTRAR NA LOJA
// ==================================================

function entrar() {

    // Segunda proteção.
    // Mesmo que alguém tente executar
    // entrar() manualmente, não entra fechado.

    if (!lojaEstaAberta()) {

        atualizarStatusLoja();

        return;
    }

    window.location.href =
        "./catalogo/index.html";
}


// ==================================================
// INICIALIZAÇÃO
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        atualizarStatusLoja();

        // Atualiza a cada minuto.
        // Assim não precisa atualizar a página
        // para o botão mudar de estado.

        setInterval(
            atualizarStatusLoja,
            60000
        );
    }
);