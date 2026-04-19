'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, X, AlertCircle, Loader2 } from 'lucide-react';

export default function OneSignalTester() {
  const [status, setStatus] = useState<'loading' | 'configured' | 'not-configured' | 'error'>('loading');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [appId, setAppId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');

  const checkSubscriptionStatus = useCallback(() => {
    const checkInterval = setInterval(() => {
      if (window.OneSignalDeferred) {
        clearInterval(checkInterval);
        
        window.OneSignalDeferred.push(async function(OneSignal: any) {
          try {
            const subscribed = OneSignal.User.PushSubscription.optedIn;
            setIsSubscribed(subscribed);
          } catch (error) {
            console.error('Erro ao verificar status:', error);
          }
        });
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  }, []);

  const checkConfiguration = useCallback(() => {
    const configuredAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    
    if (!configuredAppId || configuredAppId === 'SEU_APP_ID_AQUI') {
      setStatus('not-configured');
      setErrorMessage('OneSignal não configurado. Adicione NEXT_PUBLIC_ONESIGNAL_APP_ID no .env');
      return;
    }

    setAppId(configuredAppId);
    setStatus('configured');
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  useEffect(() => {
    checkConfiguration();
  }, [checkConfiguration]);

  const handleSubscribe = async () => {
    if (!window.OneSignalDeferred) {
      setTestResult('❌ OneSignal SDK não carregado');
      return;
    }

    window.OneSignalDeferred.push(async function(OneSignal: any) {
      try {
        setTestResult('⏳ Solicitando permissão...');
        await OneSignal.Slidedown.promptPush();
        
        // Aguardar resposta do usuário
        setTimeout(() => {
          const subscribed = OneSignal.User.PushSubscription.optedIn;
          setIsSubscribed(subscribed);
          
          if (subscribed) {
            setTestResult('✅ Inscrito com sucesso!');
          } else {
            setTestResult('ℹ️ Permissão negada ou cancelada');
          }
        }, 1000);
      } catch (error: any) {
        setTestResult(`❌ Erro: ${error.message}`);
      }
    });
  };

  const handleUnsubscribe = async () => {
    if (!window.OneSignalDeferred) {
      setTestResult('❌ OneSignal SDK não carregado');
      return;
    }

    window.OneSignalDeferred.push(async function(OneSignal: any) {
      try {
        setTestResult('⏳ Cancelando inscrição...');
        await OneSignal.User.PushSubscription.optOut();
        setIsSubscribed(false);
        setTestResult('✅ Inscrição cancelada');
      } catch (error: any) {
        setTestResult(`❌ Erro: ${error.message}`);
      }
    });
  };

  const sendTestNotification = async () => {
    try {
      setTestResult('⏳ Enviando notificação de teste...');
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post: {
            id: 'test-notification',
            title: '🧪 Notificação de Teste',
            excerpt: 'Esta é uma notificação de teste do OneSignal!',
            aiImage: 'https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=Teste+OneSignal',
            slug: 'test-notification',
            date: new Date().toISOString(),
          },
          action: 'publish',
          sendPush: true,
        }),
      });

      const result = await response.json();

      if (result.success && result.pushNotification) {
        if (result.pushNotification.sent) {
          setTestResult(`✅ Notificação enviada para ${result.pushNotification.recipients} usuário(s)!`);
        } else {
          setTestResult(`⚠️ Falha: ${result.pushNotification.error}`);
        }
      } else {
        setTestResult(`❌ Erro: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Erro: ${error.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
          <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Teste do OneSignal
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verifique a configuração e teste notificações push
          </p>
        </div>
      </div>

      {/* Status da Configuração */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Status da Configuração
        </h3>
        
        <div className={`p-4 rounded-lg border-2 ${
          status === 'configured' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : status === 'not-configured'
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            : status === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
        }`}>
          <div className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
            {status === 'configured' && <Check className="w-5 h-5 text-green-600 dark:text-green-400" />}
            {status === 'not-configured' && <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
            {status === 'error' && <X className="w-5 h-5 text-red-600 dark:text-red-400" />}
            
            <span className="font-medium text-gray-900 dark:text-white">
              {status === 'loading' && 'Verificando configuração...'}
              {status === 'configured' && 'OneSignal Configurado'}
              {status === 'not-configured' && 'OneSignal Não Configurado'}
              {status === 'error' && 'Erro na Configuração'}
            </span>
          </div>
          
          {appId && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              App ID: <code className="bg-white dark:bg-slate-700 px-2 py-1 rounded">{appId}</code>
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Status da Inscrição */}
      {status === 'configured' && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Status da Inscrição
          </h3>
          
          <div className={`p-4 rounded-lg border-2 ${
            isSubscribed
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <>
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Inscrito
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Não Inscrito
                    </span>
                  </>
                )}
              </div>
              
              {isSubscribed ? (
                <button
                  onClick={handleUnsubscribe}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancelar Inscrição
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Inscrever-se
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Teste de Notificação */}
      {status === 'configured' && isSubscribed && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Enviar Notificação de Teste
          </h3>
          
          <button
            onClick={sendTestNotification}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            🚀 Enviar Notificação de Teste
          </button>
        </div>
      )}

      {/* Resultado do Teste */}
      {testResult && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {testResult}
          </p>
        </div>
      )}

      {/* Instruções */}
      {status === 'not-configured' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Como Configurar:
          </h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Acesse https://onesignal.com/</li>
            <li>Vá em Settings → Keys & IDs</li>
            <li>Copie o App ID</li>
            <li>Adicione no arquivo .env: NEXT_PUBLIC_ONESIGNAL_APP_ID=seu_app_id</li>
            <li>Reinicie o servidor</li>
          </ol>
        </div>
      )}
    </div>
  );
}

// Declaração de tipos
declare global {
  interface Window {
    OneSignalDeferred?: any[];
  }
}
