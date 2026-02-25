import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class DebugInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('===== DEBUG INTERCEPTOR =====');
          console.log('URL:', req.url);
          console.log('Status:', event.status);
          console.log('Raw Response Body:', event.body);
          console.log('Response Body Type:', typeof event.body);
          console.log('Is Array?:', Array.isArray(event.body));
          console.log('Response Body Constructor:', event.body?.constructor?.name);
          console.log('Response Body Keys:', Object.keys(event.body || {}));
          
          // Si tiene data, inspeccionar
          if (event.body?.data !== undefined) {
            console.log('  body.data:', event.body.data);
            console.log('  body.data type:', typeof event.body.data);
            console.log('  body.data is Array?:', Array.isArray(event.body.data));
          }
          
          console.log('===== END INTERCEPTOR =====');
        }
      })
    );
  }
}
