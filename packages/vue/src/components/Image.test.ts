import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Image from './Image.vue';

describe('<Image />', () => {
  describe('with direct image object, no value', () => {
    const field = {
      src: '/assets/img/test0.png',
      width: '8',
      height: '10',
    };

    const wrapper = mount(Image, {
      props: { field },
      attrs: {
        id: 'some-id',
        style: 'width: 100%;',
        class: 'the-dude-abides',
      },
    });

    it('should render <img /> with url', () => {
      const html = wrapper.html();
      expect(html).toContain('<img');
      expect(html).toContain('src="/assets/img/test0.png"');
      expect(html).toContain('width="8"');
      expect(html).toContain('height="10"');
    });

    it('should render <img /> with non-media props', () => {
      expect(wrapper.html()).toContain('id="some-id"');
    });

    it('should render <img /> with style and class props', () => {
      expect(wrapper.html()).toContain('style="width: 100%;"');
      expect(wrapper.html()).toContain('class="the-dude-abides"');
    });
  });

  describe('with responsive image object', () => {
    const wrapper = mount(Image, {
      props: {
        field: { src: '/assets/img/test0.png' },
        srcSet: [{ mw: 100 }, { mw: 300 }],
      },
      attrs: {
        sizes: '(min-width: 960px) 300px, 100px',
        id: 'some-id',
        class: 'the-dude-abides',
      },
    });

    it('should render <img /> with needed img tags', () => {
      const html = wrapper.html();
      expect(html).toContain('src="/assets/img/test0.png"');
      expect(html).toContain(
        'srcset="/assets/img/test0.png?mw=100 100w, /assets/img/test0.png?mw=300 300w"'
      );
      expect(html).toContain('sizes="(min-width: 960px) 300px, 100px"');
    });

    it('should render <img /> with non-media props', () => {
      expect(wrapper.html()).toContain('id="some-id"');
    });

    it('should render <img /> with class prop', () => {
      expect(wrapper.html()).toContain('class="the-dude-abides"');
    });
  });

  describe('with "value" property value', () => {
    const field = { value: { src: '/assets/img/test0.png', alt: 'my image' } };

    const wrapper = mount(Image, {
      props: { field },
      attrs: {
        id: 'some-id',
        style: 'width: 100%;',
        class: 'the-dude-abides',
      },
    });

    it('should render <img /> with "value" properties', () => {
      const html = wrapper.html();
      expect(html).toContain('src="/assets/img/test0.png"');
      expect(html).toContain('alt="my image"');
    });

    it('should render <img /> with non-media props', () => {
      expect(wrapper.html()).toContain('id="some-id"');
    });

    it('should render <img /> with style and class props', () => {
      expect(wrapper.html()).toContain('style="width: 100%;"');
      expect(wrapper.html()).toContain('class="the-dude-abides"');
    });
  });

  describe('with "mediaUrlPrefix" property', () => {
    it('should transform url with "value" property value', async () => {
      const wrapper = mount(Image, {
        props: {
          field: { value: { src: '/~assets/img/test0.png', alt: 'my image' } },
          imageParams: { foo: 'bar' },
          mediaUrlPrefix: /\/([-~]{1})assets\//i,
        },
      });

      expect(wrapper.html()).toContain('src="/~/jssmedia/img/test0.png?foo=bar"');

      await wrapper.setProps({
        field: { value: { src: '/-assets/img/test0.png', alt: 'my image' } },
      });

      expect(wrapper.html()).toContain('src="/-/jssmedia/img/test0.png?foo=bar"');
    });

    it('should transform url with direct image object, no value', async () => {
      const wrapper = mount(Image, {
        props: {
          field: { src: '/~assets/img/test0.png', width: 8, height: 10 },
          imageParams: { foo: 'bar' },
          mediaUrlPrefix: /\/([-~]{1})assets\//i,
        },
      });

      expect(wrapper.html()).toContain('src="/~/jssmedia/img/test0.png?foo=bar"');

      await wrapper.setProps({
        field: { src: '/-assets/img/test0.png', width: 8, height: 10 },
      });

      expect(wrapper.html()).toContain('src="/-/jssmedia/img/test0.png?foo=bar"');
    });

    it('should transform url with responsive image object', async () => {
      const wrapper = mount(Image, {
        props: {
          field: { src: '/~assets/img/test0.png' },
          srcSet: [{ mw: 100 }, { mw: 300 }],
          mediaUrlPrefix: /\/([-~]{1})assets\//i,
        },
      });

      expect(wrapper.html()).toContain('src="/~assets/img/test0.png"');
      expect(wrapper.html()).toContain(
        'srcset="/~/jssmedia/img/test0.png?mw=100 100w, /~/jssmedia/img/test0.png?mw=300 300w"'
      );

      await wrapper.setProps({
        field: { src: '/-assets/img/test0.png', width: 8, height: 10 },
        imageParams: { foo: 'bar' },
      });

      expect(wrapper.html()).toContain('src="/-/jssmedia/img/test0.png?foo=bar"');
      // HTML encodes & as &amp; in attributes
      expect(wrapper.html()).toContain('/-/jssmedia/img/test0.png?foo=bar');
      expect(wrapper.html()).toContain('mw=100 100w');
      expect(wrapper.html()).toContain('mw=300 300w');
    });
  });

  it('should render no <img /> when field prop is empty', () => {
    const wrapper = mount(Image, { props: { field: '' as any } });
    expect(wrapper.html()).not.toContain('<img');
  });

  it('should render when field prop is used', () => {
    const wrapper = mount(Image, {
      props: { field: { src: '/assets/img/test0.png', width: 8, height: 10 } },
    });
    expect(wrapper.html()).toContain('<img');
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
      fieldType: 'image',
      rawValue: 'Test1',
    };

    it('should render field metadata component when metadata property is present', () => {
      const wrapper = mount(Image, {
        props: {
          field: {
            src: '/assets/img/test0.png',
            width: 8,
            height: 10,
            metadata: testMetadata,
          },
        },
      });

      const html = wrapper.html();
      expect(html).toContain('type="text/sitecore"');
      expect(html).toContain('chrometype="field"');
      expect(html).toContain('class="scpm"');
      expect(html).toContain('kind="open"');
      expect(html).toContain('kind="close"');
      expect(html).toContain(JSON.stringify(testMetadata));
      expect(html).toContain('width="8"');
      expect(html).toContain('height="10"');
      expect(html).toContain('src="/assets/img/test0.png"');
    });

    it('should render default empty field component when field value src is not present', () => {
      const wrapper = mount(Image, {
        props: {
          field: { value: { src: undefined }, metadata: testMetadata },
        },
      });

      const html = wrapper.html();
      expect(html).toContain('kind="open"');
      expect(html).toContain('kind="close"');
      expect(html).toContain('scEmptyImage');
    });

    it('should render default empty field component when field src is not present', () => {
      const wrapper = mount(Image, {
        props: {
          field: { src: undefined, metadata: testMetadata },
        },
        attrs: { class: 'custom-class' },
      });

      const html = wrapper.html();
      expect(html).toContain('kind="open"');
      expect(html).toContain('kind="close"');
      expect(html).toContain('custom-class');
      expect(html).toContain('scEmptyImage');
    });

    it('should render custom empty field component when provided and field value src is not present', () => {
      const EmptyComponent = {
        template: '<span class="empty-field-value-placeholder">Custom Empty field value</span>',
      };

      const wrapper = mount(Image, {
        props: {
          field: { value: { src: undefined }, metadata: testMetadata },
          emptyFieldEditingComponent: EmptyComponent,
        },
      });

      const html = wrapper.html();
      expect(html).toContain('kind="open"');
      expect(html).toContain('kind="close"');
      expect(html).toContain('class="empty-field-value-placeholder"');
      expect(html).toContain('Custom Empty field value');
    });

    it('should render custom empty field component when provided and field src is not present', () => {
      const EmptyComponent = {
        template: '<span class="empty-field-value-placeholder">Custom Empty field value</span>',
      };

      const wrapper = mount(Image, {
        props: {
          field: { src: undefined, metadata: testMetadata },
          emptyFieldEditingComponent: EmptyComponent,
        },
      });

      const html = wrapper.html();
      expect(html).toContain('kind="open"');
      expect(html).toContain('kind="close"');
      expect(html).toContain('class="empty-field-value-placeholder"');
      expect(html).toContain('Custom Empty field value');
    });

    it('should render nothing when field value src is not present and editing is explicitly disabled', () => {
      const wrapper = mount(Image, {
        props: {
          field: { value: { src: undefined }, metadata: testMetadata },
          editable: false,
        },
      });

      expect(wrapper.html()).not.toContain('<img');
      expect(wrapper.html()).not.toContain('scpm');
    });

    it('should render nothing when field src is not present and editing is explicitly disabled', () => {
      const wrapper = mount(Image, {
        props: {
          field: { src: undefined, metadata: testMetadata },
          editable: false,
        },
      });

      expect(wrapper.html()).not.toContain('<img');
      expect(wrapper.html()).not.toContain('scpm');
    });
  });
});
