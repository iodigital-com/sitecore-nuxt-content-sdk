import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { createEvent } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { createHealthcheckRoute } from './healthcheck-route';

const createMockEvent = () => {
  const req = new IncomingMessage(null as any);
  req.method = 'GET';
  const res = new ServerResponse(req);
  return createEvent(req, res);
};

const readBody = (event: ReturnType<typeof createMockEvent>): Promise<string> => {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];

    event.node.res.write = (chunk: any) => {
      chunks.push(Buffer.from(chunk));
      return true;
    };

    event.node.res.end = (chunk?: any) => {
      if (chunk) chunks.push(Buffer.from(chunk));
      resolve(Buffer.concat(chunks).toString());
      return event.node.res;
    };
  });
};

describe('createHealthcheckRoute', () => {
  it('should handle request', async () => {
    const event = createMockEvent();
    const bodyPromise = readBody(event);

    const { handle } = createHealthcheckRoute();
    await handle(event);
    const body = await bodyPromise;

    expect(event.node.res.statusCode).toBe(200);
    expect(body).toBe('Healthy');
  });
});
