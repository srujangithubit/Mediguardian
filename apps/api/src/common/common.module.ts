import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ConsentGuard } from './guards/consent.guard';

@Global()
@Module({
  providers: [JwtAuthGuard, TransformInterceptor, HttpExceptionFilter, ConsentGuard],
  exports: [JwtAuthGuard, TransformInterceptor, HttpExceptionFilter, ConsentGuard],
})
export class CommonModule {}
