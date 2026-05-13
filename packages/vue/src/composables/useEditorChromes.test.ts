/* eslint-disable react-hooks/rules-of-hooks */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { PagesEditor } from '@sitecore-content-sdk/content/editing';
import { useEditorChromes } from './useEditorChromes';

vi.mock('@sitecore-content-sdk/content/editing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/content/editing')>();
  return { ...actual };
});

describe('useEditorChromes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should update chromes on update', async () => {
    const isActiveSpy = vi.spyOn(PagesEditor, 'isActive');

    const stringProp = ref('123');

    const TestComponent = defineComponent({
      setup() {
        useEditorChromes();
        return () => h('div', stringProp.value);
      },
    });

    mount(TestComponent);

    // trigger re-render
    stringProp.value = '456';
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(isActiveSpy).toHaveBeenCalled();
  });
});
