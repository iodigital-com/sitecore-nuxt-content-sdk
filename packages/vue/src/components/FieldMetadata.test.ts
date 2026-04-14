import { describe, it, expect } from 'vitest';
import { defineComponent, h } from 'vue';
import FieldMetadata from './FieldMetadata.vue';
import { render } from '@testing-library/vue';

const metadata = {
  contextItem: {
    id: '{09A07660-6834-476C-B93B-584248D3003B}',
    language: 'en',
    revision: 'a0b36ce0a7db49418edf90eb9621e145',
    version: 1,
  },
  fieldId: '{414061F4-FBB1-4591-BC37-BFFA67F745EB}',
  fieldType: 'date',
  rawValue: 'Test1',
};

describe('FieldMetadata', () => {
  it('should render field metadata', () => {
    const Foo = defineComponent({ render: () => h('h2', 'foo') });

    const wrapper = render(FieldMetadata, {
      props: { metadata },
      slots: { default: () => h(Foo) },
    });

    expect(wrapper.container.innerHTML).toBe(
      [
        `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
          metadata
        )}</code>`,
        '<h2>foo</h2>',
        '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
      ].join('')
    );
  });
});
