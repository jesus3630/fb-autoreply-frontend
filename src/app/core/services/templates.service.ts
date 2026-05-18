import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Template {
  id: string;
  content: string;
  useCount: number;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TemplatesService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Template[]>(`${this.api}/templates`);
  }

  create(content: string) {
    return this.http.post<Template>(`${this.api}/templates`, { content });
  }

  update(id: string, data: Partial<Template>) {
    return this.http.put<Template>(`${this.api}/templates/${id}`, data);
  }

  remove(id: string) {
    return this.http.delete(`${this.api}/templates/${id}`);
  }
}
