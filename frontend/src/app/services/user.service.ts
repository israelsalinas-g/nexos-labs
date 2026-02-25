import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserPaginatedResponse,
  ToggleActiveResponse,
  ChangeAvatarRequest
} from '../models/user.interface';
import { MessageResponse } from '../models/auth.interface';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/users`;

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.endpoint, userData)
      .pipe(catchError(err => this.handleError(err)));
  }

  getUsers(page: number = 1, limit: number = 10): Observable<UserPaginatedResponse> {
    const params = this.getParams({ page, limit });
    return this.http.get<UserPaginatedResponse>(this.endpoint, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  updateUser(id: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.endpoint}/${id}`, userData)
      .pipe(catchError(err => this.handleError(err)));
  }

  toggleActive(id: string): Observable<ToggleActiveResponse> {
    return this.http.patch<ToggleActiveResponse>(`${this.endpoint}/${id}/toggle-active`, {})
      .pipe(catchError(err => this.handleError(err)));
  }

  deleteUser(id: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getUsersByRole(roleId: string, page: number = 1, limit: number = 10): Observable<UserPaginatedResponse> {
    const params = this.getParams({ page, limit });
    return this.http.get<UserPaginatedResponse>(`${this.endpoint}/role/${roleId}`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getAvailableAvatars(): Observable<string[]> {
    return this.http.get<string[]>(`${this.endpoint}/avatars/available`)
      .pipe(catchError(err => this.handleError(err)));
  }

  changeAvatar(id: string, avatarData: ChangeAvatarRequest): Observable<User> {
    return this.http.post<User>(`${this.endpoint}/${id}/avatar`, avatarData)
      .pipe(catchError(err => this.handleError(err)));
  }
}
