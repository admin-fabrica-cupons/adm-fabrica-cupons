// Autenticação simplificada sem JWT
const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = '123';

export async function generateTokens(userId: string) {
  // Token simples sem JWT
  const accessToken = `simple-token-${userId}-${Date.now()}`;
  const refreshToken = `refresh-token-${userId}-${Date.now()}`;

  return { accessToken, refreshToken };
}

export async function verifyToken(token: string) {
  // Verificação simples - aceita qualquer token que comece com "simple-token"
  if (token && token.startsWith('simple-token')) {
    return { userId: 'admin', type: 'access' };
  }
  return null;
}

export async function validateAdminCredentials(
  username: string,
  password: string
) {
  // Credenciais fixas: admin / 123
  return username === ADMIN_USER && password === ADMIN_PASSWORD;
}
