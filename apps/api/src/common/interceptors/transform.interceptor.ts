import { Injectable, NestInterceptor, ExecutionContext, CallHandler, StreamableFile } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | StreamableFile> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T> | StreamableFile | any> {
    return next.handle().pipe(
      map(data => {
        if (data instanceof StreamableFile) {
          return data;
        }
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
