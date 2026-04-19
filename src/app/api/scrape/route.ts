import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const token = process.env.TOKEN_API_POSTS;

    if (!token || token === 'SEU_TOKEN_AQUI') {
      return NextResponse.json({ 
        error: 'Configuração necessária: Adicione TOKEN_API_POSTS no arquivo .env',
        help: 'Cole seu token válido do scrape.do no arquivo .env'
      }, { status: 500 });
    }

    // Usar HTTPS em vez de HTTP (mais seguro e pode resolver o 401)
    const scrapeUrl = `https://api.scrape.do?token=${token}&url=${encodeURIComponent(url)}`;

    console.log('🔍 Fazendo scrape da URL:', url);

    const apiRes = await fetch(scrapeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error('❌ Erro da API de Scraping:', {
        status: apiRes.status,
        statusText: apiRes.statusText,
        url: scrapeUrl.replace(token, 'TOKEN_OCULTO'), // Não logar o token
        response: errorText.substring(0, 200) // Primeiros 200 chars
      });

      if (apiRes.status === 401) {
        return NextResponse.json({ 
          error: 'Token de API inválido ou expirado',
          help: 'Verifique se o TOKEN_API_POSTS no .env está correto (sem espaços extras)',
          status: apiRes.status
        }, { status: 401 });
      }

      if (apiRes.status === 403) {
        return NextResponse.json({ 
          error: 'Acesso negado pela API',
          help: 'Verifique se seu plano permite acessar esta URL',
          status: apiRes.status
        }, { status: 403 });
      }

      return NextResponse.json({ 
        error: `Scrape API Error: ${apiRes.statusText}`,
        details: errorText.substring(0, 200),
        status: apiRes.status
      }, { status: apiRes.status });
    }

    const html = await apiRes.text();
    console.log('✅ Scrape realizado com sucesso, HTML recebido:', html.length, 'caracteres');
    
    // Verificar se realmente recebemos HTML
    if (!html || html.length < 100) {
      console.warn('⚠️ HTML recebido parece muito pequeno:', html);
    }
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error('💥 Erro no proxy de scrape:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch product data',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
