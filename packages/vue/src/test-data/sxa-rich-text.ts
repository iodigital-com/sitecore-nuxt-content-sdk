import { defineComponent, h } from 'vue';
import type { Field } from '@sitecore-content-sdk/content/layout';

interface Fields {
  Text: Field<string>;
  Title: Field<string>;
}

type RichTextProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = defineComponent({
  name: 'RichTextDefault',
  props: {
    params: { type: Object as () => RichTextProps['params'], required: true },
    fields: { type: Object as () => RichTextProps['fields'], required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: `rendering-variant ${props.params.styles}` }, [
        h('span', { class: 'default' }, 'Rich text'),
      ]);
  },
});

export const WithTitle = defineComponent({
  name: 'RichTextWithTitle',
  props: {
    params: { type: Object as () => RichTextProps['params'], required: true },
    fields: { type: Object as () => RichTextProps['fields'], required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: `rendering-variant ${props.params.styles}` }, [
        h('div', { class: 'title' }, props.fields.Title.value),
        h('span', { class: 'text' }, props.fields.Text.value),
      ]);
  },
});
