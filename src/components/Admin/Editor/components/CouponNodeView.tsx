import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import CouponWidget from '../../../Widgets/CouponWidget';
import CouponWidgetEditor from '../../WidgetEditors/CouponWidgetEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const CouponNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={CouponWidget}
      editorComponent={CouponWidgetEditor}
      title="Editar Cupom"
      description="Ajuste os dados do cupom e detalhes de exibição."
    />
  );
};
