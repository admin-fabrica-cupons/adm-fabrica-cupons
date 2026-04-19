# 🖼️ Correções de Erros de Imagens

## Problema Identificado

Erro 400 ao carregar imagens do Supabase através do Next.js Image Optimizer:
```
https://adm-fabrica-cupons.vercel.app/_next/image?url=https%3A%2F%2Fgaovlxpoqvsyapeffmqr.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportal-posts%2Fimages%2Fai-generated%2FAgirlhuggingasupercuteteddyshark-1771904746252.jpg&w=64&q=75
```

### Causas Raiz

1. **Nomes de arquivo com caracteres especiais**: URLs com letras maiúsculas e minúsculas misturadas sem sanitização adequada
2. **Falta de tratamento de erro**: Componentes Image sem fallback quando a imagem falha ao carregar
3. **URLs malformadas**: Alguns nomes de arquivo continham caracteres que não são URL-safe

## ✅ Soluções Implementadas

### 1. Sanitização de Nomes de Arquivo (`src/app/api/admin/ai-image/route.ts`)

**Antes:**
```typescript
const fileName = `ai-generated-${timestamp}.${extension}`;
```

**Depois:**
```typescript
// Sanitizar o prompt para usar como parte do nome do arquivo
const sanitizedPrompt = prompt
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-') // Substituir caracteres especiais por hífen
  .replace(/^-+|-+$/g, '') // Remover hífens do início e fim
  .slice(0, 50); // Limitar tamanho
const fileName = `${sanitizedPrompt}-${timestamp}.${extension}`;
```

**Benefícios:**
- ✅ Remove caracteres especiais que causam erro 400
- ✅ Converte tudo para minúsculas
- ✅ Usa apenas caracteres URL-safe (a-z, 0-9, -)
- ✅ Limita o tamanho do nome do arquivo
- ✅ Mantém nomes descritivos baseados no prompt

### 2. Componente SafeImage (`src/components/Common/SafeImage.tsx`)

Criado um wrapper do Next.js Image com tratamento automático de erros:

```typescript
const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  fallbackSrc = 'https://placehold.co/600x400/e2e8f0/64748b?text=Imagem+Indisponivel',
  alt,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      console.warn(`Falha ao carregar imagem: ${imgSrc}`);
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Validar se a URL é válida antes de tentar carregar
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const finalSrc = isValidUrl(String(imgSrc)) ? imgSrc : fallbackSrc;

  return (
    <Image
      {...props}
      src={finalSrc}
      alt={alt}
      onError={handleError}
    />
  );
};
```

**Recursos:**
- ✅ Fallback automático para imagem placeholder
- ✅ Validação de URL antes de carregar
- ✅ Log de erros para debugging
- ✅ Previne loops infinitos de erro
- ✅ Compatível com todas as props do Next.js Image

### 3. Atualização dos Componentes

Substituído `Image` por `SafeImage` nos componentes principais:

#### PostCard.tsx
```typescript
import SafeImage from '../Common/SafeImage';

<SafeImage
  src={post.thumbnail}
  alt={post.title}
  width={400}
  height={300}
  // ... outras props
/>
```

#### PostCardHorizontal.tsx
```typescript
import SafeImage from '../Common/SafeImage';

<SafeImage
  src={post.thumbnail}
  alt={post.title}
  fill
  // ... outras props
/>
```

## 📊 Resultados Esperados

### Antes
- ❌ Erro 400 em imagens com nomes especiais
- ❌ Imagens quebradas sem fallback
- ❌ Experiência ruim do usuário
- ❌ Console cheio de erros

### Depois
- ✅ Nomes de arquivo sempre URL-safe
- ✅ Fallback automático para imagens quebradas
- ✅ Experiência consistente do usuário
- ✅ Logs informativos para debugging
- ✅ Validação de URLs antes do carregamento

## 🔧 Manutenção Futura

### Para adicionar SafeImage em novos componentes:

```typescript
// 1. Importar
import SafeImage from '../Common/SafeImage';

// 2. Usar no lugar de Image
<SafeImage
  src={imageUrl}
  alt="Descrição"
  width={400}
  height={300}
  // Opcional: customizar fallback
  fallbackSrc="https://placehold.co/800x600?text=Custom+Fallback"
/>
```

### Para customizar o fallback global:

Edite o valor padrão em `src/components/Common/SafeImage.tsx`:

```typescript
fallbackSrc = 'https://placehold.co/600x400/e2e8f0/64748b?text=Sua+Mensagem'
```

## 🎯 Próximos Passos Recomendados

1. **Migrar todos os componentes**: Substituir `Image` por `SafeImage` em todos os componentes restantes
2. **Monitorar logs**: Verificar console para identificar imagens que ainda falham
3. **Otimizar Supabase**: Revisar permissões e configurações do bucket
4. **Cache**: Implementar cache de imagens para melhor performance
5. **CDN**: Considerar usar CDN para imagens estáticas

## 📝 Notas Técnicas

- O Next.js Image Optimizer requer URLs válidas e bem formadas
- Caracteres especiais em URLs devem ser encoded ou evitados
- O Supabase Storage é case-sensitive
- Fallbacks devem usar serviços confiáveis (placehold.co é estável)
- Validação de URL previne erros de runtime

## 🐛 Debugging

Se ainda houver problemas com imagens:

1. Verificar console do navegador para logs do SafeImage
2. Testar URL diretamente no navegador
3. Verificar permissões do bucket no Supabase
4. Confirmar que `next.config.ts` tem o domínio correto em `remotePatterns`
5. Limpar cache do Next.js: `rm -rf .next`
