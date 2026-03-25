import { signToken } from '../utils/auth.util';
import jwt from 'jsonwebtoken';

describe('signToken', () => {
  const SECRET = 'test-secret';

  it('should return a valid JWT string', () => {
    const payload = { userId: '123' };
    const token = signToken(payload, SECRET);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('should include the expected userId in the payload', () => {
    const payload = { userId: '123', email: 'test@example.com' };
    const token = signToken(payload, SECRET);
    const decoded = jwt.verify(token, SECRET) as any;
    expect(decoded.userId).toBe('123');
    expect(decoded.email).toBe('test@example.com');
  });
});
