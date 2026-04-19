import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, TestTube } from 'lucide-react';

const TokenTester: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testToken = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-token');
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TestTube size={20} className="text-blue-500" />
          <h3 className="font-bold text-slate-800 dark:text-white">Testar Token da API</h3>
        </div>
        <button
          onClick={testToken}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-bold transition-all"
        >
          {testing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <TestTube size={16} />
              Testar Token
            </>
          )}
        </button>
      </div>

      {result && (
        <div className={`mt-4 p-4 rounded-lg border ${
          result.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-2">
              <p className={`font-bold ${
                result.success 
                  ? 'text-green-800 dark:text-green-300' 
                  : 'text-red-800 dark:text-red-300'
              }`}>
                {result.message || (result.success ? 'Token válido!' : 'Token inválido')}
              </p>
              
              {result.hint && (
                <p className="text-sm text-red-700 dark:text-red-400">
                  💡 {result.hint}
                </p>
              )}

              {result.error && (
                <p className="text-sm text-red-700 dark:text-red-400">
                  Erro: {result.error}
                </p>
              )}

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>Status HTTP:</span>
                  <span className="font-mono font-bold">{result.status || 'N/A'}</span>
                </div>
                {result.tokenConfigured !== undefined && (
                  <div className="flex justify-between">
                    <span>Token Configurado:</span>
                    <span className={`font-bold ${result.tokenConfigured ? 'text-green-600' : 'text-red-600'}`}>
                      {result.tokenConfigured ? 'Sim' : 'Não'}
                    </span>
                  </div>
                )}
                {result.tokenLength && (
                  <div className="flex justify-between">
                    <span>Tamanho do Token:</span>
                    <span className="font-mono">{result.tokenLength} caracteres</span>
                  </div>
                )}
                {result.responseLength !== undefined && (
                  <div className="flex justify-between">
                    <span>Resposta Recebida:</span>
                    <span className="font-mono">{result.responseLength} bytes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Como usar:</strong> Clique em &quot;Testar Token&quot; para verificar se o TOKEN_API_POSTS 
          está configurado corretamente no arquivo .env. Se o teste falhar, verifique se o token 
          está correto e sem espaços extras.
        </p>
      </div>
    </div>
  );
};

export default TokenTester;
