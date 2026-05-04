import { describe, it, expect } from 'vitest';
import { getDataFromFields } from './utils';
import type { ComponentFields } from '@sitecore-content-sdk/content/layout';

describe('vue utils', () => {
  describe('getDataFromFields', () => {
    it('should parse fields into JSON', () => {
      const fields: ComponentFields = {
        text: {
          value: 'we count to',
        },
        number: {
          value: 10,
        },
        message: {
          value: 'well done counting',
        },
      };

      const expectedResult = {
        text: 'we count to',
        number: 10,
        message: 'well done counting',
      };

      expect(getDataFromFields(fields)).toEqual(expectedResult);
    });
  });
});
