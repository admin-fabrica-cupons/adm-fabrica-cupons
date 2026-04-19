import React, { useState } from 'react';
import { Download, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import Image from 'next/image';
import { fetchProductData, checkDailyLimit, ScrapedData } from '../../../utils/productScraper';

interface ProductImporterProps {
  onImport: (data: ScrapedData) => void;
  compact?: boolean;
}

const ProductImporter: React.FC<ProductImporterProps> = ({ onImport, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'input' | 'loading' | 'preview'>('input');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ScrapedData | null>(null);

  const handleOpen = () => {
    const limit = checkDailyLimit();
    if (!limit.allowed) {
      alert('Limite diário de 32 requisições atingido. Tente novamente amanhã.');
      return;
    }
    setIsOpen(true);
    setStep('input');
    setError(null);
    setUrl('');
  };

  const handleFetch = async () => {
    if (!url) return;

    setStep('loading');
    setError(null);

    try {
      const data = await fetchProductData(url);
      setPreviewData(data);
      setStep('preview');
    } catch (err: any) {
      let errorMessage = err.message || 'Erro ao buscar dados.';
      
      // Melhorar mensagens de erro específicas
      if (errorMessage.includes('Token de API inválido') || errorMessage.includes('Unauthorized')) {
        errorMessage = '🔑 Token de API inválido ou expirado. Verifique o arquivo .env e configure TOKEN_API_POSTS. Consulte CONFIGURACAO_SCRAPING.md para instruções.';
      } else if (errorMessage.includes('Token not found')) {
        errorMessage = '⚙️ Configure TOKEN_API_POSTS no arquivo .env. Consulte CONFIGURACAO_SCRAPING.md para obter um token gratuito.';
      }
      
      setError(errorMessage);
      setStep('input');
    }
  };

  const handleConfirm = () => {
    if (previewData) {
      onImport(previewData);
      setIsOpen(false);
      setPreviewData(null);
      setStep('input');
      setUrl('');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-1.5 ${compact
          ? 'px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 text-xs font-semibold transition-all'
          : 'px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm rounded transition-colors'
          }`}
        title="Importar dados via URL (Mercado Livre)"
      >
        <Download size={compact ? 14 : 14} />
        {compact ? 'Usar API' : 'Usar API'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Download size={16} className="text-purple-500" />
                Importar Produto
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {/* Step 1: Input */}
              {step === 'input' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Link do Produto (Mercado Livre)
                    </label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://produto.mercadolivre.com.br/..."
                      className="w-full p-2.5 border dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600 focus:ring-offset-0 focus:bg-white dark:focus:bg-slate-800 transition-all hover:border-gray-300 dark:hover:border-slate-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Restam {checkDailyLimit().remaining} requisições hoje.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleFetch}
                      disabled={!url}
                      className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buscar Dados
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Loading */}
              {step === 'loading' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 size={32} className="animate-spin text-purple-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Analisando link do produto...</p>
                </div>
              )}

              {/* Step 3: Preview */}
              {step === 'preview' && previewData && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/10 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-inner">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 bg-white dark:bg-slate-800 rounded-lg flex-shrink-0 border-2 dark:border-slate-700 shadow-sm overflow-hidden group">
                        {previewData.image ? (
                          <>
                            <Image
                              src={previewData.image}
                              alt={previewData.title || 'Product'}
                              fill
                              className="object-contain p-2 transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-900 text-gray-400">
                            <span className="text-xs">Sem img</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                          {previewData.title}
                        </h4>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-lg font-black text-green-600 dark:text-green-500">{previewData.price}</span>
                          {previewData.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">{previewData.originalPrice}</span>
                          )}
                          {previewData.discount && (
                            <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                              {previewData.discount}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {previewData.tagRanking && (
                            <div className="text-[10px] font-black text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-md uppercase tracking-wide">
                              {previewData.tagRanking}
                            </div>
                          )}
                          {previewData.ranking && (
                            <div className="text-[10px] font-bold text-orange-700 dark:text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-md">
                              {previewData.ranking}
                            </div>
                          )}
                          {previewData.soldCount && (
                            <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                              {previewData.soldCount}
                            </div>
                          )}
                        </div>
                        {previewData.rating > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-yellow-500">★</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{previewData.rating}</span>
                          </div>
                        )}
                        {previewData.storeName && (
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            Loja: {previewData.storeName}
                            {previewData.sellerType && <span className="ml-1 text-blue-600 dark:text-blue-400">({previewData.sellerType})</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    {previewData.shortDescription && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {previewData.shortDescription}
                        </p>
                      </div>
                    )}
                    {previewData.allImages && previewData.allImages.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {previewData.allImages.length} imagens disponíveis
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {previewData.allImages.slice(0, 5).map((img: string, idx: number) => (
                            <div key={idx} className="relative w-12 h-12 flex-shrink-0 rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                              <Image src={img} alt={`Img ${idx + 1}`} fill className="object-contain p-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-center text-blue-800 dark:text-blue-300 font-semibold flex items-center justify-center gap-2">
                      <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                      Dados prontos para importação
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setStep('input')}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex items-center gap-2 px-5 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg shadow-green-500/20 transition-all active:scale-95"
                    >
                      <CheckCircle size={16} /> Confirmar Importação
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImporter;