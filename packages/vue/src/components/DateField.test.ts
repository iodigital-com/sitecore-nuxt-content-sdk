import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { EMPTY_DATE_FIELD_VALUE } from '@sitecore-content-sdk/content/layout';
import DateField from './DateField.vue';

const normalizeHtml = (html: string) =>
  html
    .replace(/\sxmlns="[^"]*"/g, '')
    .replace(/<!--.*?-->/g, '')
    .replace(/\n/g, '')
    .trim();

describe('<DateField />', () => {
  it('should return null if no value', () => {
    const wrapper = mount(DateField, {
      props: { field: {} },
    });

    expect(normalizeHtml(wrapper.html())).toBe('');
  });

  it('should render value', () => {
    const wrapper = mount(DateField, {
      props: { field: { value: '23-11-2001' } },
    });

    expect(normalizeHtml(wrapper.html())).toBe('23-11-2001');
  });

  it('should render value using render prop function', () => {
    const wrapper = mount(DateField, {
      props: {
        field: { value: '11-23-2001' },
        render: (date: Date | null) => (date ? date.toDateString() : ''),
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe('Fri Nov 23 2001');
  });

  it('should render value with provided tag', () => {
    const wrapper = mount(DateField, {
      props: {
        field: { value: '11-23-2001' },
        tag: 'h3',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe('<h3>11-23-2001</h3>');
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
      fieldType: 'date',
      rawValue: 'Test1',
    };

    const openTag = `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
      testMetadata
    )}</code>`;
    const closeTag = `<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>`;

    it('should render field metadata component when metadata property is present', () => {
      const wrapper = mount(DateField, {
        props: { field: { value: '23-11-2001', metadata: testMetadata } },
      });

      expect(normalizeHtml(wrapper.html())).toBe([openTag, '23-11-2001', closeTag].join(''));
    });

    describe('empty value', () => {
      describe('should render default component', () => {
        it('field value is empty string', () => {
          const wrapper = mount(DateField, {
            props: { field: { value: '', metadata: testMetadata } },
          });

          expect(normalizeHtml(wrapper.html())).toBe(
            [openTag, '<span>[No text in field]</span>', closeTag].join('')
          );
        });

        it('field value is default empty date value', () => {
          const wrapper = mount(DateField, {
            props: { field: { value: EMPTY_DATE_FIELD_VALUE, metadata: testMetadata } },
          });

          expect(normalizeHtml(wrapper.html())).toBe(
            [openTag, '<span>[No text in field]</span>', closeTag].join('')
          );
        });
      });

      describe('should render custom component', () => {
        const EmptyFieldEditingComponent = {
          template: '<span class="empty-field-value-placeholder">Custom Empty field value</span>',
        };

        it('field value is empty string', () => {
          const wrapper = mount(DateField, {
            props: {
              field: { value: '', metadata: testMetadata },
              emptyFieldEditingComponent: EmptyFieldEditingComponent,
            },
          });

          expect(normalizeHtml(wrapper.html())).toBe(
            [
              openTag,
              '<span class="empty-field-value-placeholder">Custom Empty field value</span>',
              closeTag,
            ].join('')
          );
        });

        it('field value is default empty date value', () => {
          const wrapper = mount(DateField, {
            props: {
              field: { value: EMPTY_DATE_FIELD_VALUE, metadata: testMetadata },
              emptyFieldEditingComponent: EmptyFieldEditingComponent,
            },
          });

          expect(normalizeHtml(wrapper.html())).toBe(
            [
              openTag,
              '<span class="empty-field-value-placeholder">Custom Empty field value</span>',
              closeTag,
            ].join('')
          );
        });
      });
    });

    it('should render nothing when field value is empty and editing is explicitly disabled', () => {
      const wrapper = mount(DateField, {
        props: {
          field: { value: '', metadata: testMetadata },
          editable: false,
        },
      });

      expect(normalizeHtml(wrapper.html())).toBe('');
    });
  });
});
