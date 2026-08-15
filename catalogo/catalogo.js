/* =====================================================
   NUTRI+VIDA - CATÁLOGO
   ===================================================== */


/* =====================================================
   CONFIGURAÇÃO DO SUPABASE
   ===================================================== */

const SUPABASE_URL =
  "https://pztyrnmxfmofpiuriswn.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_HToq5W10V9rRlI1olAtXXg_mYqbc4ZR";


/* =====================================================
   CONEXÃO COM O SUPABASE
   ===================================================== */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


console.log(
  "Supabase conectado:",
  supabaseClient
);


/* =====================================================
   ELEMENTOS DA PÁGINA
   ===================================================== */

const listaProdutos =
  document.getElementById("lista-produtos");

const produtosCarregando =
  document.getElementById("produtos-carregando");

const produtosVazio =
  document.getElementById("produtos-vazio");

const quantidadeProdutos =
  document.getElementById("quantidade-produtos");

const buscaProduto =
  document.getElementById("buscar-produto");

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
   CARREGAR PRODUTOS DO SUPABASE
   ===================================================== */

async function carregarProdutos() {
  try {
    // Mostra carregando
    produtosCarregando.classList.remove("oculto");

    produtosVazio.classList.add("oculto");

    // Busca os produtos no banco
    const { data, error } = await supabaseClient
      .from("produto")
      .select("*")
      .order("id", {
        ascending: true,
      });

    // Se o Supabase retornar erro
    if (error) {
      console.error("Erro ao carregar produtos:", error);

      mostrarErroProdutos("Não foi possível carregar os produtos.");

      return;
    }

    // Guarda os produtos
    produtos = data || [];

    // Renderiza na tela
    renderizarProdutos(produtos);
  } catch (erro) {
    console.error("Erro inesperado:", erro);

    mostrarErroProdutos("Ocorreu um erro ao carregar a loja.");
  } finally {
    produtosCarregando.classList.add("oculto");
  }
}

/* =====================================================
   RENDERIZAR PRODUTOS
   ===================================================== */

function renderizarProdutos(lista) {
  listaProdutos.innerHTML = "";

  // Atualiza quantidade
  quantidadeProdutos.textContent = `${lista.length} produto${lista.length !== 1 ? "s" : ""}`;

  // Nenhum produto
  if (lista.length === 0) {
    produtosVazio.classList.remove("oculto");

    return;
  }

  produtosVazio.classList.add("oculto");

  // Cria os cards
  lista.forEach((produto) => {
    const card = document.createElement("article");

    card.className = "card-produto";

    // Foto
    const imagem = document.createElement("img");

    imagem.src = produto.foto || "./assets/produto-sem-foto.png";

    imagem.alt = produto.nome;

    // Conteúdo
    const conteudo = document.createElement("div");

    conteudo.className = "card-produto-conteudo";

    // Nome
    const nome = document.createElement("h3");

    nome.textContent = produto.nome;

    // Descrição
    const descricao = document.createElement("p");

    descricao.textContent =
      produto.descricao || "Produto natural selecionado pela Nutri+Vida.";

    // Preço
    const preco = document.createElement("span");

    preco.className = "preco";

    preco.textContent = formatarPreco(produto.preco);

    // Estoque
    const estoque = document.createElement("p");

    estoque.className = "produto-estoque";

    if (produto.estoque > 0) {
      estoque.textContent = `Disponível: ${produto.estoque} ${produto.unidade || "unidade"}`;
    } else {
      estoque.textContent = "Produto esgotado";

      estoque.classList.add("produto-esgotado");
    }

    // Botão
    const botao = document.createElement("button");

    botao.type = "button";

    botao.textContent =
      produto.estoque > 0 ? "🛒 Adicionar ao carrinho" : "Produto esgotado";

    // Desabilita se estiver sem estoque
    botao.disabled = produto.estoque <= 0;

    // Ação do botão
    botao.addEventListener("click", () => {
      adicionarAoCarrinho(produto);
    });

    // Monta conteúdo
    conteudo.appendChild(nome);

    conteudo.appendChild(descricao);

    conteudo.appendChild(preco);

    conteudo.appendChild(estoque);

    conteudo.appendChild(botao);

    // Monta card
    card.appendChild(imagem);

    card.appendChild(conteudo);

    // Adiciona na página
    listaProdutos.appendChild(card);
  });
}

/* =====================================================
   PRODUTO SEM FOTO / FOTO COM ERRO
   ===================================================== */

function mostrarImagemPadrao(imagem) {
  imagem.onerror = () => {
    imagem.onerror = null;

    imagem.src = "./assets/produto-sem-foto.png";
  };
}

/* =====================================================
   ADICIONAR AO CARRINHO
   ===================================================== */

function adicionarAoCarrinho(produto) {
  console.log("Produto selecionado:", produto);

  mostrarToast(`${produto.nome} foi selecionado.`);
}

/* =====================================================
   FILTRAR PRODUTOS
   ===================================================== */

function filtrarProdutos() {
  const termo = buscaProduto.value.trim().toLowerCase();

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
   MENSAGEM DE ERRO
   ===================================================== */

function mostrarErroProdutos(mensagem) {
  listaProdutos.innerHTML = "";

  quantidadeProdutos.textContent = "Erro ao carregar produtos";

  produtosVazio.classList.remove("oculto");

  const texto = produtosVazio.querySelector("p");

  if (texto) {
    texto.textContent = mensagem;
  }
}

/* =====================================================
   TOAST
   ===================================================== */

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");

  if (!toast) {
    return;
  }

  toast.textContent = mensagem;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* =====================================================
   VOLTAR PARA A TELA INICIAL
   ===================================================== */

function Voltar() {
  window.location.href = "../index.html";
}

/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();

  if (buscaProduto) {
    buscaProduto.addEventListener("input", filtrarProdutos);
  }
});
