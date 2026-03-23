import { H3Event, setResponseStatus, send } from 'h3';

/**
 * Creates a route handler for the healthcheck endpoint.
 * Returns a 200 "Healthy" response so monitoring tools can verify the application is reachable.
 * @returns The route handler object with handle method.
 * @example
 * // server/routes/healthcheck.ts
 * import { createHealthcheckRoute } from '@sitecore-content-sdk/nuxt/routes';
 *
 * const { handle } = createHealthcheckRoute();
 *
 * export default defineEventHandler(handle);
 * @public
 */
export const createHealthcheckRoute = () => {
  /**
   * Handles an incoming healthcheck request.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  const handle = async (event: H3Event): Promise<void> => {
    setResponseStatus(event, 200);
    await send(event, 'Healthy');
  };

  return { handle };
};
