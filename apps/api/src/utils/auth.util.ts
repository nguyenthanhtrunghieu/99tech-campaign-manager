import jwt from 'jsonwebtoken';

export function signToken(payload: object, secret: string, expiresIn: any = '1h'): string {
  return jwt.sign(payload, secret, { expiresIn });
}
