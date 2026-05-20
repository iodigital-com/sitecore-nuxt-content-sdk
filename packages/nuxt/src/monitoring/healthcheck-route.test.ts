import { describe, it, expect } from 'vitest';
import { mockEvent } from 'h3';
import { createHealthcheckRoute } from './healthcheck-route';

describe('createHealthcheckRoute', () => {
  it('should handle request', async () => {
    const event = mockEvent('http://localhost/', { method: 'GET' });

    const { handle } = createHealthcheckRoute();
    const body = await handle(event);

    expect(event.res.status ?? 200).toBe(200);
    expect(body).toBe('Healthy');
  });
});
