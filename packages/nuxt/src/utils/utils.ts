import { createError } from 'h3';

/**
 * Gets the editing secret from environment variables.
 * @throws {H3Error} When the editing secret is missing or invalid.
 * @returns {string} The editing secret.
 */
export const getEditingSecret = (): string => {
  const secret = process.env.SITECORE_EDITING_SECRET;

  if (!secret || secret.length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The SITECORE_EDITING_SECRET environment variable is missing or invalid.',
    });
  }

  return secret;
};
