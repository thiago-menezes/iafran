// Elementos DOM - Perfil do Creator
const profileElements = {
  creatorNome: document.getElementById("creatorNome"),
  creatorEstado: document.getElementById("creatorEstado"),
  creatorNicho: document.getElementById("creatorNicho"),
  creatorExpressoes: document.getElementById("creatorExpressoes"),
  creatorInfo: document.getElementById("creatorInfo"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
};

// Elementos DOM - Roteiro
const scriptElements = {
  nomeProduto: document.getElementById("nomeProduto"),
  marca: document.getElementById("marca"),
  categoriaProduto: document.getElementById("categoriaProduto"),
  descricaoProduto: document.getElementById("descricaoProduto"),
  beneficios: document.getElementById("beneficios"),
  objetivo: document.getElementById("objetivo"),
  duracao: document.getElementById("duracao"),
  duracaoValue: document.getElementById("duracaoValue"),
  tomRoteiro: document.getElementById("tomRoteiro"),
  tipoHook: document.getElementById("tipoHook"),
  cupom: document.getElementById("cupom"),
  linkCta: document.getElementById("linkCta"),
  briefing: document.getElementById("briefing"),
  quantidadeRoteiros: document.getElementById("quantidadeRoteiros"),
  detalhesAdicionais: document.getElementById("detalhesAdicionais"),
  generateBtn: document.getElementById("generateBtn"),
};

// Elementos DOM - UI
const uiElements = {
  copyAllBtn: document.getElementById("copyAllBtn"),
  loadingState: document.getElementById("loadingState"),
  resultsContainer: document.getElementById("resultsContainer"),
  resultsContent: document.getElementById("resultsContent"),
  errorState: document.getElementById("errorState"),
  emptyState: document.getElementById("emptyState"),
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadProfile();
  resetState();
});

function resetState() {
  if (uiElements.emptyState) uiElements.emptyState.style.display = "flex";
  if (uiElements.loadingState) uiElements.loadingState.style.display = "none";
  if (uiElements.resultsContainer)
    uiElements.resultsContainer.style.display = "none";
  if (uiElements.errorState) uiElements.errorState.style.display = "none";
}

// Event Listeners
function setupEventListeners() {
  // Atualizar valor da duração em tempo real
  if (scriptElements.duracao) {
    scriptElements.duracao.addEventListener("input", (e) => {
      scriptElements.duracaoValue.textContent = e.target.value;
    });
  }

  if (profileElements.saveProfileBtn) {
    profileElements.saveProfileBtn.addEventListener("click", saveProfile);
  }

  if (scriptElements.generateBtn) {
    scriptElements.generateBtn.addEventListener("click", handleGenerate);
  }

  if (uiElements.copyAllBtn) {
    uiElements.copyAllBtn.addEventListener("click", copyAllContent);
  }
}

// Salvar perfil no localStorage
function saveProfile() {
  const tomVozChecked = Array.from(
    document.querySelectorAll('input[name="tomVoz"]:checked')
  ).map((cb) => cb.value);

  const cenariosChecked = Array.from(
    document.querySelectorAll('input[name="cenarios"]:checked')
  ).map((cb) => cb.value);

  const profile = {
    nome: profileElements.creatorNome.value.trim(),
    estado: profileElements.creatorEstado.value,
    nicho: profileElements.creatorNicho.value,
    tomVoz: tomVozChecked,
    expressoes: profileElements.creatorExpressoes.value.trim(),
    cenarios: cenariosChecked,
    info: profileElements.creatorInfo.value.trim(),
  };

  // Validação básica
  if (!profile.nome || !profile.estado || !profile.nicho) {
    showToast("Preencha os campos obrigatórios do perfil (*, nome, estado, nicho)", "error");
    return;
  }

  if (profile.tomVoz.length === 0) {
    showToast("Selecione pelo menos um tom de voz", "error");
    return;
  }

  localStorage.setItem("creatorProfile", JSON.stringify(profile));
  showToast("Perfil salvo com sucesso!");

  // Animação visual no botão
  profileElements.saveProfileBtn.innerHTML = '<i class="ti ti-check"></i> Salvo!';
  setTimeout(() => {
    profileElements.saveProfileBtn.innerHTML =
      '<i class="ti ti-device-floppy"></i> Salvar Perfil';
  }, 2000);
}

// Carregar perfil do localStorage
function loadProfile() {
  const saved = localStorage.getItem("creatorProfile");
  if (!saved) return;

  try {
    const profile = JSON.parse(saved);

    profileElements.creatorNome.value = profile.nome || "";
    profileElements.creatorEstado.value = profile.estado || "";
    profileElements.creatorNicho.value = profile.nicho || "";
    profileElements.creatorExpressoes.value = profile.expressoes || "";
    profileElements.creatorInfo.value = profile.info || "";

    // Restaurar checkboxes de tom de voz
    if (profile.tomVoz && profile.tomVoz.length > 0) {
      profile.tomVoz.forEach((tom) => {
        const checkbox = document.querySelector(`input[name="tomVoz"][value="${tom}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }

    // Restaurar checkboxes de cenários
    if (profile.cenarios && profile.cenarios.length > 0) {
      profile.cenarios.forEach((cenario) => {
        const checkbox = document.querySelector(
          `input[name="cenarios"][value="${cenario}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    showToast("Perfil carregado!", "success");
  } catch (e) {
    console.error("Erro ao carregar perfil:", e);
  }
}

// Validar formulário
function validateForm() {
  // Validar perfil
  const profile = getProfile();
  if (!profile.nome || !profile.estado || !profile.nicho) {
    showError(
      "Por favor, preencha e salve seu perfil de creator antes de gerar roteiros"
    );
    return false;
  }

  if (profile.tomVoz.length === 0) {
    showError("Selecione pelo menos um tom de voz no perfil");
    return false;
  }

  // Validar dados do roteiro
  if (!scriptElements.nomeProduto.value.trim()) {
    showError("Por favor, preencha o nome do produto");
    return false;
  }

  if (!scriptElements.marca.value.trim()) {
    showError("Por favor, preencha a marca");
    return false;
  }

  if (!scriptElements.categoriaProduto.value) {
    showError("Por favor, selecione a categoria do produto");
    return false;
  }

  if (!scriptElements.descricaoProduto.value.trim()) {
    showError("Por favor, preencha a descrição do produto");
    return false;
  }

  if (!scriptElements.beneficios.value.trim()) {
    showError("Por favor, preencha os benefícios principais");
    return false;
  }

  return true;
}

// Obter perfil (do localStorage ou formulário)
function getProfile() {
  const saved = localStorage.getItem("creatorProfile");
  if (saved) {
    return JSON.parse(saved);
  }

  // Fallback: pegar do formulário atual
  const tomVozChecked = Array.from(
    document.querySelectorAll('input[name="tomVoz"]:checked')
  ).map((cb) => cb.value);

  const cenariosChecked = Array.from(
    document.querySelectorAll('input[name="cenarios"]:checked')
  ).map((cb) => cb.value);

  return {
    nome: profileElements.creatorNome.value.trim(),
    estado: profileElements.creatorEstado.value,
    nicho: profileElements.creatorNicho.value,
    tomVoz: tomVozChecked,
    expressoes: profileElements.creatorExpressoes.value.trim(),
    cenarios: cenariosChecked,
    info: profileElements.creatorInfo.value.trim(),
  };
}

// Construir prompt do usuário
function buildUserPrompt() {
  const profile = getProfile();
  const quantidade = scriptElements.quantidadeRoteiros.value;

  let prompt = `Crie ${quantidade} roteiro(s) UGC com as seguintes especificações:\n\n`;

  prompt += `**PRODUTO:** ${scriptElements.nomeProduto.value.trim()}\n`;
  prompt += `**MARCA:** ${scriptElements.marca.value.trim()}\n`;
  prompt += `**CATEGORIA:** ${getCategoriaLabel(scriptElements.categoriaProduto.value)}\n`;
  prompt += `**DESCRIÇÃO:** ${scriptElements.descricaoProduto.value.trim()}\n`;
  prompt += `**BENEFÍCIOS:** ${scriptElements.beneficios.value.trim()}\n`;
  prompt += `**OBJETIVO:** ${getObjetivoLabel(scriptElements.objetivo.value)}\n`;
  prompt += `**DURAÇÃO:** ${scriptElements.duracao.value} segundos\n`;
  prompt += `**TOM:** ${getTomLabel(scriptElements.tomRoteiro.value)}\n`;

  if (scriptElements.tipoHook.value) {
    prompt += `**TIPO DE HOOK PREFERIDO:** ${getTipoHookLabel(scriptElements.tipoHook.value)}\n`;
  }

  if (scriptElements.cupom.value.trim()) {
    prompt += `**CUPOM/OFERTA:** ${scriptElements.cupom.value.trim()}\n`;
  }

  if (scriptElements.linkCta.value.trim()) {
    prompt += `**DESTINO CTA:** ${scriptElements.linkCta.value.trim()}\n`;
  }

  if (scriptElements.briefing.value.trim()) {
    prompt += `**BRIEFING DA MARCA:** ${scriptElements.briefing.value.trim()}\n`;
  }

  if (scriptElements.detalhesAdicionais.value.trim()) {
    prompt += `**DETALHES ADICIONAIS:** ${scriptElements.detalhesAdicionais.value.trim()}\n`;
  }

  prompt += `\nGere o(s) roteiro(s) completo(s) seguindo a estrutura obrigatória.`;

  if (parseInt(quantidade) > 1) {
    prompt += ` Cada roteiro deve ter um hook DIFERENTE e abordagem DISTINTA.`;
  }

  return prompt;
}

// Construir contexto do creator para o system prompt
function buildCreatorContext() {
  const profile = getProfile();

  let context = `Nome: ${profile.nome}\n`;
  context += `Região: ${profile.estado}\n`;
  context += `Nicho: ${getNichoLabel(profile.nicho)}\n`;
  context += `Tom de voz: ${profile.tomVoz.map((t) => getTomVozLabel(t)).join(", ")}\n`;
  context += `Expressões naturais: ${profile.expressoes || "não informado"}\n`;

  if (profile.cenarios && profile.cenarios.length > 0) {
    context += `Cenários disponíveis: ${profile.cenarios.map((c) => getCenarioLabel(c)).join(", ")}\n`;
  } else {
    context += `Cenários disponíveis: não informado\n`;
  }

  context += `Info adicional: ${profile.info || "não informado"}`;

  return context;
}

// Labels
function getNichoLabel(value) {
  const labels = {
    beleza: "Beleza & Skincare",
    fitness: "Fitness & Saúde",
    lifestyle: "Lifestyle",
    tech: "Tecnologia",
    moda: "Moda",
    food: "Alimentação & Culinária",
    casa: "Casa & Decoração",
    maternidade: "Maternidade",
    pets: "Pets",
    viagem: "Viagens",
    educacao: "Educação",
    outro: "Outro",
  };
  return labels[value] || value;
}

function getCategoriaLabel(value) {
  return getNichoLabel(value);
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
    informativo: "Informativo",
    emocional: "Emocional",
    serio: "Sério/Profissional",
  };
  return labels[value] || value;
}

function getTipoHookLabel(value) {
  const labels = {
    curiosidade: "Curiosidade",
    surpresa: "Surpresa/Choque",
    provocacao: "Provocação",
    aposta: "Aposta",
    segredo: "Segredo",
    identificacao: "Identificação",
    resultado: "Resultado",
  };
  return labels[value] || value;
}

function getTomVozLabel(value) {
  const labels = {
    amiga: "Amiga próxima",
    expert: "Expert casual",
    mae: "Mãe prática",
    divertida: "Divertida",
    seria: "Séria/Profissional",
  };
  return labels[value] || value;
}

function getCenarioLabel(value) {
  const labels = {
    casa: "Casa",
    banheiro: "Banheiro",
    parque: "Parque",
    academia: "Academia",
    cozinha: "Cozinha",
    estudio: "Estúdio",
  };
  return labels[value] || value;
}

// Chamar API Backend
async function callBackend(userPrompt, creatorContext) {
  const response = await fetch("/api/generate-roteiros", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userPrompt, creatorContext }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao gerar roteiros");
  }

  return data.content;
}

// Handler principal
async function handleGenerate() {
  if (!validateForm()) return;

  const userPrompt = buildUserPrompt();
  const creatorContext = buildCreatorContext();

  // UI States
  scriptElements.generateBtn.disabled = true;
  scriptElements.generateBtn.innerHTML =
    '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0; display: inline-block; vertical-align: middle;"></div> Gerando...';

  uiElements.emptyState.style.display = "none";
  uiElements.loadingState.style.display = "flex";
  uiElements.resultsContainer.style.display = "none";
  uiElements.errorState.style.display = "none";

  try {
    const result = await callBackend(userPrompt, creatorContext);
    displayResults(result);
  } catch (error) {
    showError(error.message);
  } finally {
    scriptElements.generateBtn.disabled = false;
    scriptElements.generateBtn.innerHTML =
      '<i class="ti ti-wand"></i> Gerar Roteiros';
    uiElements.loadingState.style.display = "none";
  }
}

// Exibir resultados
function displayResults(content) {
  // Formatar markdown
  let formatted = content
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^# (.+)$/gm, "<h2>$1</h2>")
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Emojis e indicações de cena (manter como estão)
    .replace(/^(🎬|🗣️|📍|⏱️) (.+)$/gm, '<p class="script-line"><span class="emoji">$1</span> $2</p>')
    // Blockquotes
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Tables (simples)
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match
        .split("|")
        .filter((cell) => cell.trim())
        .map((cell) => `<td>${cell.trim()}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    });

  // Envolver tabelas em <table>
  formatted = formatted.replace(/(<tr>.*<\/tr>\s*)+/gs, (match) => {
    return '<table class="script-table">' + match + "</table>";
  });

  // Quebras de linha duplas
  formatted = formatted.replace(/\n\n/g, "<br><br>");

  uiElements.resultsContent.innerHTML = formatted;
  uiElements.resultsContainer.style.display = "block";
}

// Copiar todo o conteúdo
function copyAllContent() {
  const text = uiElements.resultsContent.innerText;
  copyToClipboard(text);
  showToast("Roteiros copiados!");
}

// Copiar para clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

// Mostrar erro
function showError(message) {
  uiElements.errorState.querySelector(".error-message").textContent = message;
  uiElements.errorState.style.display = "block";
  uiElements.resultsContainer.style.display = "none";
  uiElements.emptyState.style.display = "none";
}

// Toast notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = "toast";

  const icon = type === "error" ? "ti-alert-circle" : "ti-check";
  toast.innerHTML = `<i class="ti ${icon}"></i> ${message}`;

  if (type === "error") {
    toast.style.background = "var(--danger)";
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
