export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


import { Vehicle, VehicleType, VehicleStatus, DossierType, DossierStatus } from '@/types';


class ApiClient {
  private token: string | null = null;

  setToken(t: string) { this.token = t; }
  clearToken() { this.token = null; }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  login(email: string, password: string) {
    return this.fetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }
  register(data: { email: string; password: string; firstName: string; lastName: string }) {
    return this.fetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }
  me() { return this.fetch('/auth/me'); }

  getVehicles(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.fetch(`/vehicles${qs}`);
  }
  getVehicle(id: string) { return this.fetch(`/vehicles/${id}`); }
  createVehicle(data: Partial<Vehicle>) {
    return this.fetch('/vehicles', { method: 'POST', body: JSON.stringify(data) });
  }
  deleteVehicle(id: string) {
    return this.fetch(`/vehicles/${id}`, { method: 'DELETE' });
  }
  createVehicleForm(formData: FormData) {
    return this.fetch('/vehicles', {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }
  
  basculerVehicle(id: string, status: VehicleStatus, extra?: { price?: number; monthlyPrice?: number }) {
    return this.fetch(`/vehicles/${id}/bascule`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extra })
    });
  }
  
  createDossier(data: { vehicleId: string | null; type: DossierType }) {
    return this.fetch('/dossiers', { method: 'POST', body: JSON.stringify(data) });
  }
  getMyDossiers() { return this.fetch('/dossiers/mine'); }
  getDossier(id: string) { return this.fetch(`/dossiers/${id}`); }

  uploadDocument(dossierId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('dossierId', dossierId);
    return this.fetch('/documents', { method: 'POST', body: form, headers: {} });
  }

  getAllDossiers(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.fetch(`/admin/dossiers${qs}`);
  }
  validateDossier(id: string, status: DossierStatus, comment?: string) {
    return this.fetch(`/admin/dossiers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, comment }) });
  }
}

export const api = new ApiClient();
