import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PlaceholderMetadata from './PlaceholderMetadata.vue';

const normalizeHtml = (html: string) => html.replace(/ xmlns="[^"]*"/g, '').replace(/\n\s*/g, '');

describe('PlaceholderMetadata', () => {
  it('renders rendering code blocks for metadataType rendering', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: { uid: '123', componentName: 'RichText' },
      },
      slots: {
        default: '<div class="richtext-class"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123"></code>',
        '<div class="richtext-class"></div>',
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  it('renders placeholder code blocks when metadataType is placeholder', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: '123',
          componentName: 'RichText',
          placeholders: { main: [] },
        },
        placeholderName: 'main',
      },
      slots: {
        default: '<div class="richtext-mock"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_123"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  it('renders placeholder code blocks with DEFAULT_PLACEHOLDER_UID value when uid is not present', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: {
          componentName: 'RichText',
          placeholders: { main: [] },
        },
        placeholderName: 'main',
      },
      slots: {
        default: '<div class="richtext-mock"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_00000000-0000-0000-0000-000000000000"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  it('renders placeholder blocks with rendering uid when metadataType is dynamic placeholder', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: 'renderinguid',
          componentName: 'RichText',
          placeholders: { 'main-{*}': [] },
        },
        placeholderName: 'main-1',
      },
      slots: {
        default: '<div class="richtext-mock"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main-{*}_renderinguid"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  it('renders placeholder blocks with DEFAULT_PLACEHOLDER_UID when dynamic placeholder and uid is not present', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: {
          componentName: 'RichText',
          placeholders: { 'main-{*}': [] },
        },
        placeholderName: 'main-1',
      },
      slots: {
        default: '<div class="richtext-mock"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main-{*}_00000000-0000-0000-0000-000000000000"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  it('renders placeholder code blocks for double digit dynamic placeholder', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: 'renderinguid',
          componentName: 'RichText',
          placeholders: { 'main-1-{*}': [] },
        },
        placeholderName: 'main-1-1',
      },
      slots: {
        default: '<div class="richtext-mock"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main-1-{*}_renderinguid"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  it('adds data-csdk-component-runtime attribute to rendering chrome when componentRuntime is server', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: { uid: '123', componentName: 'RichText' },
        componentRuntime: 'server',
      },
      slots: {
        default: '<div class="richtext-class"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123" data-csdk-component-runtime="server"></code>',
        '<div class="richtext-class"></div>',
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  it('adds data-csdk-component-runtime attribute to rendering chrome when componentRuntime is client', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: { uid: '123', componentName: 'RichText' },
        componentRuntime: 'client',
      },
      slots: {
        default: '<div class="richtext-class"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123" data-csdk-component-runtime="client"></code>',
        '<div class="richtext-class"></div>',
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  it('does not add data-csdk-component-runtime to placeholder chrome even when componentRuntime is provided', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: '123',
          componentName: 'RichText',
          placeholders: { main: [] },
        },
        placeholderName: 'main',
        componentRuntime: 'server',
      },
      slots: {
        default: '<div class="richtext-mock"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_123"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  it('does not add data-csdk-component-runtime when componentRuntime is not provided', () => {
    const wrapper = mount(PlaceholderMetadata, {
      props: {
        rendering: { uid: '123', componentName: 'RichText' },
      },
      slots: {
        default: '<div class="richtext-class"></div>',
      },
    });

    expect(normalizeHtml(wrapper.html())).toBe(
      [
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123"></code>',
        '<div class="richtext-class"></div>',
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
      ].join('')
    );
  });
});
