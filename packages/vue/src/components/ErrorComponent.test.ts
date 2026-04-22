import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ErrorComponent from './ErrorComponent.vue';

describe('<ErrorComponent />', () => {
  it('should render message prop with correct CSS class', () => {
    const wrapper = mount(ErrorComponent, {
      props: { message: 'Test error message' },
    });

    expect(wrapper.html()).toContain('sc-content-sdk-placeholder-error');
    expect(wrapper.html()).toContain('Test error message');
  });

  it('should render slot content when no message prop is provided', () => {
    const wrapper = mount(ErrorComponent, {
      slots: { default: '<span>Child error content</span>' },
    });

    expect(wrapper.html()).toContain('sc-content-sdk-placeholder-error');
    expect(wrapper.html()).toContain('Child error content');
  });
});
