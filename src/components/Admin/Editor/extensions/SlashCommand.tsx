import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { CommandList, CommandListProps, CommandListRef } from '../components/CommandList';
import {
  Heading1,
  Heading2,
  Heading3,
  Text,
  List,
  ListOrdered,
  Image as ImageIcon,
  Youtube,
  Table as TableIcon,
  ThumbsUp,
  Info,
  Quote,
  Zap,
  BookOpen
} from 'lucide-react';
import { TbBlockquote, TbShoppingBagPlus, TbShoppingCartPlus } from 'react-icons/tb';
import { IoTicketOutline } from 'react-icons/io5';
import { LuTickets } from 'react-icons/lu';
import { TfiLayoutSlider } from 'react-icons/tfi';

const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Texto',
      description: 'Comece a escrever com texto simples.',
      searchTerms: ['p', 'paragraph'],
      icon: <Text size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run();
      },
    },
    {
      title: 'Título 1',
      description: 'Cabeçalho grande.',
      searchTerms: ['h1', 'heading1', 'header'],
      icon: <Heading1 size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Título 2',
      description: 'Cabeçalho médio.',
      searchTerms: ['h2', 'heading2', 'header'],
      icon: <Heading2 size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Título 3',
      description: 'Cabeçalho pequeno.',
      searchTerms: ['h3', 'heading3', 'header'],
      icon: <Heading3 size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'Lista com marcadores',
      description: 'Crie uma lista simples.',
      searchTerms: ['unordered', 'point'],
      icon: <List size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Lista numerada',
      description: 'Crie uma lista com números.',
      searchTerms: ['ordered', 'number'],
      icon: <ListOrdered size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Citação',
      description: 'Bloco de citação.',
      searchTerms: ['quote', 'blockquote', 'citação'],
      icon: <TbBlockquote size={18} />,
      command: ({ editor, range }: any) => {
        const chain = editor.chain().focus().deleteRange(range);
        if (!editor.isActive('paragraph')) {
          chain.setParagraph();
        }
        chain.toggleBlockquote().run();
      },
    },
    {
      title: 'Cupom',
      description: 'Insira um widget de cupom.',
      searchTerms: ['coupon', 'cupom', 'offer'],
      icon: <IoTicketOutline size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'coupon' }).run();
      },
    },
    {
      title: 'Produto',
      description: 'Insira um widget de produto.',
      searchTerms: ['product', 'produto', 'item'],
      icon: <TbShoppingBagPlus size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'product' }).run();
      },
    },
    {
      title: 'Accordion',
      description: 'Lista colapsável de itens.',
      searchTerms: ['accordion', 'faq', 'collapse'],
      icon: <List size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'accordion' }).run();
      },
    },
    {
      title: 'Imagem',
      description: 'Carregue uma imagem.',
      searchTerms: ['image', 'photo', 'picture'],
      icon: <ImageIcon size={18} />,
      command: ({ editor, range }: any) => {
        const url = window.prompt('URL da imagem:');
        if (url) {
          editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
        }
      },
    },
    {
      title: 'YouTube',
      description: 'Insira um vídeo do YouTube.',
      searchTerms: ['video', 'youtube', 'embed'],
      icon: <Youtube size={18} />,
      command: ({ editor, range }: any) => {
        if ((editor as any).openYoutubeDialog) {
          (editor as any).openYoutubeDialog((url: string) => {
            editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run();
          });
        } else {
          const url = window.prompt('URL do vídeo do YouTube:');
          if (url) {
            editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run();
          }
        }
      },
    },
    {
      title: 'Slides de Imagem',
      description: 'Carrossel de imagens.',
      searchTerms: ['slides', 'carrossel', 'image_slides'],
      icon: <TfiLayoutSlider size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'image_slides' }).run();
      },
    },
    {
      title: 'Lista de Produtos',
      description: 'Lista ou grade de produtos.',
      searchTerms: ['product_list', 'lista', 'produtos'],
      icon: <TbShoppingCartPlus size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'product_list' }).run();
      },
    },
    {
      title: 'Produto Destaque',
      description: 'Widget de destaque.',
      searchTerms: ['hot_product', 'destaque'],
      icon: <Zap size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'hot_product' }).run();
      },
    },
    {
      title: 'Lista de Cupons',
      description: 'Exibe múltiplos cupons.',
      searchTerms: ['coupon_list', 'cupons', 'lista'],
      icon: <LuTickets size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'coupon_list' }).run();
      },
    },
    {
      title: 'Tabela',
      description: 'Tabela customizada.',
      searchTerms: ['table', 'tabela'],
      icon: <TableIcon size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'table' }).run();
      },
    },
    {
      title: 'Prós e Contras',
      description: 'Comparativo de vantagens e desvantagens.',
      searchTerms: ['pros', 'cons', 'comparativo'],
      icon: <ThumbsUp size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'pros_and_cons' }).run();
      },
    },
    {
      title: 'Nota do Editor',
      description: 'Bloco de nota destacado.',
      searchTerms: ['nota', 'note', 'editor'],
      icon: <Info size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'note_of_editor' }).run();
      },
    },
    {
      title: 'Citação do Editor',
      description: 'Widget de citação com fonte.',
      searchTerms: ['citation', 'fonte', 'autor'],
      icon: <Quote size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'citation' }).run();
      },
    },
    {
      title: 'Posts Relacionados',
      description: 'Sugira outros conteúdos para leitura.',
      searchTerms: ['relacionados', 'posts', 'leitura', 'related'],
      icon: <BookOpen size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'related_posts' }).run();
      },
    },
  ].filter((item) => {
    if (typeof query === 'string' && query.length > 0) {
      const search = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        (item.searchTerms && item.searchTerms.some((term: string) => term.includes(search)))
      );
    }
    return true;
  });
};

const renderItems = () => {
  let component: ReactRenderer<CommandListRef, CommandListProps> | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: { editor: any; clientRect: any }) => {
      component = new ReactRenderer<CommandListRef, CommandListProps>(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },

    onUpdate: (props: { editor: any; clientRect: any }) => {
      component?.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      if (!popup?.[0] || popup[0].state?.isDestroyed) {
        return;
      }

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === 'Escape') {
        if (popup?.[0] && !popup[0].state?.isDestroyed) {
          popup[0].hide();
        }
        return true;
      }

      return component?.ref?.onKeyDown(props);
    },

    onExit: () => {
      if (popup?.[0] && !popup[0].state?.isDestroyed) {
        popup[0].destroy();
      }
      component?.destroy();
    },
  };
};

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
        items: getSuggestionItems,
        render: renderItems,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
