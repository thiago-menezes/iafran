// Constantes
// TODO: Substituir por process.env.OPENAI_API_KEY quando houver build system
const API_KEY = ""; // Insira sua chave aqui ou configure via .env no build

// Sistema de prompt do agente
const SYSTEM_PROMPT = `Você é um agente especializado em criar ganchos virais para criadoras de conteúdo UGC (User Generated Content). Seu objetivo é ajudar criadoras a desenvolverem aberturas impactantes para seus vídeos e conteúdos, maximizando retenção, engajamento e conversão para marcas.

## EXPERTISE
- Copywriting para vídeos curtos (TikTok, Reels, Shorts)
- Psicologia de gatilhos mentais aplicada a UGC
- Tendências de conteúdo viral no Brasil
- Estratégias de storytelling para vendas orgânicas
- Linguagem natural e conversacional do público brasileiro

## DIRETRIZES DE CRIAÇÃO

### Tom de voz:
- Natural e conversacional (como se estivesse falando com uma amiga)
- Informal, mas profissional
- Português brasileiro autêntico
- Evite jargões marketeiros óbvios
- Use linguagem que soa genuína, não roteirizada

### Estrutura dos ganchos:
- Máximo de 15-20 palavras
- Criar curiosidade ou tensão nos primeiros 2 segundos
- Usar padrões que quebram o scroll
- Incluir elementos de personalização (eu, meu, comigo)
- Evitar clichês batidos de vendas diretas

### Gatilhos mentais prioritários:
- Curiosidade (o que vai acontecer?)
- Identificação (isso é comigo!)
- Prova social (outras pessoas usam/aprovam)
- Descoberta (segredo revelado)
- Transformação (antes vs depois)
- Surpresa (resultado inesperado)

### O que EVITAR:
- Ganchos genéricos que servem para qualquer produto
- Promessas exageradas ou irreais
- Linguagem de "vendedor de telemarketing"
- Fórmulas muito batidas ou queimadas
- Clickbait sem entrega de valor

## FORMATO DE RESPOSTA

Sempre organize os ganchos em categorias:
- **CURIOSIDADE** • Ganchos que criam suspense e prendem atenção
- **DOR/SOLUÇÃO** • Ganchos que conectam emocionalmente com problemas
- **AUTORIDADE/EXPERIÊNCIA** • Ganchos que criam credibilidade
- **TRANSFORMAÇÃO** • Ganchos de antes/depois
- **URGÊNCIA/FOMO** • Ganchos de escassez e exclusividade

Cada categoria deve ter entre 3-5 ganchos.

Ao final, adicione uma dica prática de uso.

IMPORTANTE: Mantenha sempre o foco em autenticidade. O melhor UGC não parece propaganda, parece recomendação genuína de uma amiga.`;

// Elementos DOM
const elements = {
  nicho: document.getElementById("nicho"),
  produtoEspecifico: document.getElementById("produtoEspecifico"),
  objetivo: document.getElementById("objetivo"),
  tom: document.getElementById("tom"),
  quantidade: document.getElementById("quantidade"),
  detalhesAdicionais: document.getElementById("detalhesAdicionais"),
  generateBtn: document.getElementById("generateBtn"),
  copyAllBtn: document.getElementById("copyAllBtn"),
  loadingState: document.getElementById("loadingState"),
  resultsContainer: document.getElementById("resultsContainer"),
  resultsContent: document.getElementById("resultsContent"),
  errorState: document.getElementById("errorState"),
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  if (elements.generateBtn) {
    elements.generateBtn.addEventListener("click", handleGenerate);
  }

  if (elements.copyAllBtn) {
    elements.copyAllBtn.addEventListener("click", copyAllHooks);
  }

  // Logout Button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Copiar gancho individual ao clicar
  if (elements.resultsContent) {
    elements.resultsContent.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        copyToClipboard(e.target.textContent);
        showToast("Gancho copiado!");
      }
    });
  }
}

// Validar formulário
function validateForm() {
  const nicho = elements.nicho.value;

  if (!API_KEY) {
    showError("API Key não configurada no código (.env)");
    return false;
  }

  if (!nicho) {
    showError("Por favor, selecione o nicho/categoria do produto");
    return false;
  }

  return true;
}

// Construir prompt do usuário
function buildUserPrompt() {
  const nicho = elements.nicho.value;
  const produto = elements.produtoEspecifico.value.trim();
  const objetivo = elements.objetivo.value;
  const tom = elements.tom.value;
  const quantidade = elements.quantidade.value;
  const detalhes = elements.detalhesAdicionais.value.trim();

  let prompt = `Crie ${quantidade} ganchos virais para UGC com as seguintes características:\n\n`;

  prompt += `**Nicho/Categoria:** ${getNichoLabel(nicho)}\n`;

  if (produto) {
    prompt += `**Produto Específico:** ${produto}\n`;
  }

  prompt += `**Objetivo:** ${getObjetivoLabel(objetivo)}\n`;
  prompt += `**Tom:** ${getTomLabel(tom)}\n`;

  if (detalhes) {
    prompt += `**Detalhes Adicionais:** ${detalhes}\n`;
  }

  prompt += `\nOrganize os ganchos por categoria (Curiosidade, Dor/Solução, Autoridade/Experiência, Transformação, Urgência/FOMO) e adicione uma dica prática ao final.`;

  return prompt;
}

// Labels para os campos
function getNichoLabel(value) {
  const labels = {
    beleza: "Beleza & Skincare",
    tecnologia: "Tecnologia",
    lifestyle: "Lifestyle",
    casa: "Casa & Decoração",
    moda: "Moda",
    fitness: "Fitness & Saúde",
    alimentacao: "Alimentação",
    pets: "Pets",
    outro: elements.produtoEspecifico.value || "Geral",
  };
  return labels[value] || value;
}

function getObjetivoLabel(value) {
  const labels = {
    awareness: "Awareness (conhecer o produto)",
    conversao: "Conversão (vender)",
    tutorial: "Tutorial/Educação",
    engajamento: "Engajamento",
  };
  return labels[value] || value;
}

function getTomLabel(value) {
  const labels = {
    divertido: "Divertido",
    serio: "Sério/Profissional",
    emocional: "Emocional",
    informativo: "Informativo",
  };
  return labels[value] || value;
}

// Chamar API da OpenAI
async function callOpenAI(apiKey, userPrompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini-2025-04-14",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Erro ao chamar API da OpenAI");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Handler principal
async function handleGenerate() {
  if (!validateForm()) return;

  const userPrompt = buildUserPrompt();

  // UI States
  elements.generateBtn.disabled = true;
  elements.loadingState.style.display = "block";
  elements.resultsContainer.style.display = "none";
  elements.errorState.style.display = "none";

  try {
    const result = await callOpenAI(API_KEY, userPrompt);
    displayResults(result);
  } catch (error) {
    showError(error.message);
  } finally {
    elements.generateBtn.disabled = false;
    elements.loadingState.style.display = "none";
  }
}

// Exibir resultados
function displayResults(content) {
  // Formatar markdown simples
  let formatted = content
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^# (.+)$/gm, "<h3>$1</h3>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    .replace(/^-\s+(.+)$/gm, "<li>$1</li>");

  // Agrupar LIs em ULs
  formatted = formatted.replace(/(<li>.*<\/li>\s*)+/gs, (match) => {
    return "<ul>" + match + "</ul>";
  });

  // Converter quebras de linha
  formatted = formatted.replace(/\n\n/g, "<br><br>");

  elements.resultsContent.innerHTML = formatted;
  elements.resultsContainer.style.display = "block";
}

// Copiar todos os ganchos
function copyAllHooks() {
  const allLis = elements.resultsContent.querySelectorAll("li");
  const hooks = Array.from(allLis).map((li) => li.textContent.trim());

  const text = hooks.join("\n\n");
  copyToClipboard(text);
  showToast("Todos os ganchos copiados!");
}

// Copiar para clipboard
function copyToClipboard(text) {
  const cleanText = text.replace(/📋/g, "").trim();
  navigator.clipboard.writeText(cleanText);
}

// Mostrar erro
function showError(message) {
  elements.errorState.querySelector(".error-message").textContent = message;
  elements.errorState.style.display = "block";
  elements.resultsContainer.style.display = "none";
}

// Toast notification
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
