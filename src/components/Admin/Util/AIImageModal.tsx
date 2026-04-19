import React from 'react';
import AIImageChat from './AIImageChat';
import { motion } from 'framer-motion';

interface AIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyImage?: (url: string) => void;
  title?: string;
}

const AIImageModal: React.FC<AIImageModalProps> = ({
  isOpen,
  onClose,
  onApplyImage,
  title = 'Lu Image'
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 ai-chat-selection bg-black/40 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl h-[640px] z-[10000]"
      >
        <AIImageChat
          isOpen={isOpen}
          onClose={onClose}
          onApplyImage={onApplyImage}
          variant="panel"
          title={title}
        />
      </motion.div>
    </div>
  );
};

export default AIImageModal;
