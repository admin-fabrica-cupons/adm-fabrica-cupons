# 🎯 Fábrica de Cupons - Painel Administrativo

## 📖 Sobre o Projeto

Este é o **painel administrativo** da Fábrica de Cupons, uma aplicação web separada e independente dedicada ao gerenciamento de conteúdo, posts, cupons e ofertas. Desenvolvido com Next.js 16 e TypeScript, oferece uma interface moderna e intuitiva para administradores.

## 🎯 Propósito

Este projeto serve como a **interface administrativa** da Fábrica de Cupons, oferecendo:

- ✍️ **Editor de Conteúdo**: Editor visual rico com blocos customizados
- 🤖 **Assistente IA**: Chat integrado para geração de textos e imagens
- 📝 **Gerenciamento de Posts**: Criar, editar e publicar posts
- 🏷️ **Gerenciamento de Categorias**: Organizar conteúdo por categorias
- 🎨 **Blocos Especiais**: Cupons, produtos, carrosséis, tabelas e mais
- 💾 **Sistema de Rascunhos**: Salvar trabalhos em progresso
- 🔐 **Autenticação Segura**: Sistema de login protegido

## 🏗️ Arquitetura

### Stack Tecnológica

- **Framework**: Next.js 16.1 (App Router)
- **UI**: React 19.2 com TypeScript 5.7
- **Estilização**: Tailwind CSS 3.4
- **Componentes**: Radix UI + shadcn/ui + Lobe UI
- **Editor**: TipTap (Editor WYSIWYG)
- **IA**: Groq SDK + Pollinations AI
- **Backend**: Supabase (PostgreSQL)
- **Deploy**: Vercel

### Estrutura de Pastas

```
admin-fabrica-cupons/
├── src/
│   ├── app/
│   │   ├── auth/login/        # Página de login
│   │   ├── admin/             # Dashboard principal
│   │   ├── api/               # API Routes
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── generate/     # Geração de texto IA
│   │   │   ├── admin/        # APIs administrativas
│   │   │   └── posts/        # CRUD de posts
│   │   └── layout.tsx         # Layout com AuthProvider
│   ├── components/
│   │   ├── Admin/            # Componentes administrativos
│   │   │   ├── AIChat.tsx   # Chat de texto IA
│   │   │   ├── EditPostView.tsx  # Editor de posts
│   │   │   └── WidgetEditors/    # Editores de blocos
│   │   ├── ui/               # Componentes UI base
│   │   └── magicui/          # Componentes animados
│   ├── contexts/
│   │   ├── AuthContext.tsx   # Contexto de autenticação
│   │   ├── UIContext.tsx     # Contexto de UI
│   │   └── PostContext.tsx   # Contexto de posts
│   ├── hooks/                # Custom Hooks
│   ├── lib/
│   │   ├── auth.ts           # Funções de autenticação
│   │   └── supabase.ts       # Cliente Supabase
│   └── middleware.ts         # Proteção de rotas
└── public/
    └── sounds/               # Efeitos sonoros
```

## 🔗 Relação com Outros Projetos

Este projeto faz parte de um ecossistema de 2 aplicações:

1. **fabrica-cupons** - Site público para usuários finais
2. **admin-fabrica-cupons** (este projeto) - Painel administrativo

### Separação de Responsabilidades

- **Admin**: Gerenciamento de conteúdo, ferramentas de IA, editor avançado
- **Site Público**: Visualização de conteúdo, performance, SEO

### Comunicação entre Projetos

- **Banco de Dados Compartilhado**: Ambos usam o mesmo Supabase
- **APIs Independentes**: Cada projeto tem suas próprias rotas de API
- **Deploy Separado**: Projetos deployados independentemente na Vercel

## 🚀 Funcionalidades Principais

### Autenticação

- ✅ Sistema de login seguro
- ✅ Credenciais: `admin` / `123` (configurável)
- ✅ Token armazenado em cookie
- ✅ Middleware protege todas as rotas exceto login
- ✅ Sessão expira após 24 horas

### Editor de Posts

- ✅ **Editor Visual**: TipTap com interface intuitiva
- ✅ **Blocos Customizados**:
  - Cupom com código e link
  - Produto em destaque (Hot Product)
  - Lista de produtos
  - Carrossel de imagens
  - Citações
  - Acordeão (FAQ)
  - Tabelas comparativas
  - Vídeos do YouTube
- ✅ **Preview em Tempo Real**: Visualize antes de publicar
- ✅ **Sistema de Rascunhos**: Salve e retome trabalhos
- ✅ **Metadados**: Título, categoria, thumbnail, descrição

### Assistente IA

#### Chat de Texto (Lu Assistente)

- 🤖 **5 Modelos Disponíveis**:
  - **Groq** (Llama 3.3 70B) - Rápido e preciso
  - **Qwen Safety** - Modelo seguro
  - **Amazon Nova Fast** - Respostas rápidas
  - **Mistral** - Criativo e versátil
  - **Gemini Fast** - Análises e resumos

- 🎨 **4 Tons de Voz**:
  - Normal - Equilibrado e profissional
  - Vendedor - Persuasivo e convincente
  - Criativo - Divertido e descontraído
  - Profissional - Formal e direto

- 📏 **7 Tamanhos de Resposta**:
  - Descrição curta
  - Descrição longa
  - Texto normal
  - Texto longo
  - Parágrafos bem divididos
  - Título
  - Resposta inteligente (formatada)

#### Chat de Imagens (Lu Image)

- 🖼️ **3 Modelos de Geração**:
  - **Flux** - Alta qualidade
  - **Z-Image** - Rápido
  - **GPT Image** - Criativo

- 🎨 **5 Estilos Visuais**:
  - Sem tom
  - Cinemático
  - Minimalista
  - Vibrante
  - Neon

- ✨ **Recursos**:
  - Tradução automática de prompts
  - Visualização ampliada
  - Salvar no Supabase
  - Copiar URL
  - Usar diretamente no post

### Gerenciamento

- 📊 **Dashboard**: Visão geral de posts e estatísticas
- 🏷️ **Categorias**: Criar e gerenciar categorias
- 📝 **Posts**: CRUD completo de posts
- 🔥 **Ofertas**: Gerenciar cupons e produtos em destaque
- 💾 **Rascunhos**: Sistema de autosave
- 🔍 **Busca**: Filtrar posts por título, categoria ou status

## 🎨 Design e UX

### Interface

- 🎨 **Design Moderno**: Interface limpa e profissional
- 🌓 **Tema Dark**: Modo escuro por padrão
- ✨ **Animações**: Transições suaves com Framer Motion
- 🎵 **Feedback Sonoro**: Sons para ações importantes
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile

### Experiência do Usuário

- ⚡ **Performance**: Carregamento rápido
- 🎯 **Intuitivo**: Interface fácil de usar
- 🔄 **Autosave**: Salva automaticamente rascunhos
- ⌨️ **Atalhos**: Atalhos de teclado para ações comuns
- 🎭 **Modais**: Confirmações para ações destrutivas

## 🔐 Segurança

### Autenticação

- ✅ Credenciais configuráveis via variáveis de ambiente
- ✅ Token JWT seguro
- ✅ Middleware protege rotas sensíveis
- ✅ Sessão com expiração automática

### APIs

- ✅ Validação de entrada
- ✅ Rate limiting (Upstash Redis)
- ✅ CORS configurado
- ✅ Headers de segurança

## 📦 Dependências Principais

```json
{
  "next": "^16.1.6",
  "react": "^19.2.4",
  "typescript": "^5.6.3",
  "@supabase/supabase-js": "^2.45.0",
  "@tiptap/react": "^3.20.0",
  "@tiptap/starter-kit": "^3.20.0",
  "groq-sdk": "^0.37.0",
  "@lobehub/ui": "^5.9.1",
  "framer-motion": "^12.38.0",
  "antd": "^5.23.0"
}
```

## 📝 Variáveis de Ambiente

```env
# Supabase (Obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service

# IA - Groq (Obrigatório para chat de texto)
GROQ_API_KEY=sua_chave_groq

# IA - Pollinations (Obrigatório para imagens)
POLLI_KEY=sua_chave_pollinations

# ImgBB (Opcional - para upload de imagens)
IMGBB_KEY=sua_chave_imgbb

# URLs
NEXT_PUBLIC_BASE_URL=https://admin.seu-dominio.com
NEXT_PUBLIC_PUBLIC_SITE_URL=https://seu-dominio.com
```

## 🚀 Como Usar

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais

# Executar em desenvolvimento
npm run dev
```

### Login

1. Acesse `http://localhost:3000/auth/login`
2. Use as credenciais: `admin` / `123`
3. Você será redirecionado para o dashboard

### Criar um Post

1. No dashboard, clique em "Novo Post"
2. Preencha título, categoria e thumbnail
3. Use o editor para adicionar conteúdo
4. Adicione blocos especiais (cupons, produtos, etc.)
5. Use a IA para gerar textos ou imagens
6. Salve como rascunho ou publique

## 🚀 Deploy na Vercel

### Configuração

1. Importe o projeto na Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Variáveis Obrigatórias

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `POLLI_KEY`

## 📊 Performance

### Otimizações

- ✅ Code splitting automático
- ✅ Lazy loading de componentes
- ✅ Imagens otimizadas
- ✅ Cache de API
- ✅ Minificação de assets

## 🐛 Troubleshooting

### Erro de Autenticação

- Verifique se as credenciais estão corretas
- Limpe cookies e tente novamente
- Verifique se o token não expirou

### IA não funciona

- Verifique se `GROQ_API_KEY` está configurada
- Verifique se `POLLI_KEY` está configurada
- Veja os logs do console para erros

### Imagens não carregam

- Verifique se o Supabase Storage está configurado
- Verifique permissões de bucket
- Verifique se `IMGBB_KEY` está configurada (se usar ImgBB)

## 📄 Licença

Projeto privado - Fábrica de Cupons © 2026

---

**Versão**: 1.0.0  
**Última Atualização**: Abril 2026
