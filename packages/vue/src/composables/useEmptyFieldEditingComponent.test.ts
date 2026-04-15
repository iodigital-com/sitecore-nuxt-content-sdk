/* eslint-disable react-hooks/rules-of-hooks */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, type Component } from 'vue';
import { EMPTY_DATE_FIELD_VALUE } from '@sitecore-content-sdk/content/layout';
import { useEmptyFieldEditingComponent } from './useEmptyFieldEditingComponent';
import DefaultEmptyFieldEditingComponentText from '../components/DefaultEmptyFieldEditingComponentText.vue';

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

const CustomEmptyComponent = defineComponent({
  render: () => h('span', { class: 'empty-field-value-placeholder' }, 'Custom Empty field value'),
});

const TestFieldComponent = defineComponent({
  render: () => h('div', [h('h1', 'hi'), h('h2', 'foo'), h('p', 'bar')]),
});

const makeWrapper = (fieldValue: any, editable?: boolean, customEmpty?: Component) =>
  defineComponent({
    setup() {
      const field = ref(fieldValue);
      const editableRef = ref(editable);
      const customEmptyRef = ref(customEmpty);
      const { showEmpty, emptyComponent, isCustomComponent } = useEmptyFieldEditingComponent(
        field,
        editableRef,
        customEmptyRef,
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      return { showEmpty, emptyComponent, isCustomComponent, field };
    },
    render() {
      if (this.showEmpty) {
        const props = this.isCustomComponent
          ? {}
          : { ...this.$props, editable: undefined, field: undefined };
        return h(this.emptyComponent!, props);
      }
      return h(TestFieldComponent);
    },
  });

describe('useEmptyFieldEditingComponent', () => {
  describe('Metadata', () => {
    it('should not show empty component when field has no metadata', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ value: '' }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(false);
    });

    it('should not show empty component when editable is false', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ value: '', metadata: testMetadata }),
        ref(false),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(false);
    });

    it('should not show empty component when field value is not empty', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ value: 'field value', metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(false);
    });

    it('should show default empty component when field value is empty', () => {
      const { showEmpty, emptyComponent } = useEmptyFieldEditingComponent(
        ref({ value: '', metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(true);
      expect(emptyComponent.value).toBe(DefaultEmptyFieldEditingComponentText);
    });

    it('should show custom empty component when provided', () => {
      const { showEmpty, emptyComponent } = useEmptyFieldEditingComponent(
        ref({ value: '', metadata: testMetadata }),
        ref(true),
        ref(CustomEmptyComponent),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(true);
      expect(emptyComponent.value).toStrictEqual(CustomEmptyComponent);
    });

    it('should render default empty component in DOM', () => {
      const Wrapper = makeWrapper({ value: '', metadata: testMetadata }, true);
      const wrapper = mount(Wrapper);
      expect(wrapper.text()).toContain('[No text in field]');
    });

    it('should render custom empty component in DOM', () => {
      const Wrapper = makeWrapper(
        { value: '', metadata: testMetadata },
        true,
        CustomEmptyComponent
      );
      const wrapper = mount(Wrapper);
      expect(wrapper.text()).toContain('Custom Empty field value');
    });

    it('should render field component when value is provided', () => {
      const Wrapper = makeWrapper({ value: 'field value', metadata: testMetadata }, true);
      const wrapper = mount(Wrapper);
      expect(wrapper.text()).toContain('hi');
      expect(wrapper.text()).toContain('foo');
    });

    it('should render field component when editable is false', () => {
      const Wrapper = makeWrapper({ value: '', metadata: testMetadata }, false);
      const wrapper = mount(Wrapper);
      expect(wrapper.text()).toContain('hi');
    });

    it('should render field component when metadata is not provided', () => {
      const Wrapper = makeWrapper({ value: '' }, true);
      const wrapper = mount(Wrapper);
      expect(wrapper.text()).toContain('hi');
    });
  });

  describe('Date', () => {
    it('should render field component when date value is provided', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ value: '2024-01-01T00:00:00Z', metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(false);
    });

    it('should show empty component when date value is empty', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ value: EMPTY_DATE_FIELD_VALUE, metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(true);
    });
  });

  describe('Image', () => {
    it('should render field component when field src is provided', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ src: 'img src', metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(false);
    });

    it('should render field component when field value src is provided', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ value: { src: 'img src' }, metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(false);
    });

    it('should show empty component when field value src is not provided', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ value: { src: undefined }, metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(true);
    });

    it('should show empty component when field src is not provided', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ src: undefined, metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(true);
    });
  });

  describe('Link', () => {
    it('should render field component when field href is provided', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ href: 'some href', metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(false);
    });

    it('should render field component when field value href is provided', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ value: { href: 'some href' }, metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(false);
    });

    it('should show empty component when field value href is not provided', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ value: { href: undefined }, metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(true);
    });

    it('should show empty component when field href is not provided', () => {
      const { showEmpty } = useEmptyFieldEditingComponent(
        ref({ href: undefined, metadata: testMetadata }),
        ref(true),
        ref(undefined),
        { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
      );
      expect(showEmpty.value).toBe(true);
    });
  });
});
