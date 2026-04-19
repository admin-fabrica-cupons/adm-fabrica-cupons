import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import RelatedPostsWidget from '../../../Widgets/RelatedPostsWidget';
import RelatedPostsWidgetEditor from '../../WidgetEditors/RelatedPostsWidgetEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const RelatedPostsNodeView: React.FC<NodeViewProps> = (props) => {
    return (
        <WidgetNodeViewWrapper
            {...props}
            component={RelatedPostsWidget}
            editorComponent={RelatedPostsWidgetEditor}
            title="Posts Relacionados"
            description="Selecione posts relevantes para indicar aos leitores."
        />
    );
};
