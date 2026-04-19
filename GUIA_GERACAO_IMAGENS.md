# 🎨 Guia de Geração de Imagens com IA

## 📋 Visão Geral

Este guia explica como usar a IA de geração de imagens otimizada para criar thumbnails, capas de posts e imagens de produtos para a Fábrica de Cupons.

## 🎯 Tipos de Imagens Suportadas

### 1. **Imagens de Produtos**
Fotos profissionais de produtos com fundo limpo

**Exemplos de prompts:**
- "Notebook gamer Dell com teclado RGB"
- "Tênis Nike Air Max preto e branco"
- "Smartphone Samsung Galaxy com tela infinita"
- "Fone de ouvido Bluetooth JBL"
- "Cafeteira elétrica Nespresso"

**Dicas:**
- Seja específico sobre marca e modelo
- Mencione cores e características visuais
- A IA automaticamente adiciona fundo profissional

### 2. **Imagens de Descontos e Promoções**
Imagens promocionais com badges de desconto

**Exemplos de prompts:**
- "Notebook com 40% de desconto"
- "Promoção de tênis com selo de oferta"
- "Celular em promoção com badge de desconto"
- "Smart TV com etiqueta de preço promocional"

**Dicas:**
- Mencione a porcentagem de desconto
- Use palavras como "promoção", "desconto", "oferta"
- A IA adiciona elementos visuais promocionais automaticamente

### 3. **Thumbnails e Capas de Posts**
Imagens chamativas para capas de artigos

**Exemplos de prompts:**
- "Capa de post sobre ofertas de eletrônicos"
- "Thumbnail para artigo de cupons de moda"
- "Banner promocional de Black Friday"
- "Capa para guia de compras de Natal"

**Dicas:**
- Use "capa", "thumbnail" ou "banner" no prompt
- Mencione o tema ou categoria
- A IA cria designs com alto contraste e áreas para texto

### 4. **Imagens de Objetos e Cenários**
Objetos específicos ou composições

**Exemplos de prompts:**
- "Pilha de caixas de presente coloridas"
- "Carrinho de compras cheio de produtos"
- "Mesa com produtos de tecnologia"
- "Sacolas de compras com logos de lojas"

## 🇧🇷 Nomes Brasileiros - IMPORTANTE

### ✅ CORRETO - Mantenha nomes em português:
- "Notebook com desconto no Mercado Livre"
- "Promoção de TV na Magazine Luiza"
- "Ofertas da Casas Bahia"
- "Cupom da Shopee Brasil"
- "Desconto na Amazon Brasil"

### ❌ ERRADO - Não traduza:
- ~~"Notebook with discount at Free Market"~~
- ~~"TV promotion at Magazine Luiza Store"~~

**A IA foi treinada para:**
- Reconhecer e preservar nomes de lojas brasileiras
- Manter marcas em seu idioma original
- Entender contexto do e-commerce brasileiro

## 🎨 Estilos e Qualidade

### Modelos Disponíveis:
- **flux** (padrão) - Melhor qualidade geral
- **flux-pro** - Qualidade premium
- **turbo** - Geração rápida
- **dall-e-3** - Estilo artístico

### Configurações:
- **Tamanho:** 1280x720 (otimizado para web)
- **Qualidade:** Alta resolução, 4K
- **Estilo:** Fotografia profissional por padrão

## 💡 Dicas Avançadas

### Para Produtos:
```
"[Produto] [Marca] [Características], fotografia profissional, fundo branco, iluminação de estúdio, alta qualidade"
```

### Para Promoções:
```
"[Produto] com [X]% de desconto, badge promocional vermelho, etiqueta de preço, estilo comercial, cores vibrantes"
```

### Para Thumbnails:
```
"Capa chamativa para [tema], design moderno, alto contraste, espaço para texto, gradiente vibrante, estilo promocional"
```

## 🔧 Solução de Problemas

### Imagem não ficou boa?
1. Seja mais específico no prompt
2. Adicione detalhes visuais (cores, ângulo, iluminação)
3. Mencione o estilo desejado (profissional, comercial, promocional)
4. Tente diferentes modelos

### Texto na imagem ficou ilegível?
- A IA não gera texto legível diretamente
- Use as imagens como base e adicione texto depois
- Para thumbnails, peça "espaço para texto" no prompt

### Produto não ficou realista?
- Adicione "fotografia profissional" ao prompt
- Mencione "alta qualidade" ou "4K"
- Especifique "fundo branco" ou "fundo limpo"

## 📊 Exemplos Práticos

### Exemplo 1: Produto Simples
**Prompt:** "Tênis Nike Air Max branco"
**Resultado:** Foto profissional do tênis, fundo branco, iluminação perfeita

### Exemplo 2: Produto com Desconto
**Prompt:** "Smart TV Samsung 55 polegadas com 30% de desconto"
**Resultado:** TV em destaque com badge vermelho de desconto

### Exemplo 3: Thumbnail
**Prompt:** "Capa de post sobre ofertas de smartphones"
**Resultado:** Design vibrante com múltiplos celulares e elementos promocionais

### Exemplo 4: Cenário
**Prompt:** "Mesa de escritório com notebook, mouse e café"
**Resultado:** Composição profissional estilo lifestyle

## 🎯 Melhores Práticas

1. **Seja específico mas conciso**
   - ✅ "Notebook Dell Inspiron prata com teclado retroiluminado"
   - ❌ "Um computador portátil que é da marca Dell e tem cor prata"

2. **Use termos visuais**
   - ✅ "fundo branco", "iluminação de estúdio", "ângulo frontal"
   - ❌ Descrições abstratas ou conceituais

3. **Mantenha nomes originais**
   - ✅ "Mercado Livre", "Magazine Luiza", "Nike"
   - ❌ Traduções ou adaptações

4. **Para promoções, seja direto**
   - ✅ "com 50% de desconto", "promoção", "oferta"
   - ❌ Descrições longas sobre a promoção

## 🚀 Recursos Avançados

### Fallback Automático
Se um modelo falhar, o sistema automaticamente tenta com o modelo padrão "flux"

### Salvamento no Supabase
Todas as imagens são automaticamente salvas no storage do Supabase para uso futuro

### Otimização Automática
A IA otimiza prompts automaticamente para melhor qualidade:
- Adiciona termos técnicos de fotografia
- Ajusta para o contexto (produto, promoção, thumbnail)
- Mantém nomes próprios intactos

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o prompt está claro e específico
2. Tente reformular usando os exemplos deste guia
3. Experimente diferentes modelos
4. Consulte os logs do console para detalhes técnicos

---

**Última atualização:** Abril 2026
**Versão da IA:** Pollinations API v0.3.0
