import { expect } from 'vitest';
import { render } from '@testing-library/vue';
import File from './File.vue';

describe('<File />', () => {
  it('should render nothing with missing field', () => {
    const { container } = render(File, { props: { field: null as any } });
    expect(container.children).to.have.length(0);
  });

  it('should render nothing with missing value', () => {
    const { container } = render(File, { props: { field: { editable: 'lorem' } } });
    expect(container.children).to.have.length(0);
  });

  it('should render with src directly on provided field', () => {
    const field = { src: '/lorem', title: 'ipsum' };
    const { container } = render(File, { props: { field } });
    const anchor = container.querySelector('a');
    expect(anchor?.outerHTML).to.contain(field.src);
    expect(anchor?.outerHTML).to.contain(field.title);
  });

  it('should render display name if no title', () => {
    const field = { value: { src: '/lorem', displayName: 'ipsum' } };
    const { container } = render(File, { props: { field } });
    const anchor = container.querySelector('a');
    expect(anchor?.outerHTML).to.contain(field.value.displayName);
  });

  it('should render other attributes with other props provided', () => {
    const field = { value: { src: '/lorem', title: 'ipsum' } };
    const { container } = render(File, {
      props: { field },
      attrs: { id: 'my-file', class: 'my-css' },
    });
    const anchor = container.querySelector('a');
    expect(anchor?.outerHTML).to.contain('id="my-file"');
    expect(anchor?.outerHTML).to.contain('class="my-css"');
  });
});
