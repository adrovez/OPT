export interface AnamnesisDto {
  anamnesisId: string;
  tenantId: string;
  clienteId: string;
  hipertension: boolean;
  diabetes: boolean;
  alergias: boolean;
  usaLentes: boolean;
  observacion?: string;
  fechaRegistro: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateAnamnesisRequest {
  clienteId: string;
  hipertension: boolean;
  diabetes: boolean;
  alergias: boolean;
  usaLentes: boolean;
  observacion?: string;
}

export interface UpdateAnamnesisRequest {
  hipertension: boolean;
  diabetes: boolean;
  alergias: boolean;
  usaLentes: boolean;
  observacion?: string;
}
