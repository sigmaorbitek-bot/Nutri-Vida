/* =====================================================
   NUTRI+VIDA - PAINEL ADMINISTRATIVO
   ===================================================== */

/* =====================================================
   CONFIGURAÇÃO DO SUPABASE
   ===================================================== */

const SUPABASE_URL = "SUA_URL_DO_SUPABASE";

const SUPABASE_ANON_KEY = "SUA_CHAVE_PUBLICA_DO_SUPABASE";

/* =====================================================
   CONEXÃO
   ===================================================== */

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

/* =====================================================
   ELEMENTOS DA PÁGINA
   ===================================================== */

const formularioProduto = document.getElementById("form-produto");

const listaAdmin = document.getElementById("lista-admin");

const mensagemCadastro = document.getElementById("msg-cadastro");

const totalProdutos = document.getElementById("total-produtos");

const campoBusca = document.getElementById("buscar-admin");

/* =====================================================
   PRODUTOS
   ===================================================== */

let produtos = [];

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
   LIMPAR FORMULÁRIO
   ===================================================== */

function limparFormulario() {
  if (!formularioProduto) {
    return;
  }

  formularioProduto.reset();
}

/* =====================================================
   CADASTRAR PRODUTO
   ===================================================== */

async function cadastrarProduto(event) {
  event.preventDefault();

  mostrarMensagem("Cadastrando produto...");

  try {
    const nome = document.getElementById("nome").value.trim();

    const preco = Number(document.getElementById("preco").value);

    const descricao = document.getElementById("descricao").value.trim();

    const estoque = Number(document.getElementById("estoque").value);

    const unidade = document.getElementById("unidade").value;

    const fotoInput = document.getElementById("foto");

    /* =================================================
           VALIDAÇÃO
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

    /* =================================================
           FOTO
           ================================================= */

    let fotoUrl = null;

    if (fotoInput && fotoInput.files && fotoInput.files.length > 0) {
      const arquivo = fotoInput.files[0];

      /*
       * Por enquanto vamos guardar apenas
       * a referência da foto.
       *
       * Na próxima etapa vamos fazer upload
       * para o Supabase Storage.
       */

      fotoUrl = URL.createObjectURL(arquivo);
    }

    /* =================================================
           INSERIR PRODUTO
           ================================================= */

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
           VERIFICAR ERRO
           ================================================= */

    if (error) {
      console.error("Erro ao cadastrar produto:", error);

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

    mostrarMensagem("Ocorreu um erro inesperado.", "erro");
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
    const card = document.createElement("article");

    card.className = "card-admin";

    /* FOTO */

    const imagem = document.createElement("img");

    imagem.src = produto.foto || "../assets/produto-sem-foto.png";

    imagem.alt = produto.nome;

    imagem.onerror = () => {
      imagem.onerror = null;

      imagem.src = "../assets/produto-sem-foto.png";
    };

    /* CONTEÚDO */

    const conteudo = document.createElement("div");

    conteudo.className = "card-admin-conteudo";

    /* NOME */

    const nome = document.createElement("h3");

    nome.textContent = produto.nome;

    /* DESCRIÇÃO */

    const descricao = document.createElement("p");

    descricao.textContent = produto.descricao || "Sem descrição cadastrada.";

    /* PREÇO */

    const preco = document.createElement("p");

    preco.className = "preco";

    preco.textContent = formatarPreco(produto.preco);

    /* ESTOQUE */

    const estoque = document.createElement("p");

    estoque.textContent = `Estoque: ${produto.estoque} ${
      produto.unidade || "unidade"
    }`;

    /* AÇÕES */

    const acoes = document.createElement("div");

    acoes.className = "card-admin-acoes";

    const btnEditar = document.createElement("button");

    btnEditar.type = "button";

    btnEditar.className = "btn-editar";

    btnEditar.textContent = "Editar";

    btnEditar.addEventListener("click", () => {
      editarProduto(produto);
    });

    const btnRemover = document.createElement("button");

    btnRemover.type = "button";

    btnRemover.className = "btn-remover-produto";

    btnRemover.textContent = "Excluir";

    btnRemover.addEventListener("click", () => {
      excluirProduto(produto.id);
    });

    acoes.appendChild(btnEditar);

    acoes.appendChild(btnRemover);

    /* MONTAGEM */

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
   BUSCA DE PRODUTOS
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
  document.getElementById("nome").value = produto.nome || "";

  document.getElementById("preco").value = produto.preco ?? "";

  document.getElementById("descricao").value = produto.descricao || "";

  document.getElementById("estoque").value = produto.estoque ?? 0;

  document.getElementById("unidade").value = produto.unidade || "unidade";

  mostrarMensagem(`Editando "${produto.nome}".`);
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
    const { error } = await supabaseClient
      .from("produto")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir produto:", error);

      window.alert("Não foi possível excluir o produto.");

      return;
    }

    await carregarProdutos();

    mostrarMensagem("Produto excluído com sucesso.");
  } catch (erro) {
    console.error(erro);

    window.alert("Ocorreu um erro ao excluir o produto.");
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

  if (formularioProduto) {
    formularioProduto.addEventListener("submit", cadastrarProduto);
  }

  if (campoBusca) {
    campoBusca.addEventListener("input", filtrarProdutos);
  }
});
