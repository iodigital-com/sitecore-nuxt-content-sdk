import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MissingComponent from './MissingComponent.vue';

describe('MissingComponent', () => {
  it('should accept and display custom error', () => {
    const wrapper = mount(MissingComponent, {
      props: {
        rendering: { componentName: 'test' },
        errorOverride: 'Oops, I errored again',
      },
    });

    expect(wrapper.element.querySelector('p')?.textContent).toContain('Oops, I errored again');
  });
});
