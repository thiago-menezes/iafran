// Constantes
// API chamada via backend Vercel (/api/generate)

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

// Chamar API Backend (Vercel Function)
async function callBackend(userPrompt) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userPrompt }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao gerar ganchos");
  }

  return data.content;
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
    const result = await callBackend(userPrompt);
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
