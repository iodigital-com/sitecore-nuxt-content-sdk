import { ComponentFields, getFieldValue } from '@sitecore-content-sdk/content/layout';

/**
 * Converts datasource item field values into component props.
 * Used in FEaaS and BYOC implementations to pass Sitecore field data to external components.
 * @param {ComponentFields} fields field collection from Sitecore
 * @returns JSON object that can be used as props
 * @public
 */
export const getDataFromFields = (fields: ComponentFields): { [key: string]: unknown } => {
  let data: { [key: string]: unknown } = {};
  data = Object.entries(fields).reduce((acc, [key]) => {
    acc[key] = getFieldValue(fields, key);
    return acc;
  }, data);
  return data;
};
