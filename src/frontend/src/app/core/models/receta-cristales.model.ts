export interface RecetaCristalesDto {
  recetaCristalesId: string;
  tenantId: string;
  clienteId: string;
  // Lejos OD
  lejosODEsferico: string | null;
  lejosODCilindro: string | null;
  lejosODEje: string | null;
  lejosODObservacion: string | null;
  // Lejos OI
  lejosOIEsferico: string | null;
  lejosOICilindro: string | null;
  lejosOIEje: string | null;
  lejosOIObservacion: string | null;
  // Lejos DP
  lejosDPEsferico: string | null;
  lejosDPObservacion: string | null;
  // Cerca OD
  cercaODEsferico: string | null;
  cercaODCilindro: string | null;
  cercaODEje: string | null;
  cercaODObservacion: string | null;
  // Cerca OI
  cercaOIEsferico: string | null;
  cercaOICilindro: string | null;
  cercaOIEje: string | null;
  cercaOIObservacion: string | null;
  // Cerca DP
  cercaDPEsferico: string | null;
  cercaDPObservacion: string | null;
  // ADD
  lejosADDEsfera: string | null;
  // Flags
  checkLejos: boolean;
  checkCerca: boolean;
  checkCristalesLaboratorio: boolean;
  checkUrgente: boolean;
  // Auditoría
  fechaIngreso: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface UpdateRecetaCristalesRequest {
  lejosODEsferico?: string;
  lejosODCilindro?: string;
  lejosODEje?: string;
  lejosODObservacion?: string;
  lejosOIEsferico?: string;
  lejosOICilindro?: string;
  lejosOIEje?: string;
  lejosOIObservacion?: string;
  lejosDPEsferico?: string;
  lejosDPObservacion?: string;
  cercaODEsferico?: string;
  cercaODCilindro?: string;
  cercaODEje?: string;
  cercaODObservacion?: string;
  cercaOIEsferico?: string;
  cercaOICilindro?: string;
  cercaOIEje?: string;
  cercaOIObservacion?: string;
  cercaDPEsferico?: string;
  cercaDPObservacion?: string;
  lejosADDEsfera?: string;
  checkLejos: boolean;
  checkCerca: boolean;
  checkCristalesLaboratorio: boolean;
  checkUrgente: boolean;
  fechaIngreso: string;
}
