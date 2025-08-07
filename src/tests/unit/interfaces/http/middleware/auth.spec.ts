/**
 * HTTP Auth middleware unit tests (allow/deny matrix)
 * Runner: Jest + ts-jest
 *
 * Scope:
 * - Deterministic allow/deny matrix for Authorization: Bearer / API key
 * - Missing/expired tokens, malformed headers, role-based access decisions
 * - Invariants: no secret leakage, idempotent outcomes, normalized headers only
 *
 * TODO Acceptance Criteria:
 * 1) Table-driven cases produce expected 200/401/403 outcomes from the middleware decision contract.
 * 2) Deny paths do not add user context to req/res; logs redact tokens/keys when present.
 * 3) Idempotent for same input: calling middleware twice yields same decision without side effects.
 * 4) Does not mutate req.headers beyond normalization (e.g., lower-casing, trimming).
 * 5) Time to parse typical headers stays within target budget (baseline micro-benchmark in unit scope).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { NextFunction } from 'express'; // adjust if using another framework adapter
import { createMock } from 'ts-auto-mock'; // optional; if unavailable, replace with simple stubs
// Import the actual auth middleware when available. Keep path aligned with your project layout.
import { authMiddleware } from '../../../../../interfaces/api/http/middleware/auth';

// Minimal Request/Response mocks if express types are in use; otherwise adapt to your HTTP adapter
type Req = IncomingMessage & {
  headers: Record<string, string | undefined>;
  user?: unknown;
};
type Res = ServerResponse & {
  statusCode?: number;
  locals?: Record<string, unknown>;
  json?: (body: unknown) => void;
  end?: (chunk?: any) => void;
};

const makeReq = (headers: Record<string, string | undefined> = {}): Req => {
  const base = createMock<IncomingMessage>();
  return Object.assign(base as Req, { headers: { ...headers } });
};

const makeRes = (): Res => {
  const base = createMock<ServerResponse>();
  const res: Res = Object.assign(base as Res, {
    statusCode: 200,
    locals: {},
    json: jest.fn(),
    end: jest.fn(),
  });
  return res;
};

const makeNext = (): NextFunction => jest.fn();

// Helper to run the middleware synchronously if it supports callback-next semantics
const runMiddleware = async (req: Req, res: Res): Promise<{ next: jest.Mock; res: Res }> => {
  const next = makeNext();
  // @ts-ignore next signature depends on impl; adapt if using (err?) => void
  await authMiddleware(req as any, res as any, next);
  return { next: next as jest.Mock, res };
};

describe('HTTP Auth Middleware - Allow/Deny Matrix', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // Table-driven scenarios
  const cases = [
    {
      name: 'Valid Bearer token - allowed',
      headers: { authorization: 'Bearer VALID.TOKEN' },
      expected: { allowed: true, status: 200 },
      roles: ['user'],
    },
    {
      name: 'Expired Bearer token - denied 401',
      headers: { authorization: 'Bearer EXPIRED.TOKEN' },
      expected: { allowed: false, status: 401 },
    },
    {
      name: 'Malformed Bearer header - denied 400/401',
      headers: { authorization: 'Bearer' },
      expected: { allowed: false, status: 401 },
    },
    {
      name: 'API Key valid - allowed',
      headers: { 'x-api-key': 'key_valid_123' },
      expected: { allowed: true, status: 200 },
      roles: ['service'],
    },
    {
      name: 'API Key missing - denied 401',
      headers: {},
      expected: { allowed: false, status: 401 },
    },
    {
      name: 'API Key invalid - denied 403',
      headers: { 'x-api-key': 'key_invalid' },
      expected: { allowed: false, status: 403 },
    },
    {
      name: 'Bearer token valid but insufficient role - denied 403',
      headers: { authorization: 'Bearer VALID.LOWROLE' },
      expected: { allowed: false, status: 403 },
    },
  ];

  it.each(cases)('%s', async ({ headers, expected }) => {
    const req = makeReq(headers);
    const res = makeRes();

    const { next } = await runMiddleware(req, res);

    if (expected.allowed) {
      // Expect next() called without error
      expect(next).toHaveBeenCalledTimes(1);
      // Should not set error response prematurely
      expect(res.statusCode).toBe(200);
      // No secret leakage
      if (req.user) {
        // user object can exist but must not contain tokens
        const userStr = JSON.stringify(req.user);
        expect(userStr).not.toMatch(/VALID\.TOKEN|EXPIRED\.TOKEN|key_valid_123|key_invalid/i);
      }
    } else {
      // Expect short-circuit deny: either res.statusCode set and response ended, or next(err)
      // Prefer checking response path to avoid coupling to error handler
      expect(res.statusCode).toBe(expected.status);
      // Should not attach user context on deny
      expect((req as Req).user).toBeUndefined();
    }
  });

  it('is idempotent for same input', async () => {
    const headers = { authorization: 'Bearer VALID.TOKEN' };
    const req1 = makeReq(headers);
    const res1 = makeRes();
    const first = await runMiddleware(req1, res1);

    const req2 = makeReq(headers);
    const res2 = makeRes();
    const second = await runMiddleware(req2, res2);

    expect(first.next.mock.calls.length).toBe(1);
    expect(second.next.mock.calls.length).toBe(1);
    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
  });

  it('does not mutate headers beyond normalization', async () => {
    const headers = { Authorization: 'Bearer VALID.TOKEN', 'X-API-KEY': 'key_valid_123' } as any;
    const req = makeReq(headers);
    const res = makeRes();

    await runMiddleware(req, res);

    // Normalization is allowed (e.g., lower-case copy), but original keys should remain readable
    expect(req.headers.authorization ?? req.headers.Authorization).toBeDefined();
    expect(req.headers['x-api-key'] ?? req.headers['X-API-KEY']).toBeDefined();
  });
});
