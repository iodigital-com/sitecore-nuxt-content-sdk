import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HiddenRendering from './HiddenRendering.vue';

describe('HiddenRendering', () => {
  it('should render', () => {
    const wrapper = mount(HiddenRendering);
    expect(wrapper.text()).toBe('The component is hidden');

    const el = wrapper.element as HTMLElement;
    expect(el.style.display).toBe('flex');
    expect(el.style.padding).toBe('30px');
    expect(el.style.color).toBe('rgb(170, 170, 170)');
  });
});
