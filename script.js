/* =====================================================
   CONFIGURAÇÃO DO SUPABASE
   ===================================================== */

const SUPABASE_URL = "https://pztyrnmxfmofpiuriswn.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_HToq5W10V9rRlI1olAtXXg_mYqbc4ZR";

/* =====================================================
   CONEXÃO COM O SUPABASE
   ===================================================== */

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);

console.log("Supabase conectado:", supabaseClient);

/* ==================================================
   NOMES DOS DIAS
   ================================================== */

const nomesDias = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

/* ==================================================
   DADOS DA LOJA
   ================================================== */

let horariosFuncionamento = [];

let configuracaoLoja = null;

/* ==================================================
   ELEMENTOS DA TELA
   ================================================== */

const statusLoja = document.getElementById("status-loja");

const statusIcone = document.getElementById("status-icone");

const statusTexto = document.getElementById("status-texto");

const statusHorario = document.getElementById("status-horario");

const botaoEntrar = document.getElementById("btn-entrar");

/* ==================================================
   CARREGAR HORÁRIOS DO SUPABASE
   ================================================== */

async function carregarFuncionamento() {
  try {
    /* ==============================================
           HORÁRIOS
           ============================================== */

    const { data: horarios, error: erroHorarios } = await supabaseClient
      .from("horario_funcionamento")
      .select("*")
      .order("dia_semana", {
        ascending: true,
      });

    if (erroHorarios) {
      console.error("Erro ao carregar horários:", erroHorarios);

      return;
    }

    horariosFuncionamento = horarios || [];

    /* ==============================================
           CONFIGURAÇÃO DA LOJA
           ============================================== */

    const { data: configuracao, error: erroConfiguracao } = await supabaseClient
      .from("configuracao_loja")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (erroConfiguracao) {
      console.error("Erro ao carregar configuração:", erroConfiguracao);

      return;
    }

    configuracaoLoja = configuracao || null;

    /* ==============================================
           ATUALIZAR TELA
           ============================================== */

    atualizarStatusLoja();
  } catch (erro) {
    console.error("Erro ao carregar funcionamento:", erro);
  }
}

/* ==================================================
   DATA/HORA DE RECIFE
   ================================================== */

function obterDataRecife() {
  const agora = new Date();

  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Recife",

    weekday: "short",

    hour: "2-digit",

    minute: "2-digit",

    hour12: false,
  }).formatToParts(agora);

  const valores = {};

  partes.forEach((parte) => {
    valores[parte.type] = parte.value;
  });

  const mapaDias = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    diaSemana: mapaDias[valores.weekday],

    hora: Number(valores.hour),

    minuto: Number(valores.minute),
  };
}

/* ==================================================
   CONVERTER HORÁRIO PARA MINUTOS
   ================================================== */

function converterParaMinutos(horario) {
  if (!horario) {
    return null;
  }

  const partes = horario.substring(0, 5).split(":");

  const horas = Number(partes[0]);

  const minutos = Number(partes[1]);

  return horas * 60 + minutos;
}

/* ==================================================
   VERIFICAR SE A LOJA ESTÁ ABERTA
   ================================================== */

function lojaEstaAberta() {
  /* ==============================================
       FECHAMENTO MANUAL
       ============================================== */

  if (configuracaoLoja && configuracaoLoja.fechamento_manual) {
    return false;
  }

  /* ==============================================
       ABERTURA MANUAL
       ============================================== */

  if (configuracaoLoja && configuracaoLoja.loja_aberta_manualmente) {
    return true;
  }

  /* ==============================================
       HORÁRIO NORMAL
       ============================================== */

  const agora = obterDataRecife();

  const horarioHoje = horariosFuncionamento.find(
    (horario) => horario.dia_semana === agora.diaSemana,
  );

  if (!horarioHoje || !horarioHoje.aberto) {
    return false;
  }

  const minutosAtuais = agora.hora * 60 + agora.minuto;

  const minutosAbertura = converterParaMinutos(horarioHoje.horario_abertura);

  const minutosFechamento = converterParaMinutos(
    horarioHoje.horario_fechamento,
  );

  if (minutosAbertura === null || minutosFechamento === null) {
    return false;
  }

  return minutosAtuais >= minutosAbertura && minutosAtuais < minutosFechamento;
}

/* ==================================================
   ATUALIZAR STATUS DA LOJA
   ================================================== */

function atualizarStatusLoja() {
  if (
    !statusLoja ||
    !statusIcone ||
    !statusTexto ||
    !statusHorario ||
    !botaoEntrar
  ) {
    return;
  }

  const agora = obterDataRecife();

  const horarioHoje = horariosFuncionamento.find(
    (horario) => horario.dia_semana === agora.diaSemana,
  );

  /* ==============================================
       FECHAMENTO MANUAL
       ============================================== */

  if (configuracaoLoja && configuracaoLoja.fechamento_manual) {
    statusIcone.textContent = "🔴";

    statusTexto.textContent = "Loja fechada";

    statusHorario.textContent = "Fechada temporariamente";

    botaoEntrar.disabled = true;

    return;
  }

  /* ==============================================
       ABERTURA MANUAL
       ============================================== */

  if (configuracaoLoja && configuracaoLoja.loja_aberta_manualmente) {
    statusIcone.textContent = "🟢";

    statusTexto.textContent = "Loja aberta";

    statusHorario.textContent = "Atendimento liberado";

    botaoEntrar.disabled = false;

    return;
  }

  /* ==============================================
       DIA FECHADO
       ============================================== */

  if (!horarioHoje || !horarioHoje.aberto) {
    statusIcone.textContent = "🔴";

    statusTexto.textContent = "Loja fechada hoje";

    statusHorario.textContent = `Hoje é ${nomesDias[agora.diaSemana]}`;

    botaoEntrar.disabled = true;

    return;
  }

  /* ==============================================
       HORÁRIO NORMAL
       ============================================== */

  const aberta = lojaEstaAberta();

  const abertura = horarioHoje.horario_abertura?.substring(0, 5);

  const fechamento = horarioHoje.horario_fechamento?.substring(0, 5);

  if (aberta) {
    statusIcone.textContent = "🟢";

    statusTexto.textContent = "Loja aberta";

    statusHorario.textContent = `Aberta até ${fechamento}`;

    botaoEntrar.disabled = false;

    return;
  }

  /* ==============================================
       ANTES DE ABRIR
       ============================================== */

  const minutosAtuais = agora.hora * 60 + agora.minuto;

  const minutosAbertura = converterParaMinutos(horarioHoje.horario_abertura);

  if (minutosAbertura !== null && minutosAtuais < minutosAbertura) {
    statusIcone.textContent = "🔴";

    statusTexto.textContent = "Loja fechada";

    statusHorario.textContent = `Hoje: ${abertura} às ${fechamento}`;

    botaoEntrar.disabled = true;

    return;
  }

  /* ==============================================
       DEPOIS DE FECHAR
       ============================================== */

  statusIcone.textContent = "🔴";

  statusTexto.textContent = "Loja fechada";

  statusHorario.textContent = `Hoje: ${abertura} às ${fechamento}`;

  botaoEntrar.disabled = true;
}

/* ==================================================
   ENTRAR NA LOJA
   ================================================== */

function entrar() {
  if (!lojaEstaAberta()) {
    atualizarStatusLoja();

    return;
  }

  window.location.href = "./catalogo/index.html";
}

/* ==================================================
   INICIALIZAÇÃO
   ================================================== */

document.addEventListener("DOMContentLoaded", () => {
  carregarFuncionamento();

  /*
   * Atualiza a cada minuto.
   */

  setInterval(() => {
    atualizarStatusLoja();
  }, 60000);
});
