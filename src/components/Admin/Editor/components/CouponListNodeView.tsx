import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import CouponListWidget from '../../../Widgets/CouponListWidget';
import CouponListWidgetEditor from '../../WidgetEditors/CouponListWidgetEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const CouponListNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={CouponListWidget}
      editorComponent={CouponListWidgetEditor}
      title="Editar Lista de Cupons"
      description="Configure os cupons exibidos e o layout."
      width="max-w-6xl"
    />
  );
};
