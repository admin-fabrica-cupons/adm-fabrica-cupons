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

    // Configurações baseadas no tom - Otimizado para português brasileiro
    let systemPrompt = `Você é um redator de IA especializado em criar conteúdo para a Fábrica de Cupons, focado no mercado brasileiro. 

REGRAS IMPORTANTES:
- Use português brasileiro natural e coloquial
- NUNCA traduza nomes próprios brasileiros como "Mercado Livre", "Magazine Luiza", "Casas Bahia", "Americanas", "Shopee", "Amazon Brasil", etc.
- Mantenha nomes de marcas, lojas e produtos em seu idioma original
- Use termos brasileiros: "desconto", "promoção", "oferta", "cupom", "frete grátis", "cashback"
- Não use formatação Markdown (como **negrito**, *itálico*, # títulos) a menos que o usuário solicite explicitamente
- Use apenas texto puro e emojis. Mantenha as quebras de linha para separar parágrafos`;
    
    let temperature = 0.7;
    let max_tokens = 800;
    let responseSizePrompt = '';

    switch (tone) {
      case 'persuasive':
        systemPrompt = `Você é um especialista em copywriting e vendas persuasivas para o mercado brasileiro. 

OBJETIVO: Criar textos que convertam usando gatilhos mentais, escassez e benefícios claros.

REGRAS:
- Use linguagem brasileira natural e persuasiva
- NUNCA traduza nomes de lojas brasileiras (Mercado Livre, Magazine Luiza, Casas Bahia, etc.)
- Foque em promoções e ofertas irresistíveis
- Use emojis estrategicamente (🔥, 💰, ⚡, 🎁, 🛒)
- Destaque descontos, economia e vantagens
- Use gatilhos: urgência, escassez, prova social, autoridade
- Não use Markdown, apenas texto puro`;
        temperature = 0.9;
        break;
      case 'fun':
        systemPrompt = `Você é um redator divertido e descontraído especializado no público brasileiro.

ESTILO:
- Use gírias brasileiras leves e naturais
- Muitos emojis e tom amigável
- Linguagem jovial mas profissional
- NUNCA traduza nomes de marcas e lojas brasileiras
- Faça piadas quando apropriado
- Mantenha o foco em ajudar
- Não use Markdown, apenas texto puro`;
        temperature = 1.0;
        break;
      case 'serious':
        systemPrompt = `Você é um redator profissional especializado no mercado brasileiro.

ESTILO:
- Linguagem formal e direta em português brasileiro
- NUNCA traduza nomes próprios de empresas brasileiras
- Informações precisas e concisas
- Uso moderado de emojis
- Priorize clareza e objetividade
- Mantenha termos técnicos em português
- Não use Markdown, apenas texto puro`;
        temperature = 0.3;
        break;
      case 'normal':
      default:
        systemPrompt = `Você é a Lu, assistente virtual inteligente da Fábrica de Cupons, especializada no mercado brasileiro.

PERSONALIDADE:
- Educada, clara e prestativa
- Conhece bem o e-commerce brasileiro
- NUNCA traduz nomes de lojas brasileiras (Mercado Livre, Shopee, Amazon Brasil, etc.)
- Usa emojis moderadamente
- Segue instruções com precisão
- Linguagem natural do português brasileiro
- Não usa Markdown, apenas texto puro`;
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
      // Modelos válidos do Pollinations conforme documentação oficial
      const validPollinationsModels = ['qwen-safety', 'nova-fast', 'mistral', 'gemini-fast'];
      const pollinationsModel = validPollinationsModels.includes(model) ? model : 'openai';
      
      try {
        // Usar a API v1/chat/completions do Pollinations (compatível com OpenAI)
        const pollinationsResponse = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: pollinationsModel,
            messages: apiMessages,
            temperature,
            max_tokens,
          }),
        });
        
        if (!pollinationsResponse.ok) {
          const errorData = await pollinationsResponse.json().catch(() => ({}));
          console.error('Erro Pollinations:', pollinationsResponse.status, errorData);
          return NextResponse.json({ 
            error: `Falha ao gerar texto com ${model} (${pollinationsResponse.status}): ${errorData.error?.message || 'Erro desconhecido'}` 
          }, { status: 500 });
        }
        
        const data = await pollinationsResponse.json();
        const text = data.choices?.[0]?.message?.content || '';
        
        if (!text) {
          return NextResponse.json({ 
            error: 'Resposta vazia do modelo' 
          }, { status: 500 });
        }
        
        return NextResponse.json({ text, reply: text });
      } catch (error) {
        console.error('Erro ao chamar Pollinations:', error);
        return NextResponse.json({ 
          error: `Erro ao conectar com Pollinations: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
        }, { status: 500 });
      }
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
