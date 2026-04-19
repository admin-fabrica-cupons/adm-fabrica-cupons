import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getImgbbKey = () => {
  return process.env.IMGBB_KEY || '';
};

export async function POST(request: Request) {
  try {
    const imgbbKey = getImgbbKey();
    if (!imgbbKey) {
      console.error('IMGBB_KEY não configurada no .env');
      return NextResponse.json({ error: 'IMGBB_KEY não configurada no servidor' }, { status: 500 });
    }

    const formData = await request.formData();
    const image = formData.get('image');
    const name = formData.get('name');
    const expiration = formData.get('expiration');

    if (!image) {
      return NextResponse.json({ error: 'Nenhum arquivo de imagem foi enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (image instanceof File) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json({ 
          error: `Tipo de arquivo não suportado: ${image.type}. Use JPG, PNG, GIF ou WebP` 
        }, { status: 400 });
      }

      // Validar tamanho (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (image.size > maxSize) {
        return NextResponse.json({ 
          error: `Arquivo muito grande: ${(image.size / 1024 / 1024).toFixed(2)}MB. Máximo: 10MB` 
        }, { status: 400 });
      }
    }

    const uploadData = new FormData();
    uploadData.append('key', imgbbKey);
    
    if (image instanceof File) {
      uploadData.append('image', image);
    } else if (typeof image === 'string') {
      uploadData.append('image', image);
    } else {
      return NextResponse.json({ error: 'Formato de imagem inválido' }, { status: 400 });
    }

    if (typeof name === 'string' && name.trim()) {
      uploadData.append('name', name.trim());
    }

    if (typeof expiration === 'string' && expiration.trim()) {
      uploadData.append('expiration', expiration.trim());
    }

    console.log('Enviando imagem para ImgBB...');
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: uploadData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `Erro ${response.status} da API ImgBB`;
      console.error('Erro da API ImgBB:', errorMsg, errorData);
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    const data = await response.json();
    
    // Extrair URL da resposta do ImgBB
    const url = data?.data?.url || data?.data?.display_url || '';
    
    if (!url) {
      console.error('URL não encontrada na resposta do ImgBB:', data);
      return NextResponse.json({ error: 'URL da imagem não foi retornada pela API' }, { status: 500 });
    }

    console.log('Upload bem-sucedido:', url);
    
    // Retornar URL diretamente no nível superior para facilitar acesso
    return NextResponse.json({ 
      url, 
      success: true,
      data: data.data // Dados completos do ImgBB
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erro inesperado no servidor' 
    }, { status: 500 });
  }
}
