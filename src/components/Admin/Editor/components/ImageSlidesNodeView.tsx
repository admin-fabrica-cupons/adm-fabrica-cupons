import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import ImageSlides from '../../../Widgets/ImageSlides';
import ImageSlidesEditor from '../../WidgetEditors/ImageSlidesEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const ImageSlidesNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={ImageSlides}
      editorComponent={ImageSlidesEditor}
      title="Editar Slides de Imagens"
      description="Gerencie imagens, navegação e intervalo."
      width="max-w-6xl"
    />
  );
};
