import React from 'react';

interface TextViewProps {
  content?: string;
  className?: string;
  style?: React.CSSProperties;
}

const TextView: React.FC<TextViewProps> = ({
  content,
  className = '',
  style = {}
}) => {
  if (!content || content.trim() === '') {
    return (
      <p className={`text-gray-400 dark:text-gray-500 italic ${className}`}>
        Sem conteúdo
      </p>
    );
  }

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        ...style
      }}
    />
  );
};

// Estilos CSS globais para restaurar a formatação que o Tailwind remove
export const TextViewStyles = () => (
  <style>{`
    /* Variáveis para adaptação automática de cores */
    :root {
      --editor-text: #374151;
      --editor-text-muted: #4b5563;
      --editor-gray-400: #6b7280;
      --editor-gray-300: #9ca3af;
      --editor-gray-200: #d1d5db;
      --editor-primary: #3b82f6;
    }

    .dark {
      --editor-text: #ffffff;
      --editor-text-muted: #f3f4f6;
      --editor-gray-400: #d1d5db;
      --editor-gray-300: #9ca3af;
      --editor-gray-200: #6b7280;
      --editor-primary: #60a5fa;
    }

    /* Container base */
    .rich-text-content {
      color: var(--editor-text);
      font-size: 1rem;
      line-height: 1.75;
    }

    /* Underline Customizado e Moderno */
    .modern-underline {
      text-decoration: none !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: modern-underline-pulse 2.5s infinite ease-in-out;
      display: inline-block;
      line-height: 1;
    }

    .modern-underline:hover {
      filter: drop-shadow(0 0-4px rgba(0,0,0,0.1));
      transform: translateY(-1px);
    }

    @keyframes modern-underline-pulse {
      0% { opacity: 1; }
      50% { opacity: 0.85; }
      100% { opacity: 1; }
    }

    /* Headings */
    .rich-text-content h1 {
      font-size: 1.5rem !important;
      font-weight: 800 !important;
      margin-top: 2rem !important;
      margin-bottom: 1rem !important;
      line-height: 1.1 !important;
      color: var(--editor-text) !important;
    }

    .rich-text-content h2 {
      font-size: 1.25rem !important;
      font-weight: 700 !important;
      margin-top: 1.75rem !important;
      margin-bottom: 0.75rem !important;
      line-height: 1.2 !important;
      color: var(--editor-text) !important;
    }

    .rich-text-content h3 {
      font-size: 1.125rem !important;
      font-weight: 600 !important;
      margin-top: 1.5rem !important;
      margin-bottom: 0.75rem !important;
      line-height: 1.3 !important;
      color: var(--editor-text) !important;
    }

    /* Listas */
    .rich-text-content ul {
      list-style-type: disc !important;
      margin: 1rem 0 !important;
      padding-left: 1.625rem !important;
    }

    .rich-text-content ol {
      list-style-type: decimal !important;
      margin: 1rem 0 !important;
      padding-left: 1.625rem !important;
    }

    .rich-text-content li {
      margin-bottom: 0.5rem !important;
    }

    /* Formatação */
    .rich-text-content strong, .rich-text-content b {
      font-weight: 700 !important;
      color: var(--editor-text) !important;
    }

    .rich-text-content em, .rich-text-content i {
      font-style: italic !important;
    }

    /* Links */
    .rich-text-content a {
      color: var(--editor-primary) !important;
      text-decoration: underline !important;
      font-weight: 500 !important;
      cursor: pointer !important;
    }
    
    .rich-text-content a:hover {
      opacity: 0.8;
    }

    /* Blockquotes */
    .rich-text-content blockquote {
      font-weight: 500;
      font-style: italic;
      color: var(--editor-text-muted);
      border-left: 4px solid var(--editor-gray-200);
      margin: 1.5rem 0;
      padding-left: 1rem;
    }
  `}</style>
);

export default TextView;