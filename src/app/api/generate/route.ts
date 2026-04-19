import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, context, messages, tone = 'normal', replyTo } = body;
    const responseSize = String(body?.responseSize || 'texto-normal');
    const model = String(body?.model || 'groq');

    const hasMessages = Array.isArray(messages) && messages.length > 0;
    const hasPrompt = typeof prompt === 'string' && prompt.trim().length > 0;
    if (!hasMessages && !hasPrompt) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
    }

    // Configurações baseadas no tom
    let systemPrompt = "Você é um redator de IA útil e versátil para criar conteúdo para a Fábrica de Cupons. IMPORTANTE: Não use formatação Markdown (como **negrito**, *itálico*, # títulos) a menos que o usuário solicite explicitamente. Use apenas texto puro e emojis. Mantenha as quebras de linha para separar parágrafos.";
    let temperature = 0.7;
    let max_tokens = 800;
    let responseSizePrompt = '';

    switch (tone) {
      case 'persuasive':
        systemPrompt = "Você é um especialista em copywriting e vendas persuasivas. Seu objetivo é criar textos que convertam, usando gatilhos mentais, escassez e benefícios claros. Use emojis estrategicamente. Foque em promoções e ofertas irresistíveis. IMPORTANTE: Não use Markdown. Apenas texto puro.";
        temperature = 0.9; // Mais criativo
        break;
      case 'fun':
        systemPrompt = "Você é um redator divertido, descontraído e cheio de energia. Use gírias leves, muitos emojis e um tom amigável e jovial. Faça piadas quando apropriado, mas mantenha o foco em ajudar. IMPORTANTE: Não use Markdown. Apenas texto puro.";
        temperature = 1.0; // Muito criativo e variado
        break;
      case 'serious':
        systemPrompt = "Você é um redator profissional, direto e formal. Forneça informações precisas e concisas, sem uso excessivo de emojis ou linguagem informal. Priorize clareza e objetividade. IMPORTANTE: Não use Markdown. Apenas texto puro.";
        temperature = 0.3; // Mais focado e consistente
        break;
      case 'normal':
      default:
        systemPrompt = "Você é a Lu, uma redator virtual inteligente e prestativa da Fábrica de Cupons. Você ajuda a criar conteúdo, descrições de produtos, ideias para posts e tira dúvidas gerais. Seja educada, clara e use emojis moderadamente. Siga as instruções do usuário com precisão. IMPORTANTE: Não use Markdown. Apenas texto puro.";
        temperature = 0.7;
        break;
    }

    switch (responseSize) {
      case 'descricao-curta':
        max_tokens = 200;
        responseSizePrompt = 'Responda de forma curta e direta, com até 3 frases.';
        break;
      case 'descricao-longa':
        max_tokens = 600;
        responseSizePrompt = 'Responda com mais detalhes, mantendo clareza e fluidez.';
        break;
      case 'texto-longo':
        max_tokens = 800;
        responseSizePrompt = 'Responda com um texto longo e completo, explorando o tema.';
        break;
      case 'paragrafos-bem-dividido':
        max_tokens = 1000;
        temperature = Math.max(temperature, 0.8);
        responseSizePrompt = 'Divida a resposta em parágrafos bem estruturados com quebras de linha.';
        break;
      case 'titulo':
        max_tokens = 150;
        responseSizePrompt = 'Gere um título magnetico e atraente. Apenas o título, sem explicações.';
        break;
      case 'resposta-inteligente':
        max_tokens = 1500;
        temperature = Math.max(temperature, 0.8);
        responseSizePrompt = `Estruture a resposta de forma profissional e bem organizada, similar ao ChatGPT/Claude:
- Use títulos principais com # (ex: # Título Principal)
- Use subtítulos com ## (ex: ## Subtítulo)
- Use tópicos com - (ex: - Tópico 1)
- Separe seções com quebras de linha duplas
- Use **negrito** para destacar palavras-chave
- Mantenha parágrafos concisos e bem estruturados
- Se houver múltiplas ideias, organize em seções claras`;
        break;
      case 'texto-normal':
      default:
        max_tokens = 400;
        responseSizePrompt = 'Responda com um texto de tamanho médio e objetivo.';
        break;
    }

    systemPrompt = `${systemPrompt} ${responseSizePrompt}`.trim();

    let apiMessages: any[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    if (messages && Array.isArray(messages)) {
      // Histórico completo do chat
      // Sanitize messages to remove client-only fields like isTyping
      const sanitizedMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));
      apiMessages = [...apiMessages, ...sanitizedMessages];
      
      // Se houver uma mensagem específica sendo respondida, adicionamos contexto na última mensagem
      if (replyTo) {
        const lastMsg = apiMessages[apiMessages.length - 1];
        if (lastMsg.role === 'user') {
          lastMsg.content = `[Respondendo à mensagem: "${replyTo.text.substring(0, 100)}..."]\n\n${lastMsg.content}`;
        }
      }
    } else {
      // Suporte legado (geração única)
      const userContent = context 
        ? `Contexto: ${context}\n\nTarefa: ${prompt}`
        : prompt;
        
      apiMessages.push({
        role: "user",
        content: userContent
      });
    }

    if (model !== 'groq') {
      const validPollinationsModels = ['qwen-safety', 'nova-fast', 'mistral', 'gemini-fast'];
      const pollinationsModel = validPollinationsModels.includes(model) ? model : 'qwen-safety';
      
      // Construir o prompt completo com contexto do sistema
      const pollinationsPrompt = apiMessages
        .map((msg) => {
          const roleLabel = msg.role === 'assistant' ? 'Assistente' : msg.role === 'user' ? 'Usuário' : 'Sistema';
          return `${roleLabel}: ${msg.content}`;
        })
        .join('\n\n');
      
      // Nova URL da API do Pollinations (sem key na URL)
      const pollinationsUrl = `https://text.pollinations.ai/${encodeURIComponent(pollinationsPrompt)}?model=${encodeURIComponent(pollinationsModel)}`;
      
      const pollinationsResponse = await fetch(pollinationsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });
      
      if (!pollinationsResponse.ok) {
        const errorText = await pollinationsResponse.text().catch(() => '');
        console.error('Erro Pollinations:', pollinationsResponse.status, errorText);
        return NextResponse.json({ 
          error: `Falha ao gerar texto com ${model} (${pollinationsResponse.status})` 
        }, { status: 500 });
      }
      
      const text = (await pollinationsResponse.text()).trim();
      
      if (!text) {
        return NextResponse.json({ 
          error: 'Resposta vazia do modelo' 
        }, { status: 500 });
      }
      
      return NextResponse.json({ text, reply: text });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Configuração ausente: GROQ_API_KEY' }, { status: 500 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.3-70b-versatile",
      temperature,
      max_tokens,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    
    // Retorna tanto 'text' quanto 'reply' para compatibilidade
    return NextResponse.json({ text, reply: text });

  } catch (error) {
    console.error("Erro no Groq:", error);
    let errorMessage = 'Falha ao gerar texto';
    if (error instanceof Error && error.message) {
      const normalized = error.message.toLowerCase();
      if (normalized.includes('api key') || normalized.includes('api_key') || normalized.includes('unauthorized')) {
        errorMessage = 'Chave GROQ_API_KEY inválida ou ausente';
      } else {
        errorMessage = error.message;
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
