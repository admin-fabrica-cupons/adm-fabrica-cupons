import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const bucketName = 'portal-posts';

const getPolliKey = () => {
  return process.env.POLLI_KEY || process.env.NEXT_PUBLIC_POLLI_KEY || '';
};

const buildTranslatePrompt = (prompt: string, tone: string, responseSize: string) => {
  const toneLabel = tone && tone !== 'none' ? tone : 'none';
  const responseLabel = responseSize || 'texto-normal';
  const responseHint = responseLabel === 'descricao-curta'
    ? 'very short'
    : responseLabel === 'descricao-longa'
      ? 'detailed'
      : responseLabel === 'texto-longo'
        ? 'long'
        : responseLabel === 'paragrafos-bem-dividido'
          ? 'well structured'
          : 'balanced';
  
  return `You are an expert at creating image generation prompts. Translate and optimize the following Portuguese/Brazilian prompt into English for AI image generation.

CRITICAL RULES:
- Keep Brazilian brand names in Portuguese (Mercado Livre, Magazine Luiza, Casas Bahia, etc.)
- For product images: focus on the object, clear background, professional photography style
- For discount/promotion images: include discount badges, price tags, promotional elements, vibrant colors
- For thumbnail/cover images: eye-catching, bold text areas, high contrast
- Be visual and descriptive, ${responseHint}
- Tone: ${toneLabel}
- Return ONLY the optimized English prompt, nothing else

EXAMPLES:
Input: "Notebook gamer com desconto no Mercado Livre"
Output: "Professional product photography of a gaming laptop, sleek design, RGB keyboard, on clean white background, with bright red discount badge showing percentage off, promotional style, high quality, 4k"

Input: "Promoção de tênis Nike"
Output: "Nike sneakers product shot, dynamic angle, studio lighting, white background, large SALE banner, discount tag, promotional poster style, vibrant colors, commercial photography"

Input: "Capa de post sobre ofertas de celular"
Output: "Eye-catching thumbnail design for smartphone deals, multiple modern phones arranged dynamically, bold discount percentages, vibrant gradient background, promotional banner style, high contrast, attention-grabbing"

Now translate this prompt:
${prompt}`;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action;
    console.log('ai-image:request', { action, bodyKeys: Object.keys(body || {}) });

    if (action === 'translate') {
      const prompt = String(body?.prompt || '').trim();
      const tone = String(body?.tone || 'none');
      const responseSize = String(body?.responseSize || 'texto-normal');

      if (!prompt) {
        return NextResponse.json({ error: 'Prompt inválido' }, { status: 400 });
      }

      const polliKey = getPolliKey();
      if (!polliKey) {
        console.error('ai-image:translate:missing-polli-key');
        return NextResponse.json({ error: 'POLLI_KEY não configurada' }, { status: 500 });
      }

      const translatePrompt = buildTranslatePrompt(prompt, tone, responseSize);
      // Atualização: Usando 'nova-fast' para tradução, conforme solicitado, para melhor qualidade e rapidez.
      const translateUrl = `https://gen.pollinations.ai/text/${encodeURIComponent(translatePrompt)}?model=nova-fast&key=${encodeURIComponent(polliKey)}`;

      console.log('ai-image:translate:fetch', { translateUrl });
      const translateResponse = await fetch(translateUrl);
      console.log('ai-image:translate:status', { status: translateResponse.status });
      
      // Se a tradução falhar (404 ou outro erro), usar o prompt original em inglês ou português
      if (!translateResponse.ok) {
        console.warn('ai-image:translate:failed, using original prompt', { status: translateResponse.status });
        // Retorna o prompt original - a API de geração de imagens entende múltiplos idiomas
        return NextResponse.json({ prompt: prompt, translated: false }, { status: 200 });
      }

      const translatedText = (await translateResponse.text()).trim();
      
      // Validação extra: se o retorno for apenas metadados de segurança, usar o prompt original
      if (translatedText.includes('Safety: Safe') && translatedText.length < 50) {
          console.warn('ai-image:translate:safety-filter-triggered', { translatedText });
          return NextResponse.json({ prompt: prompt }, { status: 200 });
      }

      console.log('ai-image:translate:done', { translatedTextLength: translatedText.length });
      return NextResponse.json({ prompt: translatedText }, { status: 200 });
    }

    if (action === 'generate') {
      const prompt = String(body?.prompt || '').trim();
      const model = String(body?.model || 'flux');
      const seed = Math.floor(Math.random() * 100000);

      if (!prompt) {
        return NextResponse.json({ error: 'Prompt inválido' }, { status: 400 });
      }

      const polliKey = getPolliKey();
      if (!polliKey) {
        return NextResponse.json({ error: 'POLLI_KEY não configurada' }, { status: 500 });
      }

      // Função auxiliar para gerar e validar
      const generateImage = async (currentModel: string) => {
        const url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&seed=${seed}&model=${encodeURIComponent(currentModel)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
        try {
          console.log('ai-image:generate:fetch', { model: currentModel, url, promptLength: prompt.length });
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${polliKey}`
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          console.log('ai-image:generate:response', { 
            model: currentModel, 
            status: response.status, 
            ok: response.ok,
            contentType: response.headers.get('content-type')
          });

          if (!response.ok) {
            throw new Error(`Status ${response.status}`);
          }

          const contentType = response.headers.get('content-type') || '';
          if (!contentType.startsWith('image/')) {
            console.error('ai-image:generate:invalid-content-type', { contentType });
            throw new Error(`Invalid content-type: ${contentType}`);
          }

          // Fazer download da imagem e salvar no Supabase
          console.log('ai-image:generate:downloading-image');
          const arrayBuffer = await response.arrayBuffer();
          const fileBlob = new Blob([arrayBuffer], { type: contentType });
          
          console.log('ai-image:generate:image-downloaded', { 
            size: arrayBuffer.byteLength,
            sizeKB: (arrayBuffer.byteLength / 1024).toFixed(2)
          });
          
          // Gerar nome único para a imagem
          const timestamp = Date.now();
          const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
          const fileName = `ai-generated-${timestamp}.${extension}`;
          const path = `images/ai-generated/${fileName}`;
          
          // Salvar no Supabase
          console.log('ai-image:generate:uploading-to-supabase', { path, contentType });
          const supabase = getSupabaseServerClient();
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from(bucketName)
            .upload(path, fileBlob, { contentType, upsert: true });

          if (uploadError) {
            console.error('ai-image:generate:supabase-error', { 
              error: uploadError.message,
              statusCode: uploadError.statusCode
            });
            throw new Error(`Erro ao salvar no Supabase: ${uploadError.message}`);
          }

          console.log('ai-image:generate:supabase-upload-success', { uploadData });

          // Obter URL pública
          const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(path);
          const publicUrl = publicData.publicUrl;
          
          // Validar URL
          if (!publicUrl || typeof publicUrl !== 'string') {
            console.error('ai-image:generate:invalid-public-url', { publicData });
            throw new Error('URL pública inválida retornada pelo Supabase');
          }

          // Validar formato da URL
          try {
            new URL(publicUrl);
          } catch (urlError) {
            console.error('ai-image:generate:malformed-url', { publicUrl });
            throw new Error('URL pública malformada');
          }
          
          console.log('ai-image:generate:success-with-supabase', { 
            model: currentModel, 
            publicUrl,
            urlLength: publicUrl.length
          });
          
          return { success: true, url: publicUrl }; 
        } catch (error: any) {
          clearTimeout(timeoutId);
          console.error('ai-image:generate:error', { 
            model: currentModel, 
            error: error.message,
            stack: error.stack?.substring(0, 200)
          });
          return { success: false, error: error.message };
        }
      };

      // 1. Primeira tentativa
      let result = await generateImage(model);
      let modelUsed = model;
      let fallback = false;

      // 2. Fallback se falhar e o modelo não for o padrão "flux"
      if (!result.success && model !== 'flux') {
        console.log('ai-image:generate:fallback', { from: model, to: 'flux' });
        // Tenta com o modelo padrão "flux"
        const fallbackResult = await generateImage('flux');
        if (fallbackResult.success) {
           result = fallbackResult;
           modelUsed = 'flux';
           fallback = true;
        }
      }

      if (!result.success) {
        console.error('ai-image:generate:all-attempts-failed', { model, fallback });
        return NextResponse.json({ 
          error: 'Falha na geração da imagem. Tente novamente mais tarde.',
          details: result.error
        }, { status: 500 });
      }

      const finalUrl = result.url;
      
      // Validação final da URL
      if (!finalUrl || typeof finalUrl !== 'string') {
        console.error('ai-image:generate:invalid-final-url', { finalUrl, result });
        return NextResponse.json({ 
          error: 'URL da imagem inválida',
          details: 'A URL retornada não é válida'
        }, { status: 500 });
      }

      // Validar formato da URL
      try {
        new URL(finalUrl);
      } catch (urlError) {
        console.error('ai-image:generate:malformed-final-url', { finalUrl });
        return NextResponse.json({ 
          error: 'URL da imagem malformada',
          details: 'A URL retornada não tem formato válido'
        }, { status: 500 });
      }

      console.log('ai-image:generate:final-response', { 
        imageUrl: finalUrl,
        urlLength: finalUrl.length,
        urlPrefix: finalUrl.substring(0, 80),
        modelUsed,
        fallback
      });

      return NextResponse.json({ 
        imageUrl: finalUrl, 
        modelUsed, 
        fallback,
        success: true
      }, { status: 200 });
    }

    if (action === 'save') {
      const imageUrl = String(body?.imageUrl || '').trim();
      const fileName = String(body?.fileName || '').trim();
      console.log('ai-image:save:start', { imageUrl, fileName });

      if (!imageUrl) {
        return NextResponse.json({ error: 'URL da imagem inválida' }, { status: 400 });
      }

      const imageResponse = await fetch(imageUrl);
      console.log('ai-image:save:fetch-status', { status: imageResponse.status });
      if (!imageResponse.ok) {
        return NextResponse.json({ error: `Falha ao baixar imagem (${imageResponse.status})` }, { status: 500 });
      }

      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const timestamp = Date.now();
      const safeFileName = fileName ? fileName.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 40) : 'ai-image';
      const path = `images/ai-generated/${safeFileName}-${timestamp}.${extension}`;
      console.log('ai-image:save:prepare', { contentType, extension, path });

      const arrayBuffer = await imageResponse.arrayBuffer();
      const fileBlob = new Blob([arrayBuffer], { type: contentType });

      const supabase = getSupabaseServerClient();
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(path, fileBlob, { contentType, upsert: true });

      if (uploadError) {
        console.warn('ai-image:save:supabase-error', uploadError);
        
        // Fallback para ImgBB
        const imgbbKey = process.env.IMGBB_KEY;
        if (!imgbbKey) {
           return NextResponse.json({ error: uploadError.message || 'Erro ao salvar no Supabase e ImgBB não configurado' }, { status: 500 });
        }

        // ImgBB API
        try {
           const buffer = Buffer.from(arrayBuffer);
           const base64Image = buffer.toString('base64');
           
           const imgbbBody = new FormData();
           imgbbBody.append('key', imgbbKey);
           imgbbBody.append('image', base64Image);
           imgbbBody.append('name', safeFileName);

           console.log('ai-image:save:imgbb:request', { name: safeFileName, base64Length: base64Image.length });
           const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
               method: 'POST',
               body: imgbbBody
           });

           console.log('ai-image:save:imgbb:status', { status: imgbbResponse.status });
           if (!imgbbResponse.ok) {
               const errorData = await imgbbResponse.json().catch(() => ({}));
               console.error('ai-image:save:imgbb:error', errorData);
               return NextResponse.json({ error: errorData?.error?.message || 'Falha no upload para ImgBB (fallback)' }, { status: 500 });
           }

           const data = await imgbbResponse.json();
           const url = data?.data?.url || data?.data?.display_url || '';
           console.log('ai-image:save:imgbb:success', { url });
           return NextResponse.json({ url, path: 'imgbb', provider: 'imgbb' }, { status: 200 });
        } catch (imgbbError: any) {
           console.error('ai-image:save:imgbb:caught-error', { message: imgbbError?.message });
           return NextResponse.json({ error: `Erro no fallback ImgBB: ${imgbbError.message}` }, { status: 500 });
        }
      }

      const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(path);

      console.log('ai-image:save:supabase:success', { url: publicData.publicUrl });
      return NextResponse.json({ url: publicData.publicUrl, path, provider: 'supabase' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error: any) {
    console.error('ai-image:unhandled-error', { message: error?.message });
    return NextResponse.json({ error: error?.message || 'Erro inesperado' }, { status: 500 });
  }
}