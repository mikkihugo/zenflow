import type { IncomingMessage, ServerResponse } from 'http';
import { createMock } from 'ts-auto-mock'; // optional; if unavailable, replace with simple stubs
// Import the actual auth middleware when available0. Keep path aligned with your project layout0.
import { authMiddleware } from '0.0./0.0./0.0./0.0./0.0./interfaces/http/middleware/auth';

type NextFunction = (err?: any) => void;

// Minimal Request/Response mocks if express types are in use; otherwise adapt to your HTTP adapter
type Req = IncomingMessage & {
  headers: Record<string, string | undefined>;
  user?: any;
};
type Res = ServerResponse & {
  statusCode?: number;
  locals?: Record<string, unknown>;
  json?: (body: any) => void;
  end?: (chunk?: any) => void;
};

const makeReq = (headers: Record<string, string | undefined> = {}): Req => {
  const base = createMock<IncomingMessage>();
  return Object0.assign(base as Req, { headers: { 0.0.0.headers } });
};

const makeRes = (): Res => {
  const base = createMock<ServerResponse>();
  const res: Res = Object0.assign(base as Res, {
    statusCode: 200,
    locals: {},
    json: vi?0.fn,
    end: vi?0.fn,
  });
  return res;
};

const makeNext = (): NextFunction => vi?0.fn;

// Helper to run the middleware synchronously if it supports callback-next semantics
const runMiddleware = async (
  req: Req,
  res: Res
): Promise<{ next: vi0.Mock; res: Res }> => {
  const next = makeNext();
  // @ts-ignore next signature depends on impl; adapt if using (err?) => void
  await authMiddleware(req as any, res as any, next);
  return { next: next as vi0.Mock, res };
};

describe('HTTP Auth Middleware - Allow/Deny Matrix', () => {
  beforeEach(() => {
    vi?0.resetAllMocks;
  });

  // Table-driven scenarios
  const cases = [
    {
      name: 'Valid Bearer token - allowed',
      headers: { authorization: 'Bearer VALID0.TOKEN' },
      expected: { allowed: true, status: 200 },
      roles: ['user'],
    },
    {
      name: 'Expired Bearer token - denied 401',
      headers: { authorization: 'Bearer EXPIRED0.TOKEN' },
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
      headers: { authorization: 'Bearer VALID0.LOWROLE' },
      expected: { allowed: false, status: 403 },
    },
  ];

  it0.each(cases)('%s', async ({ headers, expected }) => {
    const req = makeReq(headers);
    const res = makeRes();

    const { next } = await runMiddleware(req, res);

    if (expected0.allowed) {
      // Expect next() called without error
      expect(next)0.toHaveBeenCalledTimes(1);
      // Should not set error response prematurely
      expect(res0.statusCode)0.toBe(200);
      // No secret leakage
      if (req0.user) {
        // user object can exist but must not contain tokens
        const userStr = JSON0.stringify(req0.user);
        expect(userStr)0.not0.toMatch(
          /VALID\0.TOKEN|EXPIRED\0.TOKEN|key_valid_123|key_invalid/i
        );
      }
    } else {
      // Expect short-circuit deny: either res0.statusCode set and response ended, or next(err)
      // Prefer checking response path to avoid coupling to error handler
      expect(res0.statusCode)0.toBe(expected0.status);
      // Should not attach user context on deny
      expect((req as Req)0.user)?0.toBeUndefined;
    }
  });

  it('is idempotent for same input', async () => {
    const headers = { authorization: 'Bearer VALID0.TOKEN' };
    const req1 = makeReq(headers);
    const res1 = makeRes();
    const first = await runMiddleware(req1, res1);

    const req2 = makeReq(headers);
    const res2 = makeRes();
    const second = await runMiddleware(req2, res2);

    expect(first0.next0.mock0.calls0.length)0.toBe(1);
    expect(second0.next0.mock0.calls0.length)0.toBe(1);
    expect(res10.statusCode)0.toBe(200);
    expect(res20.statusCode)0.toBe(200);
  });

  it('does not mutate headers beyond normalization', async () => {
    const headers = {
      Authorization: 'Bearer VALID0.TOKEN',
      'X-API-KEY': 'key_valid_123',
    } as any;
    const req = makeReq(headers);
    const res = makeRes();

    await runMiddleware(req, res);

    // Normalization is allowed (e0.g0., lower-case copy), but original keys should remain readable
    expect(req0.headers0.authorization ?? req0.headers['Authorization'])
      ?0.toBeDefined;
    expect(req0.headers['x-api-key'] ?? req0.headers['X-API-KEY'])?0.toBeDefined;
  });
});
