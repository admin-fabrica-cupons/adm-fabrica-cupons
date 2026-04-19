#!/usr/bin/env node

/**
 * Script para verificar se o projeto está pronto para deploy na Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configurações para deploy na Vercel...\n');

const checks = [];

// 1. Verificar se package.json existe e tem scripts corretos
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts?.build && packageJson.scripts?.start) {
    checks.push({ name: 'Scripts do package.json', status: '✅', details: 'build e start configurados' });
  } else {
    checks.push({ name: 'Scripts do package.json', status: '❌', details: 'Scripts build ou start ausentes' });
  }
  
  if (packageJson.engines?.node) {
    checks.push({ name: 'Versão do Node.js', status: '✅', details: `Especificada: ${packageJson.engines.node}` });
  } else {
    checks.push({ name: 'Versão do Node.js', status: '⚠️', details: 'Não especificada no package.json' });
  }
} catch (error) {
  checks.push({ name: 'package.json', status: '❌', details: 'Arquivo não encontrado ou inválido' });
}

// 2. Verificar .nvmrc
if (fs.existsSync('.nvmrc')) {
  const nodeVersion = fs.readFileSync('.nvmrc', 'utf8').trim();
  checks.push({ name: 'Arquivo .nvmrc', status: '✅', details: `Node.js ${nodeVersion}` });
} else {
  checks.push({ name: 'Arquivo .nvmrc', status: '⚠️', details: 'Arquivo não encontrado' });
}

// 3. Verificar vercel.json
if (fs.existsSync('vercel.json')) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    checks.push({ name: 'Configuração vercel.json', status: '✅', details: 'Arquivo presente e válido' });
  } catch (error) {
    checks.push({ name: 'Configuração vercel.json', status: '❌', details: 'Arquivo inválido' });
  }
} else {
  checks.push({ name: 'Configuração vercel.json', status: '✅', details: 'Usando configuração automática' });
}

// 4. Verificar proxy.ts
if (fs.existsSync('src/proxy.ts')) {
  const proxyContent = fs.readFileSync('src/proxy.ts', 'utf8');
  if (proxyContent.includes('export async function proxy')) {
    checks.push({ name: 'Proxy (middleware)', status: '✅', details: 'Configurado corretamente' });
  } else {
    checks.push({ name: 'Proxy (middleware)', status: '❌', details: 'Função proxy não encontrada' });
  }
} else {
  checks.push({ name: 'Proxy (middleware)', status: '⚠️', details: 'Arquivo não encontrado' });
}

// 5. Verificar estrutura de rotas da API
const apiRoutes = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/admin/ai-image/route.ts'
];

let apiRoutesOk = 0;
apiRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    apiRoutesOk++;
  }
});

if (apiRoutesOk === apiRoutes.length) {
  checks.push({ name: 'Rotas da API', status: '✅', details: `${apiRoutesOk}/${apiRoutes.length} rotas encontradas` });
} else {
  checks.push({ name: 'Rotas da API', status: '❌', details: `${apiRoutesOk}/${apiRoutes.length} rotas encontradas` });
}

// 6. Verificar arquivos essenciais
const essentialFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css'
];

let essentialFilesOk = 0;
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    essentialFilesOk++;
  }
});

if (essentialFilesOk === essentialFiles.length) {
  checks.push({ name: 'Arquivos essenciais', status: '✅', details: `${essentialFilesOk}/${essentialFiles.length} arquivos encontrados` });
} else {
  checks.push({ name: 'Arquivos essenciais', status: '❌', details: `${essentialFilesOk}/${essentialFiles.length} arquivos encontrados` });
}

// 7. Verificar .env.example
if (fs.existsSync('.env.example')) {
  checks.push({ name: 'Exemplo de variáveis', status: '✅', details: '.env.example presente' });
} else {
  checks.push({ name: 'Exemplo de variáveis', status: '⚠️', details: '.env.example não encontrado' });
}

// Exibir resultados
console.log('📋 Resultados da verificação:\n');

checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.details}`);
});

// Resumo
const passed = checks.filter(c => c.status === '✅').length;
const warnings = checks.filter(c => c.status === '⚠️').length;
const failed = checks.filter(c => c.status === '❌').length;

console.log('\n📊 Resumo:');
console.log(`✅ Passou: ${passed}`);
console.log(`⚠️  Avisos: ${warnings}`);
console.log(`❌ Falhou: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 Projeto pronto para deploy na Vercel!');
  console.log('\n📖 Próximos passos:');
  console.log('1. git add . && git commit -m "feat: preparar para deploy" && git push');
  console.log('2. Importar projeto na Vercel');
  console.log('3. Configurar variáveis de ambiente');
  console.log('4. Fazer deploy');
} else {
  console.log('\n⚠️  Corrija os problemas antes do deploy.');
}

console.log('\n📚 Consulte DEPLOY_VERCEL.md para instruções detalhadas.');