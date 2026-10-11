import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const duration = Date.now() - now;
        this.logger.log(`[${method}] ${url} ${statusCode} - ${duration}ms`);
      }),
      catchError((err) => {
        const duration = Date.now() - now;
        const status = err?.status ?? 500;
        this.logger.warn(`[${method}] ${url} ${status} - ${duration}ms :: ${err?.message}`);
        return throwError(() => err);
      }),
    );
  }
}
