import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Link from './Link.vue';

const normalizeHtml = (html: string) =>
  html
    .replace(/\sxmlns="[^"]*"/g, '')
    .replace(/<!--.*?-->/g, '')
    .replace(/\n\s*/g, '')
    .trim();

describe('<Link />', () => {
  it('should render nothing with missing field', () => {
    const wrapper = mount(Link, { props: { field: null as any } });
    expect(normalizeHtml(wrapper.html())).toBe('');
  });

  it('should render nothing with missing value', () => {
    const wrapper = mount(Link, { props: { field: {} as any } });
    expect(normalizeHtml(wrapper.html())).toBe('');
  });

  it('should render value with editing explicitly disabled', () => {
    const wrapper = mount(Link, {
      props: {
        field: { value: { href: '/lorem', text: 'ipsum' } },
        editable: false,
      },
    });
    expect(wrapper.html()).toContain('/lorem');
    expect(wrapper.html()).toContain('ipsum');
  });

  it('should render with href directly on provided field', () => {
    const wrapper = mount(Link, {
      props: { field: { href: '/lorem', text: 'ipsum' } },
    });
    expect(wrapper.html()).toContain('/lorem');
    expect(wrapper.html()).toContain('ipsum');
  });

  it('should not add extra hash when linktype is anchor', () => {
    const wrapper = mount(Link, {
      props: {
        field: {
          linktype: 'anchor',
          href: '#anchor',
          text: 'anchor link',
          anchor: 'anchor',
        },
      },
    });
    expect(wrapper.html()).toContain('href="#anchor"');
    expect(wrapper.html()).toContain('anchor link');
  });

  it('should render all value attributes', () => {
    const wrapper = mount(Link, {
      props: {
        field: {
          value: {
            href: '/lorem',
            anchor: 'foo',
            text: 'ipsum',
            class: 'my-link',
            title: 'My Link',
            target: '_blank',
            querystring: 'foo=bar',
          },
        },
      },
    });
    expect(wrapper.html()).toContain('href="/lorem?foo=bar#foo"');
    expect(wrapper.html()).toContain('class="my-link"');
    expect(wrapper.html()).toContain('title="My Link"');
    expect(wrapper.html()).toContain('target="_blank"');
  });

  it('should render other attributes with other props provided', () => {
    const wrapper = mount(Link, {
      props: { field: { value: { href: '/lorem', text: 'ipsum' } } },
      attrs: { id: 'my-link', accesskey: 'a' },
    });
    expect(wrapper.html()).toContain('id="my-link"');
    expect(wrapper.html()).toContain('accesskey="a"');
  });

  it('should add rel noopener noreferrer when target is _blank', () => {
    const wrapper = mount(Link, {
      props: {
        field: { value: { href: '/lorem', target: '_blank' } },
      },
    });
    expect(wrapper.html()).toContain('rel="noopener noreferrer"');
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

    const openTag = `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
      testMetadata
    )}</code>`;
    const closeTag = `<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>`;

    it('should render field metadata component when metadata property is present', () => {
      const wrapper = mount(Link, {
        props: {
          field: { href: '/lorem', text: 'ipsum', metadata: testMetadata },
        },
      });
      expect(normalizeHtml(wrapper.html())).toBe(
        [openTag, '<a href="/lorem">ipsum</a>', closeTag].join('')
      );
    });

    it('should render default empty field component when field value is not present', () => {
      const wrapper = mount(Link, {
        props: { field: { value: { href: undefined }, metadata: testMetadata } },
      });
      expect(normalizeHtml(wrapper.html())).toBe(
        [openTag, '<span>[No text in field]</span>', closeTag].join('')
      );
    });

    it('should render default empty field component when field value href is not present', () => {
      const wrapper = mount(Link, {
        props: { field: { href: undefined, metadata: testMetadata } },
      });
      expect(normalizeHtml(wrapper.html())).toBe(
        [openTag, '<span>[No text in field]</span>', closeTag].join('')
      );
    });

    it('should render custom empty field component when provided and field value is not present', () => {
      const EmptyComponent = {
        template: '<span class="empty-field-value-placeholder">Custom Empty field value</span>',
      };
      const wrapper = mount(Link, {
        props: {
          field: { value: { href: undefined }, metadata: testMetadata },
          emptyFieldEditingComponent: EmptyComponent,
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

    it('should render custom empty field component when provided and field value href is not present', () => {
      const EmptyComponent = {
        template: '<span class="empty-field-value-placeholder">Custom Empty field value</span>',
      };
      const wrapper = mount(Link, {
        props: {
          field: { href: undefined, metadata: testMetadata },
          emptyFieldEditingComponent: EmptyComponent,
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

    it('should render nothing when field value is not present and editing is explicitly disabled', () => {
      const wrapper = mount(Link, {
        props: {
          field: { value: undefined, metadata: testMetadata },
          editable: false,
        },
      });
      expect(normalizeHtml(wrapper.html())).toBe('');
    });

    it('should render nothing when field value href is empty and editing is explicitly disabled', () => {
      const wrapper = mount(Link, {
        props: {
          field: { value: { href: undefined }, metadata: testMetadata },
          editable: false,
        },
      });
      expect(normalizeHtml(wrapper.html())).toBe('');
    });
  });
});
