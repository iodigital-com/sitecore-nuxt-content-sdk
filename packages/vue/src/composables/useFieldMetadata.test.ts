import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, toRef, type Ref } from 'vue';
import { useFieldMetadata } from './useFieldMetadata';

const testMetadata = {
  contextItem: {
    id: '{09A07660-6834-476C-B93B-584248D3003B}',
    language: 'en',
    revision: 'a0b36ce0a7db49418edf90eb9621e145',
    version: 1,
  },
  fieldId: '{414061F4-FBB1-4591-BC37-BFFA67F745EB}',
  fieldType: 'single-line',
  rawValue: 'Test1',
};

const TestComponent = defineComponent({
  props: {
    field: {
      type: Object as () => { value?: string; metadata?: Record<string, unknown> } | undefined,
      default: undefined,
    },
    editable: { type: Boolean, default: true },
  },
  setup(props) {
    const { showMetadata, metadata } = useFieldMetadata(
      toRef(props, 'field') as Ref<{ metadata?: Record<string, unknown> } | undefined>,
      toRef(props, 'editable')
    );
    return { showMetadata, metadata };
  },
  render() {
    if (this.showMetadata) {
      return h('div', { class: 'with-metadata', 'data-metadata': JSON.stringify(this.metadata) }, [
        h('h1', this.field?.value ?? ''),
      ]);
    }
    return h('div', [h('h1', this.field?.value ?? '')]);
  },
});

describe('useFieldMetadata', () => {
  it('should not show metadata when field is empty', () => {
    const { showMetadata } = useFieldMetadata(ref(undefined), ref(true));
    expect(showMetadata.value).toBe(false);
  });

  it('should not show metadata when field has no metadata', () => {
    const { showMetadata } = useFieldMetadata(
      ref<{ value?: string; metadata?: Record<string, unknown> } | undefined>({ value: 'test' }),
      ref(true)
    );
    expect(showMetadata.value).toBe(false);
  });

  it('should not show metadata when editable is false', () => {
    const { showMetadata } = useFieldMetadata(
      ref({ value: 'test', metadata: testMetadata }),
      ref(false)
    );
    expect(showMetadata.value).toBe(false);
  });

  it('should show metadata when field has metadata and editable is true', () => {
    const { showMetadata, metadata } = useFieldMetadata(
      ref({ value: 'test', metadata: testMetadata }),
      ref(true)
    );
    expect(showMetadata.value).toBe(true);
    expect(metadata.value).toEqual(testMetadata);
  });

  it('should show metadata when editable is undefined (defaults to true)', () => {
    const { showMetadata } = useFieldMetadata(
      ref({ value: 'test', metadata: testMetadata }),
      ref(undefined)
    );
    expect(showMetadata.value).toBe(true);
  });

  it('should react to field changes', async () => {
    const field = ref<{ value?: string; metadata?: Record<string, unknown> } | undefined>(
      undefined
    );
    const { showMetadata } = useFieldMetadata(field, ref(true));

    expect(showMetadata.value).toBe(false);

    field.value = { value: 'test', metadata: testMetadata };
    expect(showMetadata.value).toBe(true);

    field.value = { value: 'test' };
    expect(showMetadata.value).toBe(false);
  });

  it('should react to editable changes', async () => {
    const editable = ref(true);
    const { showMetadata } = useFieldMetadata(
      ref({ value: 'test', metadata: testMetadata }),
      editable
    );

    expect(showMetadata.value).toBe(true);

    editable.value = false;
    expect(showMetadata.value).toBe(false);
  });

  describe('component integration', () => {
    it('should render without metadata wrapper when no metadata', () => {
      const wrapper = mount(TestComponent, {
        props: { field: { value: 'test' }, editable: true },
      });
      expect(wrapper.html()).not.toContain('data-metadata');
      expect(wrapper.text()).toBe('test');
    });

    it('should render with metadata wrapper when metadata present and editable', () => {
      const wrapper = mount(TestComponent, {
        props: { field: { value: 'car', metadata: testMetadata }, editable: true },
      });
      expect(wrapper.html()).toContain('data-metadata');
      expect(wrapper.text()).toBe('car');
    });

    it('should render without metadata wrapper when editable is false', () => {
      const wrapper = mount(TestComponent, {
        props: { field: { value: 'test', metadata: testMetadata }, editable: false },
      });
      expect(wrapper.html()).not.toContain('data-metadata');
    });
  });
});
