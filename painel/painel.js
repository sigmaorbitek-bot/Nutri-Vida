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
   VALIDAR ARQUIVO
   ===================================================== */

function validarArquivoImagem(arquivo) {
  if (!arquivo) {
    return true;
  }

  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  const tamanhoMaximo = 5 * 1024 * 1024; // 5 MB

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
   CADASTRAR PRODUTO
   ===================================================== */

async function cadastrarProduto(event) {
  event.preventDefault();

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
           INSERT NO BANCO
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
           ERRO NO BANCO
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
    /* =================================================
               CARD
               ================================================= */

    const card = document.createElement("article");

    card.className = "card-admin";

    /* =================================================
               FOTO
               ================================================= */

    const imagem = document.createElement("img");

    imagem.src = produto.foto || "../assets/produto-sem-foto.png";

    imagem.alt = produto.nome;

    imagem.onerror = () => {
      imagem.onerror = null;

      imagem.src = "../assets/produto-sem-foto.png";
    };

    /* =================================================
               CONTEÚDO
               ================================================= */

    const conteudo = document.createElement("div");

    conteudo.className = "card-admin-conteudo";

    /* =================================================
               NOME
               ================================================= */

    const nome = document.createElement("h3");

    nome.textContent = produto.nome;

    /* =================================================
               DESCRIÇÃO
               ================================================= */

    const descricao = document.createElement("p");

    descricao.textContent = produto.descricao || "Sem descrição cadastrada.";

    /* =================================================
               PREÇO
               ================================================= */

    const preco = document.createElement("p");

    preco.className = "preco";

    preco.textContent = formatarPreco(produto.preco);

    /* =================================================
               ESTOQUE
               ================================================= */

    const estoque = document.createElement("p");

    estoque.textContent = `Estoque: ${produto.estoque} ${
      produto.unidade || "unidade"
    }`;

    /* =================================================
               AÇÕES
               ================================================= */

    const acoes = document.createElement("div");

    acoes.className = "card-admin-acoes";

    /* =================================================
               EDITAR
               ================================================= */

    const btnEditar = document.createElement("button");

    btnEditar.type = "button";

    btnEditar.className = "btn-editar";

    btnEditar.textContent = "Editar";

    btnEditar.addEventListener("click", () => {
      editarProduto(produto);
    });

    /* =================================================
               EXCLUIR
               ================================================= */

    const btnRemover = document.createElement("button");

    btnRemover.type = "button";

    btnRemover.className = "btn-remover-produto";

    btnRemover.textContent = "Excluir";

    btnRemover.addEventListener("click", () => {
      excluirProduto(produto.id);
    });

    /* =================================================
               MONTAR AÇÕES
               ================================================= */

    acoes.appendChild(btnEditar);

    acoes.appendChild(btnRemover);

    /* =================================================
               MONTAR CARD
               ================================================= */

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
    mostrarMensagem("Excluindo produto...");

    /* =================================================
           BUSCAR A FOTO DO PRODUTO
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
           EXCLUIR FOTO DO STORAGE
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
    console.error("Erro ao excluir produto:", erro);

    mostrarMensagem("Ocorreu um erro ao excluir o produto.", "erro");
  }
}

/* =====================================================
   REMOVER IMAGEM DO STORAGE
   ===================================================== */

async function removerImagemDoStorage(urlPublica) {
  try {
    const marcador = "/storage/v1/object/public/produtos/";

    const indice = urlPublica.indexOf(marcador);

    if (indice === -1) {
      console.warn(
        "URL da imagem não pertence ao bucket produtos:",
        urlPublica,
      );

      return false;
    }

    const caminho = urlPublica.substring(indice + marcador.length);

    if (!caminho) {
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
   REMOVER IMAGEM DO STORAGE
   ===================================================== */

async function removerImagemDoStorage(urlPublica) {
  try {
    const marcador = "/storage/v1/object/public/produtos/";

    const indice = urlPublica.indexOf(marcador);

    if (indice === -1) {
      return;
    }

    const caminho = urlPublica.substring(indice + marcador.length);

    if (!caminho) {
      return;
    }

    const { error } = await supabaseClient.storage
      .from("produtos")
      .remove([caminho]);

    if (error) {
      console.warn("Não foi possível remover a imagem:", error);
    }
  } catch (erro) {
    console.warn("Erro ao remover imagem:", erro);
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
