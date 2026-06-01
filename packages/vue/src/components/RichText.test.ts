import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import { default as RichText } from './RichText.vue';
import type { RichTextField } from './RichText';

const stripComments = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');
const normalizeHtml = (html: string) => html.replace(/ xmlns="[^"]*"/g, '').replace(/\n\s*/g, '');

describe('<RichText />', () => {
  it('should render nothing with missing field', () => {
    const field = null as unknown as RichTextField;
    const wrapper = mount(RichText, { props: { field } });
    expect(wrapper.findAll('div')).toHaveLength(0);
  });

  it('should render nothing with empty value', () => {
    const field = { value: '' };
    const wrapper = mount(RichText, { props: { field } });
    expect(wrapper.findAll('div')).toHaveLength(0);
  });

  it('should render nothing with missing value', () => {
    const field = {};
    const wrapper = mount(RichText, { props: { field } });
    expect(wrapper.findAll('div')).toHaveLength(0);
  });

  it('should render value with editing explicitly disabled', () => {
    const field = { value: 'value' };
    const wrapper = mount(RichText, { props: { field, editable: false } });
    expect(wrapper.element.querySelectorAll('div')).toHaveLength(1);
    expect(wrapper.element.querySelector('div')?.innerHTML).toContain('value');
  });

  it('should render value with just a value', () => {
    const field = { value: 'value' };
    const wrapper = mount(RichText, { props: { field } });
    expect(wrapper.element.querySelectorAll('div')).toHaveLength(1);
    expect(wrapper.element.querySelector('div')?.innerHTML).toContain('value');
  });

  it('should render embedded html as-is', () => {
    const field = {
      value: '<input type="text">some crazy stuff<script code="whaaaat">uh oh</script>',
    };
    const wrapper = mount(RichText, { props: { field } });
    expect(wrapper.element.querySelectorAll('div')).toHaveLength(1);
    expect(wrapper.element.querySelector('div')?.innerHTML).toContain(field.value);
  });

  it('should render tag with a tag provided', () => {
    const field = { value: 'value' };
    const wrapper = mount(RichText, { props: { field, tag: 'p' } });
    expect(wrapper.element.querySelectorAll('p')).toHaveLength(1);
    expect(wrapper.element.querySelector('p')?.innerHTML).toContain('value');
  });

  it('should render other attributes with other props provided', () => {
    const field = { value: 'value' };
    const wrapper = mount(RichText, { props: { field, tag: 'h1' } });
    expect(normalizeHtml(wrapper.html())).toContain('<h1>value</h1>');
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

    it('should render field metadata component when metadata property is present', () => {
      const field = { value: 'value', metadata: testMetadata };
      const wrapper = mount(RichText, { props: { field } });

      expect(normalizeHtml(wrapper.html())).toBe(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<div suppress-hydration-warning="true">value</div>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    it('should render default empty field component when field value is empty', () => {
      const field = { value: '', metadata: testMetadata };
      const wrapper = mount(RichText, { props: { field } });

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

    it('should render custom empty field component when provided, when field value is empty', () => {
      const field = { value: '', metadata: testMetadata };

      const EmptyFieldEditingComponent = defineComponent({
        render() {
          return h('span', { class: 'empty-field-value-placeholder' }, 'Custom Empty field value');
        },
      });

      const wrapper = mount(RichText, {
        props: { field, emptyFieldEditingComponent: EmptyFieldEditingComponent },
      });

      expect(normalizeHtml(wrapper.html())).toBe(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<span class="empty-field-value-placeholder">Custom Empty field value</span>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    it('should render nothing when field value is empty, when editing is explicitly disabled', () => {
      const field = { value: '', metadata: testMetadata };
      const wrapper = mount(RichText, { props: { field, editable: false } });
      expect(stripComments(wrapper.html())).toBe('');
    });

    it('should apply suppress-hydration-warning attribute when in editing mode', () => {
      const field = { value: 'value', metadata: testMetadata };
      const wrapper = mount(RichText, { props: { field } });
      expect(wrapper.html()).toContain('suppress-hydration-warning="true"');
    });
  });
});
