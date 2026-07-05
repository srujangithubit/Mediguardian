import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'mediguardian-dev-secret';
      const decoded = jwt.verify(token, secret) as { sub: string; email: string };
      request.user = { id: decoded.sub, email: decoded.email };
      return true;
    } catch (error) {
      console.error("JWT VERIFICATION ERROR:", error, "Token:", token);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
