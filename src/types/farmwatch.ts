export type Language = 'en' | 'hi';

export interface Coordinate {
  lng: number;
  lat: number;
}

export interface FieldGeometry {
  id: string;
  version: number;
  coordinates: Coordinate[];
  areaHa: number;
  sha256?: string;
  createdAt: string;
}

export interface CropSeason {
  id: string;
  fieldId: string;
  cropCode: string;
  cropNameEn: string;
  cropNameHi: string;
  sowingDate: string;
  expectedHarvestDate?: string;
  irrigationMethod: 'drip' | 'sprinkler' | 'flood' | 'rainfed' | 'furrow';
  status: 'active' | 'harvested' | 'planned';
}

export interface SoilReport {
  id: string;
  seasonId: string;
  sampledOn: string;
  labName?: string;
  ph: number;
  organicCarbonPercent: number;
  availableNitrogenKgHa: number;
  availablePhosphorusKgHa: number;
  availablePotassiumKgHa: number;
  electricalConductivityDsM: number;
  confirmedByFarmer: boolean;
  confirmedAt?: string;
}

export interface SatelliteObservation {
  id: string;
  provider: string;
  collection: string;
  timestamps: {
    acquired_at: string;
    published_at: string | null;
    ingested_at: string;
    processed_at: string;
    last_usable_at: string | null;
  };
  quality: {
    scl_cloud_percentage: number;
    scl_shadow_percentage: number;
    coverage_full: number;
    coverage_core: number;
    valid_pixel_count: number;
    total_pixel_count: number;
    grid_resolution_meters: number;
    support_state: 'sufficient_evidence' | 'insufficient_cloud_free_pixels' | 'field_too_small_for_satellite';
    exclusion_reasons: string[];
  };
  bands: {
    b4_red_reflectance: number;
    b8_nir_reflectance: number;
    b11_swir_reflectance: number;
  };
  indicators: {
    ndvi_median: number | null;
    ndvi_p10: number | null;
    ndvi_p90: number | null;
    ndmi_median: number | null;
    ndmi_p10: number | null;
    ndmi_p90: number | null;
  };
}

export interface ChangeAlert {
  id: string;
  kind: string;
  severity: 'inspect_field' | 'warning' | 'info';
  title: string;
  created_at: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'superseded';
  rule_version: string;
  explanation: {
    baselineNdvi: number;
    latestNdvi: number;
    absoluteDelta: number;
    relativeDeltaPercent: number;
    baselineObservationsCount: number;
    qualifyingCriteriaMet: string;
    disclaimer: string;
  };
}

export interface AgronomicReference {
  id: string;
  title: string;
  publisher: string;
  issueDate: string;
  url: string;
  scope: string;
  excerpt: string;
}

export interface AIAdvisoryData {
  schema_version: string;
  locale: string;
  evidence_ids?: string[];
  photo_observations: Array<{
    description: string;
    quality: 'adequate' | 'limited' | 'unusable';
    leaf_area_affected?: string;
  }>;
  possible_causes: Array<{
    explanation: string;
    supporting_evidence?: string;
    confidence: 'low' | 'moderate';
  }>;
  questions: string[];
  inspection_steps: string[];
  regenerative_guidance: Array<{
    text: string;
    reference_ids: string[];
  }>;
  uncertainty: string;
  escalation: 'none' | 'inspect_field' | 'consult_agronomist' | 'urgent_human_review';
}

export interface AIAdvisoryEnvelope {
  id: string;
  generated_at: string;
  model_id: string;
  prompt_version: string;
  schema_version: string;
  validation_status: string;
  locale: string;
  data: AIAdvisoryData;
  available_references?: AgronomicReference[];
}

export interface FarmerAction {
  id: string;
  fieldId: string;
  seasonId: string;
  observedOn: string;
  observation: string;
  actionTaken: string;
  outcome?: string;
  alertConcernConfirmed: 'confirmed' | 'refuted' | 'inconclusive';
  createdAt: string;
}

export interface WeatherContext {
  provider: string;
  kind: string;
  issued_at: string;
  retrieved_at: string;
  coordinates: { latitude: number; longitude: number };
  resolution_label: string;
  daily: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
  };
  summary: {
    currentTemp: number;
    recentPrecipitationSum: number;
    forecastPrecipitationSum: number;
    maxTempUpcoming: number;
    minTempUpcoming: number;
  };
}

export interface FarmField {
  id: string;
  farmName: string;
  fieldName: string;
  locationName: string;
  currentGeometry: FieldGeometry;
  activeSeason: CropSeason;
  soilReport: SoilReport;
  observations: SatelliteObservation[];
  latestAlert: ChangeAlert | null;
  actions: FarmerAction[];
  recentAdvisory: AIAdvisoryEnvelope | null;
}
