import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // Dummy JWT Auth Guard logic. In a real scenario, validate token here.
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      // Allow access for health checks or public endpoints (in real app, use metadata like @Public())
      if (request.url === '/health' || request.url.startsWith('/api/docs')) {
        return true;
      }
      // Uncomment to enforce auth strictly, left permissive for now
      // throw new UnauthorizedException('Missing authorization header');
      return true; // For local testing without supabase
    }
    
    return true;
  }
}
