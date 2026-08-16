/* =====================================================
   NUTRI+VIDA - PAINEL ADMINISTRATIVO
   ===================================================== */
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

/* =====================================================
   ELEMENTOS DA PÁGINA
   ===================================================== */

const formularioProduto = document.getElementById("form-produto");

const listaAdmin = document.getElementById("lista-admin");

const mensagemCadastro = document.getElementById("msg-cadastro");

const totalProdutos = document.getElementById("total-produtos");

const campoBusca = document.getElementById("buscar-admin");

const nomesDias = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

/* =====================================================
   PRODUTOS EM EDIÇÃO
   ===================================================== */

let produtos = [];

let produtoEmEdicao = null;

let horarios = [];

let configuracaoLoja = null;

/* =====================================================
   CARREGAR HORÁRIOS
   ===================================================== */

async function carregarHorarios() {
  const listaHorarios = document.getElementById("lista-horarios");

  if (!listaHorarios) {
    return;
  }

  try {
    listaHorarios.innerHTML = `
      <p class="estado-admin">
        Carregando horários...
      </p>
    `;

    const { data, error } = await supabaseClient
      .from("horario_funcionamento")
      .select("*")
      .order("dia_semana", {
        ascending: true,
      });

    if (error) {
      console.error("Erro ao carregar horários:", error);

      listaHorarios.innerHTML = `
        <p class="estado-admin">
          Não foi possível carregar os horários.
        </p>
      `;

      return;
    }

    horarios = data || [];

    renderizarHorarios();
  } catch (erro) {
    console.error("Erro inesperado ao carregar horários:", erro);

    listaHorarios.innerHTML = `
      <p class="estado-admin">
        Erro ao carregar horários.
      </p>
    `;
  }
}

/* =====================================================
   RENDERIZAR HORÁRIOS
   ===================================================== */

function renderizarHorarios() {
  const listaHorarios = document.getElementById("lista-horarios");

  if (!listaHorarios) {
    return;
  }

  listaHorarios.innerHTML = "";

  horarios.forEach((horario) => {
    const item = document.createElement("div");

    item.className = "horario-item";

    /* ================================================
         DIA
         ================================================ */

    const dia = document.createElement("span");

    dia.className = "horario-dia";

    dia.textContent = nomesDias[horario.dia_semana];

    /* ================================================
         CHECKBOX ABERTO
         ================================================ */

    const label = document.createElement("label");

    label.className = "horario-aberto";

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked = horario.aberto;

    checkbox.dataset.id = horario.id;

    const texto = document.createElement("span");

    texto.textContent = " Aberto";

    label.appendChild(checkbox);

    label.appendChild(texto);

    /* ================================================
         ABERTURA
         ================================================ */

    const abertura = document.createElement("input");

    abertura.type = "time";

    abertura.value = horario.horario_abertura || "";

    abertura.dataset.tipo = "abertura";

    abertura.dataset.id = horario.id;

    /* ================================================
         FECHAMENTO
         ================================================ */

    const fechamento = document.createElement("input");

    fechamento.type = "time";

    fechamento.value = horario.horario_fechamento || "";

    fechamento.dataset.tipo = "fechamento";

    fechamento.dataset.id = horario.id;

    /* ================================================
         ESTADO
         ================================================ */

    if (!horario.aberto) {
      abertura.disabled = true;

      fechamento.disabled = true;
    }

    checkbox.addEventListener("change", () => {
      abertura.disabled = !checkbox.checked;

      fechamento.disabled = !checkbox.checked;
    });

    /* ================================================
         MONTAR ITEM
         ================================================ */

    item.appendChild(dia);

    item.appendChild(label);

    item.appendChild(abertura);

    item.appendChild(fechamento);

    listaHorarios.appendChild(item);
  });
}

/* =====================================================
   SALVAR HORÁRIOS
   ===================================================== */

async function salvarHorarios() {
  const listaHorarios = document.getElementById("lista-horarios");

  const mensagem = document.getElementById("msg-horarios");

  if (!listaHorarios) {
    return;
  }

  try {
    if (mensagem) {
      mensagem.textContent = "Salvando horários...";

      mensagem.style.color = "var(--verde-medio)";
    }

    const itens = listaHorarios.querySelectorAll(".horario-item");

    for (const item of itens) {
      const checkbox = item.querySelector('input[type="checkbox"]');

      const abertura = item.querySelector('input[data-tipo="abertura"]');

      const fechamento = item.querySelector('input[data-tipo="fechamento"]');

      const id = Number(checkbox.dataset.id);

      const aberto = checkbox.checked;

      await supabaseClient
        .from("horario_funcionamento")
        .update({
          aberto: aberto,

          horario_abertura: aberto ? abertura.value || null : null,

          horario_fechamento: aberto ? fechamento.value || null : null,
        })
        .eq("id", id);
    }

    await carregarHorarios();

    if (mensagem) {
      mensagem.textContent = "Horários salvos com sucesso!";

      mensagem.style.color = "var(--sucesso)";
    }
  } catch (erro) {
    console.error("Erro ao salvar horários:", erro);

    if (mensagem) {
      mensagem.textContent = "Não foi possível salvar os horários.";

      mensagem.style.color = "var(--erro)";
    }
  }
}

/* =====================================================
   FORMATAR PREÇO
   ===================================================== */

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* =====================================================
   MOSTRAR MENSAGEM
   ===================================================== */

function mostrarMensagem(mensagem, tipo = "sucesso") {
  if (!mensagemCadastro) {
    return;
  }

  mensagemCadastro.textContent = mensagem;

  mensagemCadastro.style.color =
    tipo === "erro" ? "var(--erro)" : "var(--sucesso)";
}

/* =====================================================
   ALTERAR TEXTO DO BOTÃO DO FORMULÁRIO
   ===================================================== */

function atualizarBotaoFormulario(texto) {
  if (!formularioProduto) {
    return;
  }

  const botao = formularioProduto.querySelector('button[type="submit"]');

  if (!botao) {
    return;
  }

  botao.textContent = texto;
}

/* =====================================================
   LIMPAR FORMULÁRIO
   ===================================================== */

function limparFormulario() {
  if (!formularioProduto) {
    return;
  }

  formularioProduto.reset();

  produtoEmEdicao = null;

  atualizarBotaoFormulario("+ Cadastrar Produto");
}

/* =====================================================
   CANCELAR EDIÇÃO
   ===================================================== */

function cancelarEdicao() {
  limparFormulario();

  mostrarMensagem("Edição cancelada.");
}

/* =====================================================
   VALIDAR ARQUIVO
   ===================================================== */

function validarArquivoImagem(arquivo) {
  if (!arquivo) {
    return true;
  }

  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  const tamanhoMaximo = 5 * 1024 * 1024;

  if (!tiposPermitidos.includes(arquivo.type)) {
    mostrarMensagem("Use apenas JPG, PNG ou WEBP.", "erro");

    return false;
  }

  if (arquivo.size > tamanhoMaximo) {
    mostrarMensagem("A imagem deve ter no máximo 5 MB.", "erro");

    return false;
  }

  return true;
}

/* =====================================================
   CRIAR NOME DO ARQUIVO
   ===================================================== */

function gerarNomeArquivo(arquivo) {
  const extensao = arquivo.name.split(".").pop().toLowerCase();

  return `${Date.now()}-${crypto.randomUUID()}.${extensao}`;
}

/* =====================================================
   UPLOAD DA IMAGEM
   ===================================================== */

async function enviarImagem(arquivo) {
  if (!arquivo) {
    return null;
  }

  const nomeArquivo = gerarNomeArquivo(arquivo);

  console.log("Enviando imagem:", nomeArquivo);

  const { error: uploadError } = await supabaseClient.storage
    .from("produtos")
    .upload(nomeArquivo, arquivo, {
      cacheControl: "3600",
      upsert: false,
      contentType: arquivo.type,
    });

  if (uploadError) {
    console.error("Erro no upload:", uploadError);

    throw new Error("Não foi possível enviar a imagem.");
  }

  const { data: urlData } = supabaseClient.storage
    .from("produtos")
    .getPublicUrl(nomeArquivo);

  if (!urlData || !urlData.publicUrl) {
    throw new Error("Não foi possível obter a URL da imagem.");
  }

  console.log("Imagem enviada:", urlData.publicUrl);

  return urlData.publicUrl;
}

/* =====================================================
   PEGAR CAMINHO DA FOTO NO STORAGE
   ===================================================== */

function obterCaminhoImagem(urlPublica) {
  if (!urlPublica) {
    return null;
  }

  const marcador = "/storage/v1/object/public/produtos/";

  const indice = urlPublica.indexOf(marcador);

  if (indice === -1) {
    return null;
  }

  const caminho = urlPublica.substring(indice + marcador.length);

  return caminho || null;
}

/* =====================================================
   REMOVER IMAGEM DO STORAGE
   ===================================================== */

async function removerImagemDoStorage(urlPublica) {
  try {
    const caminho = obterCaminhoImagem(urlPublica);

    if (!caminho) {
      console.warn(
        "Não foi possível identificar o caminho da imagem:",
        urlPublica,
      );

      return false;
    }

    console.log("Removendo imagem:", caminho);

    const { error } = await supabaseClient.storage
      .from("produtos")
      .remove([caminho]);

    if (error) {
      console.error("Erro ao remover imagem:", error);

      return false;
    }

    return true;
  } catch (erro) {
    console.error("Erro inesperado ao remover imagem:", erro);

    return false;
  }
}

/* =====================================================
   EXCLUIR IMAGEM RECÉM-ENVIADA
   USADO QUANDO O UPDATE/INSERT FALHAR
   ===================================================== */

async function removerImagemNova(urlPublica) {
  if (!urlPublica) {
    return;
  }

  await removerImagemDoStorage(urlPublica);
}

/* =====================================================
   CADASTRAR PRODUTO
   ===================================================== */

async function cadastrarProduto(event) {
  event.preventDefault();

  /*
   * Se existe produto em edição,
   * o mesmo formulário passa a fazer UPDATE.
   */

  if (produtoEmEdicao) {
    await atualizarProduto();

    return;
  }

  mostrarMensagem("Cadastrando produto...");

  try {
    /* =================================================
       PEGAR VALORES
       ================================================= */

    const nome = document.getElementById("nome").value.trim();

    const preco = Number(document.getElementById("preco").value);

    const descricao = document.getElementById("descricao").value.trim();

    const estoque = Number(document.getElementById("estoque").value);

    const unidade = document.getElementById("unidade").value;

    const fotoInput = document.getElementById("foto");

    const arquivo =
      fotoInput && fotoInput.files.length > 0 ? fotoInput.files[0] : null;

    /* =================================================
       VALIDAÇÕES
       ================================================= */

    if (!nome) {
      mostrarMensagem("Informe o nome do produto.", "erro");

      return;
    }

    if (Number.isNaN(preco) || preco < 0) {
      mostrarMensagem("Informe um preço válido.", "erro");

      return;
    }

    if (Number.isNaN(estoque) || estoque < 0) {
      mostrarMensagem("Informe um estoque válido.", "erro");

      return;
    }

    if (!validarArquivoImagem(arquivo)) {
      return;
    }

    /* =================================================
       UPLOAD DA FOTO
       ================================================= */

    let fotoUrl = null;

    if (arquivo) {
      mostrarMensagem("Enviando imagem...");

      fotoUrl = await enviarImagem(arquivo);
    }

    /* =================================================
       INSERT
       ================================================= */

    mostrarMensagem("Salvando produto...");

    const { data, error } = await supabaseClient
      .from("produto")
      .insert([
        {
          nome: nome,

          preco: preco,

          descricao: descricao || null,

          estoque: estoque,

          foto: fotoUrl,

          unidade: unidade,
        },
      ])
      .select();

    /* =================================================
       ERRO
       ================================================= */

    if (error) {
      console.error("Erro ao cadastrar produto:", error);

      /*
       * Se a imagem já foi enviada,
       * mas o INSERT falhou,
       * remove a imagem para não deixar
       * arquivo órfão no Storage.
       */

      if (fotoUrl) {
        await removerImagemNova(fotoUrl);
      }

      mostrarMensagem("Não foi possível cadastrar o produto.", "erro");

      return;
    }

    /* =================================================
       SUCESSO
       ================================================= */

    console.log("Produto cadastrado:", data);

    mostrarMensagem("Produto cadastrado com sucesso!");

    limparFormulario();

    await carregarProdutos();
  } catch (erro) {
    console.error("Erro inesperado:", erro);

    mostrarMensagem(erro.message || "Ocorreu um erro inesperado.", "erro");
  }
}

/* =====================================================
   CARREGAR PRODUTOS
   ===================================================== */

async function carregarProdutos() {
  try {
    listaAdmin.innerHTML = `
      <p class="estado-admin">
        Carregando produtos...
      </p>
    `;

    const { data, error } = await supabaseClient
      .from("produto")
      .select("*")
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error("Erro ao buscar produtos:", error);

      listaAdmin.innerHTML = `
        <p class="estado-admin">
          Não foi possível carregar os produtos.
        </p>
      `;

      return;
    }

    produtos = data || [];

    atualizarTotalProdutos();

    renderizarProdutos(produtos);
  } catch (erro) {
    console.error("Erro inesperado:", erro);

    listaAdmin.innerHTML = `
      <p class="estado-admin">
        Erro ao carregar produtos.
      </p>
    `;
  }
}

/* =====================================================
   TOTAL DE PRODUTOS
   ===================================================== */

function atualizarTotalProdutos() {
  if (!totalProdutos) {
    return;
  }

  totalProdutos.textContent = produtos.length;
}

/* =====================================================
   RENDERIZAR PRODUTOS
   ===================================================== */

function renderizarProdutos(lista) {
  listaAdmin.innerHTML = "";

  if (lista.length === 0) {
    listaAdmin.innerHTML = `
      <p class="estado-admin">
        Nenhum produto cadastrado.
      </p>
    `;

    return;
  }

  lista.forEach((produto) => {
    /* ===============================================
         CARD
         =============================================== */

    const card = document.createElement("article");

    card.className = "card-admin";

    /* ===============================================
         FOTO
         =============================================== */

    const imagem = document.createElement("img");

    imagem.src = produto.foto || "../assets/produto-sem-foto.png";

    imagem.alt = produto.nome;

    imagem.onerror = () => {
      imagem.onerror = null;

      imagem.src = "../assets/produto-sem-foto.png";
    };

    /* ===============================================
         CONTEÚDO
         =============================================== */

    const conteudo = document.createElement("div");

    conteudo.className = "card-admin-conteudo";

    /* ===============================================
         NOME
         =============================================== */

    const nome = document.createElement("h3");

    nome.textContent = produto.nome;

    /* ===============================================
         DESCRIÇÃO
         =============================================== */

    const descricao = document.createElement("p");

    descricao.textContent = produto.descricao || "Sem descrição cadastrada.";

    /* ===============================================
         PREÇO
         =============================================== */

    const preco = document.createElement("p");

    preco.className = "preco";

    preco.textContent = formatarPreco(produto.preco);

    /* ===============================================
         ESTOQUE
         =============================================== */

    const estoque = document.createElement("p");

    estoque.textContent = `Estoque: ${produto.estoque} ${
      produto.unidade || "unidade"
    }`;

    /* ===============================================
         AÇÕES
         =============================================== */

    const acoes = document.createElement("div");

    acoes.className = "card-admin-acoes";

    /* ===============================================
         BOTÃO EDITAR
         =============================================== */

    const btnEditar = document.createElement("button");

    btnEditar.type = "button";

    btnEditar.className = "btn-editar";

    btnEditar.textContent = "Editar";

    btnEditar.addEventListener("click", () => {
      editarProduto(produto);
    });

    /* ===============================================
         BOTÃO EXCLUIR
         =============================================== */

    const btnRemover = document.createElement("button");

    btnRemover.type = "button";

    btnRemover.className = "btn-remover-produto";

    btnRemover.textContent = "Excluir";

    btnRemover.addEventListener("click", () => {
      excluirProduto(produto.id);
    });

    /* ===============================================
         MONTAR AÇÕES
         =============================================== */

    acoes.appendChild(btnEditar);

    acoes.appendChild(btnRemover);

    /* ===============================================
         MONTAR CARD
         =============================================== */

    conteudo.appendChild(nome);

    conteudo.appendChild(descricao);

    conteudo.appendChild(preco);

    conteudo.appendChild(estoque);

    conteudo.appendChild(acoes);

    card.appendChild(imagem);

    card.appendChild(conteudo);

    listaAdmin.appendChild(card);
  });
}

/* =====================================================
   BUSCAR PRODUTOS
   ===================================================== */

function filtrarProdutos() {
  const termo = campoBusca.value.trim().toLowerCase();

  if (!termo) {
    renderizarProdutos(produtos);

    return;
  }

  const resultado = produtos.filter((produto) => {
    const nome = produto.nome?.toLowerCase() || "";

    const descricao = produto.descricao?.toLowerCase() || "";

    return nome.includes(termo) || descricao.includes(termo);
  });

  renderizarProdutos(resultado);
}

/* =====================================================
   EDITAR PRODUTO
   ===================================================== */

function editarProduto(produto) {
  produtoEmEdicao = produto;

  document.getElementById("nome").value = produto.nome || "";

  document.getElementById("preco").value = produto.preco ?? "";

  document.getElementById("descricao").value = produto.descricao || "";

  document.getElementById("estoque").value = produto.estoque ?? 0;

  document.getElementById("unidade").value = produto.unidade || "unidade";

  /*
   * O campo file não pode ser preenchido
   * automaticamente por segurança do navegador.
   *
   * Portanto a foto antiga continua sendo usada
   * até que o administrador escolha outra.
   */

  mostrarMensagem(`Editando "${produto.nome}".`);

  atualizarBotaoFormulario("Salvar alterações");

  adicionarBotaoCancelarEdicao();

  formularioProduto.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/* =====================================================
   CRIAR BOTÃO CANCELAR EDIÇÃO
   ===================================================== */

function adicionarBotaoCancelarEdicao() {
  if (!formularioProduto) {
    return;
  }

  let botaoCancelar = document.getElementById("btn-cancelar-edicao");

  if (botaoCancelar) {
    return;
  }

  botaoCancelar = document.createElement("button");

  botaoCancelar.type = "button";

  botaoCancelar.id = "btn-cancelar-edicao";

  botaoCancelar.className = "btn-cancelar-edicao";

  botaoCancelar.textContent = "Cancelar edição";

  botaoCancelar.addEventListener("click", cancelarEdicao);

  formularioProduto.appendChild(botaoCancelar);
}

/* =====================================================
   REMOVER BOTÃO CANCELAR
   ===================================================== */

function removerBotaoCancelarEdicao() {
  const botaoCancelar = document.getElementById("btn-cancelar-edicao");

  if (botaoCancelar) {
    botaoCancelar.remove();
  }
}

/* =====================================================
   NOVA VERSÃO DO LIMPAR FORMULÁRIO
   ===================================================== */

function limparFormulario() {
  if (!formularioProduto) {
    return;
  }

  formularioProduto.reset();

  produtoEmEdicao = null;

  atualizarBotaoFormulario("+ Cadastrar Produto");

  removerBotaoCancelarEdicao();
}

/* =====================================================
   ATUALIZAR PRODUTO
   ===================================================== */

async function atualizarProduto() {
  if (!produtoEmEdicao) {
    mostrarMensagem("Nenhum produto selecionado para edição.", "erro");

    return;
  }

  try {
    mostrarMensagem("Atualizando produto...");

    /* =================================================
       PEGAR NOVOS VALORES
       ================================================= */

    const nome = document.getElementById("nome").value.trim();

    const preco = Number(document.getElementById("preco").value);

    const descricao = document.getElementById("descricao").value.trim();

    const estoque = Number(document.getElementById("estoque").value);

    const unidade = document.getElementById("unidade").value;

    const fotoInput = document.getElementById("foto");

    const novaFoto =
      fotoInput && fotoInput.files.length > 0 ? fotoInput.files[0] : null;

    /* =================================================
       VALIDAÇÕES
       ================================================= */

    if (!nome) {
      mostrarMensagem("Informe o nome do produto.", "erro");

      return;
    }

    if (Number.isNaN(preco) || preco < 0) {
      mostrarMensagem("Informe um preço válido.", "erro");

      return;
    }

    if (Number.isNaN(estoque) || estoque < 0) {
      mostrarMensagem("Informe um estoque válido.", "erro");

      return;
    }

    if (!validarArquivoImagem(novaFoto)) {
      return;
    }

    /* =================================================
       FOTO ATUAL
       ================================================= */

    const fotoAntiga = produtoEmEdicao.foto || null;

    let fotoFinal = fotoAntiga;

    let novaFotoEnviada = null;

    /* =================================================
       SE ESCOLHEU NOVA FOTO
       ================================================= */

    if (novaFoto) {
      mostrarMensagem("Enviando nova imagem...");

      novaFotoEnviada = await enviarImagem(novaFoto);

      fotoFinal = novaFotoEnviada;
    }

    /* =================================================
       UPDATE NO BANCO
       ================================================= */

    mostrarMensagem("Salvando alterações...");

    const { data, error } = await supabaseClient
      .from("produto")
      .update({
        nome: nome,

        preco: preco,

        descricao: descricao || null,

        estoque: estoque,

        unidade: unidade,

        foto: fotoFinal,
      })
      .eq("id", produtoEmEdicao.id)
      .select();

    /* =================================================
       ERRO NO UPDATE
       ================================================= */

    if (error) {
      console.error("Erro ao atualizar produto:", error);

      /*
       * Se uma nova imagem foi enviada,
       * mas o UPDATE falhou,
       * removemos a nova imagem.
       */

      if (novaFotoEnviada) {
        await removerImagemNova(novaFotoEnviada);
      }

      mostrarMensagem("Não foi possível atualizar o produto.", "erro");

      return;
    }

    /* =================================================
       REMOVER FOTO ANTIGA
       ================================================= */

    if (novaFotoEnviada && fotoAntiga && fotoAntiga !== novaFotoEnviada) {
      const fotoRemovida = await removerImagemDoStorage(fotoAntiga);

      if (!fotoRemovida) {
        console.warn(
          "A nova foto foi salva, mas a foto antiga não foi removida.",
        );
      }
    }

    /* =================================================
       SUCESSO
       ================================================= */

    console.log("Produto atualizado:", data);

    mostrarMensagem("Produto atualizado com sucesso!");

    limparFormulario();

    await carregarProdutos();
  } catch (erro) {
    console.error("Erro ao atualizar produto:", erro);

    mostrarMensagem(
      erro.message || "Ocorreu um erro ao atualizar o produto.",
      "erro",
    );
  }
}

/* =====================================================
   EXCLUIR PRODUTO
   ===================================================== */

async function excluirProduto(id) {
  const confirmar = window.confirm("Deseja realmente excluir este produto?");

  if (!confirmar) {
    return;
  }

  try {
    mostrarMensagem("Excluindo produto...");

    /* =================================================
       BUSCAR FOTO DO PRODUTO
       ================================================= */

    const { data: produto, error: buscaError } = await supabaseClient
      .from("produto")
      .select("foto")
      .eq("id", id)
      .single();

    if (buscaError) {
      console.error("Erro ao buscar produto:", buscaError);

      mostrarMensagem("Não foi possível localizar o produto.", "erro");

      return;
    }

    /* =================================================
       EXCLUIR PRODUTO DO BANCO
       ================================================= */

    const { error: deleteError } = await supabaseClient
      .from("produto")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erro ao excluir produto:", deleteError);

      mostrarMensagem("Não foi possível excluir o produto.", "erro");

      return;
    }

    /* =================================================
       EXCLUIR FOTO
       ================================================= */

    let fotoRemovida = true;

    if (produto && produto.foto) {
      fotoRemovida = await removerImagemDoStorage(produto.foto);
    }

    /* =================================================
       ATUALIZAR LISTA
       ================================================= */

    await carregarProdutos();

    if (fotoRemovida) {
      mostrarMensagem("Produto excluído com sucesso!");
    } else {
      mostrarMensagem(
        "Produto excluído, mas a foto permaneceu no Storage.",
        "erro",
      );
    }
  } catch (erro) {
    console.error("Erro ao excluir:", erro);

    mostrarMensagem("Ocorreu um erro ao excluir o produto.", "erro");
  }
}

/* =====================================================
   SAIR
   ===================================================== */

function sair() {
  window.location.href = "../index.html";
}

/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();

  carregarHorarios();

  if (formularioProduto) {
    formularioProduto.addEventListener("submit", cadastrarProduto);
  }

  if (campoBusca) {
    campoBusca.addEventListener("input", filtrarProdutos);
  }

  const botaoSalvarHorarios = document.getElementById("btn-salvar-horarios");

  if (botaoSalvarHorarios) {
    botaoSalvarHorarios.addEventListener("click", salvarHorarios);
  }
});
