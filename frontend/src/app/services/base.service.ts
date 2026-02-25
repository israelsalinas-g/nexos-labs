import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export abstract class BaseService {
    protected http = inject(HttpClient);
    protected readonly baseUrl = environment.apiUrl;

    protected handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = error.error?.message || `Server error: ${error.status} - ${error.message}`;
        }

        console.error(`[BaseService] ${errorMessage}`, error);
        return throwError(() => new Error(errorMessage));
    }

    protected getParams(paramsObj: Record<string, any>): HttpParams {
        let params = new HttpParams();
        Object.entries(paramsObj).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params = params.set(key, value.toString());
            }
        });
        return params;
    }
}
