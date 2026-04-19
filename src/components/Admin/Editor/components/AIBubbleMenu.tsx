import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import * as Separator from '@radix-ui/react-separator';
import * as Popover from '@radix-ui/react-popover';
import { RiRobot3Line, RiExpandVerticalSLine } from 'react-icons/ri';
import { GrContract } from 'react-icons/gr';
import { TbTextGrammar } from 'react-icons/tb';
import { useState } from 'react';
import { useNotifications } from '../../../Common/NotificationContext';

interface AIBubbleMenuProps {
  editor: Editor;
}

export const AIBubbleMenu = ({ editor }: AIBubbleMenuProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { addNotification } = useNotifications();

  const handleAIAction = async (action: string) => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);

    if (!text || text.trim().length === 0) {
      addNotification({
        type: 'warning',
        message: 'Selecione um texto para usar a IA',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    addNotification({
      type: 'info',
      message: 'Gerando com IA...',
      duration: 2000
    });

    try {
      let prompt = '';
      switch (action) {
        case 'improve':
          prompt = `Melhore a escrita do seguinte texto, tornando-o mais envolvente e claro, mantendo o tom original: "${text}"`;
          break;
        case 'shorten':
          prompt = `Resuma o seguinte texto de forma concisa: "${text}"`;
          break;
        case 'expand':
          prompt = `Expanda o seguinte texto mantendo o sentido original: "${text}"`;
          break;
        case 'fix':
          prompt = `Corrija erros gramaticais e de pontuação do seguinte texto: "${text}"`;
          break;
        default:
          prompt = `Melhore o seguinte texto: "${text}"`;
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          tone: 'normal',
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na geração');
      }

      const data = await response.json();
      
      if (data.text) {
        // Verifica se o range ainda é válido e se o texto não mudou
        const docSize = editor.state.doc.content.size;
        if (to > docSize) {
          addNotification({
            type: 'error',
            message: 'O documento foi modificado. Operação cancelada.',
            duration: 3000
          });
          return;
        }

        const currentText = editor.state.doc.textBetween(from, to);
        if (currentText !== text) {
          addNotification({
            type: 'warning',
            message: 'O texto selecionado mudou. Operação cancelada.',
            duration: 3000
          });
          return;
        }

        editor.chain().focus().deleteRange({ from, to }).insertContent(data.text).run();
        addNotification({
          type: 'success',
          message: 'Texto gerado com sucesso!',
          duration: 3000
        });
      } else {
        addNotification({
          type: 'error',
          message: 'Nenhum texto gerado',
          duration: 3000
        });
      }
    } catch (error) {
      console.error(error);
      addNotification({
        type: 'error',
        message: 'Erro ao gerar texto com IA',
        duration: 3000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <BubbleMenu
      editor={editor} 
      shouldShow={({ editor }: { editor: Editor }) => {
        return (
          !editor.state.selection.empty &&
          !editor.isActive('image') &&
          !editor.isActive('coupon') &&
          !editor.isActive('coupon_list') &&
          !editor.isActive('product') &&
          !editor.isActive('product_list') &&
          !editor.isActive('hot_product') &&
          !editor.isActive('accordion') &&
          !editor.isActive('table') &&
          !editor.isActive('pros_and_cons')
        );
      }}
      appendTo={() => document.body}
      options={{
        placement: 'bottom-start',
        strategy: 'fixed',
      }}
      className="z-[100000]"
      style={{ zIndex: 100000 }}
    >
      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-950 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <RiRobot3Line size={18} className="text-[#ff2aa3] drop-shadow-[0_0_6px_rgba(255,42,163,0.6)]" />
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleAIAction('improve')}
            disabled={isGenerating}
            className="h-8 px-3 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Melhorar escrita"
          >
            Melhorar
          </button>
          <Separator.Root className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={() => handleAIAction('expand')}
            disabled={isGenerating}
            className="h-8 w-8 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center"
            title="Expandir texto"
          >
            <RiExpandVerticalSLine size={16} />
          </button>
          <button
            onClick={() => handleAIAction('shorten')}
            disabled={isGenerating}
            className="h-8 w-8 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center"
            title="Resumir"
          >
            <GrContract size={14} />
          </button>
          <button
            onClick={() => handleAIAction('fix')}
            disabled={isGenerating}
            className="h-8 w-8 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center"
            title="Corrigir Gramática"
          >
            <TbTextGrammar size={15} />
          </button>
        </div>
        <div className="sm:hidden">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="h-8 px-3 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                Ações
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="z-[100001] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl p-2 space-y-1">
                <button
                  onClick={() => handleAIAction('improve')}
                  disabled={isGenerating}
                  className="w-full h-8 px-3 rounded-md text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Melhorar
                </button>
                <button
                  onClick={() => handleAIAction('expand')}
                  disabled={isGenerating}
                  className="w-full h-8 px-3 rounded-md text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <RiExpandVerticalSLine size={16} />
                  Expandir texto
                </button>
                <button
                  onClick={() => handleAIAction('shorten')}
                  disabled={isGenerating}
                  className="w-full h-8 px-3 rounded-md text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <GrContract size={14} />
                  Resumir texto
                </button>
                <button
                  onClick={() => handleAIAction('fix')}
                  disabled={isGenerating}
                  className="w-full h-8 px-3 rounded-md text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <TbTextGrammar size={15} />
                  Corrigir gramática
                </button>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </BubbleMenu>
  );
};
