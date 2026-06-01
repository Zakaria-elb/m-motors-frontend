export type VehicleType = 'ACHAT' | 'LOCATION' | 'LES_DEUX';
export type VehicleStatus = 'A_VENDRE' | 'EN_LOCATION' | 'LES_DEUX' | 'VENDU' | 'LOUE';
export type DossierType = 'ACHAT' | 'LOCATION';
export type DossierStatus = 'BROUILLON' | 'EN_ATTENTE' | 'EN_REVISION' | 'VALIDE' | 'REFUSE' | 'SIGNE';
export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price?: number;
  monthlyPrice?: number;
  status: VehicleStatus;
  type: VehicleType;
  description: string;
  imageUrls: string[];
  options: Record<string, boolean>;
}

export interface DocumentFile {
  id: string;
  originalName: string;
  mimeType: string;
}

export interface Dossier {
  id: string;
  type: DossierType;
  status: DossierStatus;
  vehicle: Vehicle;
  user?: { email?: string };  // ← AJOUTER CETTE LIGNE
  createdAt: string;
  updatedAt: string;
  documents?: DocumentFile[];
  adminComment?: string;
}
