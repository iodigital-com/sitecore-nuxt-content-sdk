import type { ComponentRendering } from '@sitecore-content-sdk/content/layout';

/**
 * Shape of the Form component rendering data.
 * @public
 */
export type FormProps = {
  rendering: ComponentRendering;
  params: {
    /**
     * The ID of the Sitecore Form to render.
     */
    FormId: string;
    /**
     * CSS class to apply to the form
     */
    styles?: string;
    /**
     * The unique identifier of the rendering.
     */
    RenderingIdentifier?: string;
  };
};
