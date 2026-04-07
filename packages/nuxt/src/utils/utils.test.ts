import { describe, it, expect, afterAll, vi } from 'vitest';
import { getEditingSecret } from './utils';

describe('utils', () => {
  describe('getEditingSecret', () => {
    afterAll(() => {
      delete process.env.SITECORE_EDITING_SECRET;
    });

    it('should throw if env variable missing', () => {
      expect(() => getEditingSecret()).toThrow();
    });

    it('should throw if env variable is empty', () => {
      process.env.SITECORE_EDITING_SECRET = '';
      expect(() => getEditingSecret()).toThrow();
    });

    it('should return env variable', () => {
      const secret = '1234abcd';
      process.env.SITECORE_EDITING_SECRET = secret;
      expect(getEditingSecret()).toBe(secret);
    });
  });
});
