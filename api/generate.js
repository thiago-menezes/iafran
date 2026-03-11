export const config = {
  runtime: "edge",
};

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

IMPORTANTE: Mantenha sempre o foco em autenticidade. O melhor UGC não parece propaganda, parece recomendação genuína de uma amiga.

## RESTRIÇÕES DE SAÍDA (MUITO IMPORTANTE)
- SEMPRE comece direto com o conteúdo. NUNCA use introduções como "Claro! Aqui estão...", "Com certeza!", etc.
- NUNCA termine com perguntas ou sugestões do tipo "Quer que eu adapte...", "Posso ajudar em algo mais?".
- Apenas entregue os ganchos organizados e a dica prática final.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // const authHeader = req.headers.get("Authorization");
    // if (!authHeader) {
    //   return new Response(
    //     JSON.stringify({ error: "Missing Authorization header" }),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     },
    //   );
    // }

    // const token = authHeader.replace("Bearer ", "");

    // // Validar token na Kiwify
    // // Usamos o endpoint de sales com limit=1 apenas para verificar se o token é válido e autenticado.
    // const kiwifyResponse = await fetch(
    //   "https://public-api.kiwify.com.br/v1/sales?limit=1",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       "x-kiwify-account-id": process.env.KIWIFY_ACCOUNT_ID,
    //     },
    //   },
    // );

    // if (!kiwifyResponse.ok) {
    //   // Fallback: Se não conseguir validar /viewer, tenta outro endpoint ou retorna erro
    //   // Dependendo da documentação exata, o endpoint de validação de token pode variar.
    //   // Assumindo que se a chamada falhar (401), o token é inválido.
    //   return new Response(
    //     JSON.stringify({ error: "Invalid or expired token" }),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     },
    //   );
    // }

    const { userPrompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API Key not configured on server");
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2500,
          thinkingConfig: {
            thinking_level: "low",
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Erro ao chamar API do Gemini");
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
