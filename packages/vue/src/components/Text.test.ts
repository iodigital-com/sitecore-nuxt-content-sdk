import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import { default as Text } from './Text.vue';
import type { TextField } from './Text';

const stripComments = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');

describe('<Text />', () => {
  it('should render nothing with missing field', () => {
    const field = null as unknown as TextField;
    const wrapper = mount(Text, { props: { field } });
    expect(stripComments(wrapper.html())).toBe('');
  });

  it('should render nothing with empty value', () => {
    const field = { value: '' };
    const wrapper = mount(Text, { props: { field } });
    expect(stripComments(wrapper.html())).toBe('');
  });

  it('should render nothing with missing value', () => {
    const field = {};
    const wrapper = mount(Text, { props: { field } });
    expect(stripComments(wrapper.html())).toBe('');
  });

  it('should render value with editing explicitly disabled', () => {
    const field = { value: 'value' };
    const wrapper = mount(Text, { props: { tag: 'span', field, editable: false } });
    expect(wrapper.element.innerHTML).toContain('value');
  });

  it('should encode values with editing explicitly disabled', () => {
    const field = { value: 'value < >' };
    const wrapper = mount(Text, { props: { tag: 'span', field, editable: false } });
    expect(wrapper.element.innerHTML).toContain('&lt; &gt;');
  });

  it('should render value with just a value', () => {
    const field = { value: 'value' };
    const wrapper = mount(Text, { props: { tag: 'span', field } });
    expect(wrapper.element.innerHTML).toContain('value');
  });

  it('should render value without tag', () => {
    const field = { value: 'value' };
    const wrapper = mount(Text, { props: { field } });
    expect(wrapper.element.innerHTML).toBe('value');
  });

  it('should render number value', () => {
    const field = { value: 1.23 };
    const wrapper = mount(Text, { props: { field } });
    expect(wrapper.element.innerHTML).toBe('1.23');
  });

  it('should render zero number value', () => {
    const field = { value: 0 };
    const wrapper = mount(Text, { props: { field } });
    expect(wrapper.element.innerHTML).toBe('0');
  });

  it('should render negative number value', () => {
    const field = { value: -1.23 };
    const wrapper = mount(Text, { props: { field } });
    expect(wrapper.element.innerHTML).toBe('-1.23');
  });

  it('should render value with just a value that contains line breaks', () => {
    const field = { value: 'xxx\n\naa\nbbb\ndd' };
    const wrapper = mount(Text, { props: { tag: 'span', field } });
    expect(wrapper.element.innerHTML).toContain('xxx<br><br>aa<br>bbb<br>dd');
  });

  it('should render value with just a value that contains only one line break', () => {
    const field = { value: '\n' };
    const wrapper = mount(Text, { props: { tag: 'span', field } });
    expect(wrapper.element.innerHTML).toContain('<br>');
  });

  it('should render embedded html as-is when encoding is disabled', () => {
    const field = {
      value: '<input type="text">some crazy stuff<script code="whaaaat">uh oh</script>',
    };
    const wrapper = mount(Text, { props: { field, encode: false } });
    expect(wrapper.element.querySelector('span')?.innerHTML).toContain(field.value);
  });

  it('should render tag with a tag provided', () => {
    const field = { value: 'value' };
    const wrapper = mount(Text, { props: { field, tag: 'h1' } });
    expect(wrapper.element.querySelector('h1')?.innerHTML).toContain('value');
  });

  it('should render other attributes with other props provided', () => {
    const field = { value: 'value' };
    const wrapper = mount(Text, { props: { field, tag: 'h1' } });
    expect(wrapper.element.querySelector('h1')?.innerHTML).toContain('value');
  });

  describe('edit mode', () => {
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

    const normalizeHtml = (html: string) =>
      html.replace(/ xmlns="[^"]*"/g, '').replace(/\n\s*/g, '');

    it('should render field metadata component when metadata property is present', () => {
      const field = { value: 'value', metadata: testMetadata };
      const wrapper = mount(Text, { props: { field } });

      expect(normalizeHtml(wrapper.html())).toBe(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<span suppresshydrationwarning="true">value</span>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    it('should render default empty field component when field value is empty in edit mode metadata', () => {
      const field = { value: '', metadata: testMetadata };
      const wrapper = mount(Text, { props: { field } });

      expect(normalizeHtml(wrapper.html())).toBe(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<span>[No text in field]</span>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    it('should render custom empty field component when provided, when field value is empty in edit mode metadata', () => {
      const field = { value: '', metadata: testMetadata };

      const EmptyFieldEditingComponent = defineComponent({
        render() {
          return h('span', { class: 'empty-field-value-placeholder' }, 'Custom Empty field value');
        },
      });

      const wrapper = mount(Text, {
        props: { field, emptyFieldEditingComponent: EmptyFieldEditingComponent },
      });

      expect(normalizeHtml(wrapper.html())).toBe(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<span class="empty-field-value-placeholder" tag="span">Custom Empty field value</span>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    it('should render nothing when field value is empty, when editing is explicitly disabled in edit mode metadata', () => {
      const field = { value: '', metadata: testMetadata };
      const wrapper = mount(Text, { props: { field, editable: false } });
      expect(stripComments(wrapper.html())).toBe('');
    });

    it('should apply suppresshydrationwarning attribute when in editing mode', () => {
      const field = { value: 'value', metadata: testMetadata };
      const wrapper = mount(Text, { props: { field, tag: 'span' } });
      expect(wrapper.element.querySelector('span')?.hasAttribute('suppresshydrationwarning')).toBe(
        true
      );
    });
  });
});
