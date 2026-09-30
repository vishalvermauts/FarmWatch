import { FarmField } from '../types/farmwatch';

// Pre-seeded authentic rural agricultural fields with actual farming coordinates across India
export const INITIAL_FIELDS: FarmField[] = [
  // --------------------------------------------------------------------------
  // DEMO FARM 1: 🍇 Nashik Rural Viticulture & Grape Orchards (Dindori Valley)
  // --------------------------------------------------------------------------
  {
    id: 'FIELD-NASHIK-DINDORI',
    farmName: 'Sahyadri Bio-Vineyards',
    fieldName: 'Block 4 - Thompson Seedless & Gram Intercrop',
    locationName: 'Dindori Valley, Nashik Agro-District, Maharashtra (20.1985° N, 73.8340° E)',
    currentGeometry: {
      id: 'GEOM-NSK-DINDORI-1',
      version: 1,
      areaHa: 1.25,
      createdAt: '2026-08-01T06:00:00Z',
      coordinates: [
        { lng: 73.8320, lat: 20.1972 },
        { lng: 73.8360, lat: 20.1975 },
        { lng: 73.8358, lat: 20.2002 },
        { lng: 73.8318, lat: 20.1998 },
      ]
    },
    activeSeason: {
      id: 'SEASON-NSK-2026-01',
      fieldId: 'FIELD-NASHIK-DINDORI',
      cropCode: 'GRAPES_THOMPSON',
      cropNameEn: 'Table Grapes (Thompson Seedless)',
      cropNameHi: 'अंगूर (थॉम्पसन सीडलेस)',
      sowingDate: '2026-08-10',
      expectedHarvestDate: '2026-12-15',
      irrigationMethod: 'drip',
      status: 'active',
    },
    soilReport: {
      id: 'SOIL-NSK-01',
      seasonId: 'SEASON-NSK-2026-01',
      sampledOn: '2026-08-05',
      labName: 'Dindori Taluka Soil Health Laboratory',
      ph: 7.3,
      organicCarbonPercent: 0.58,
      availableNitrogenKgHa: 220,
      availablePhosphorusKgHa: 19.5,
      availablePotassiumKgHa: 345,
      electricalConductivityDsM: 0.38,
      confirmedByFarmer: true,
      confirmedAt: '2026-08-08T10:30:00Z',
    },
    observations: [
      {
        id: 'S2A_MSIL2A_20260819_1',
        provider: 'Copernicus Sentinel-2 Harmonized',
        collection: 'COPERNICUS/S2_SR_HARMONIZED',
        timestamps: {
          acquired_at: '2026-08-19T05:32:10Z',
          published_at: '2026-08-19T07:10:00Z',
          ingested_at: '2026-08-19T07:45:00Z',
          processed_at: '2026-08-19T08:00:00Z',
          last_usable_at: '2026-08-19T05:32:10Z',
        },
        quality: {
          scl_cloud_percentage: 2.1,
          scl_shadow_percentage: 0.4,
          coverage_full: 0.98,
          coverage_core: 0.94,
          valid_pixel_count: 28,
          total_pixel_count: 31,
          grid_resolution_meters: 20,
          support_state: 'sufficient_evidence',
          exclusion_reasons: [],
        },
        bands: { b4_red_reflectance: 0.125, b8_nir_reflectance: 0.380, b11_swir_reflectance: 0.230 },
        indicators: {
          ndvi_median: 0.505,
          ndvi_p10: 0.470,
          ndvi_p90: 0.540,
          ndmi_median: 0.246,
          ndmi_p10: 0.210,
          ndmi_p90: 0.280,
        }
      },
      {
        id: 'S2A_MSIL2A_20260908_3',
        provider: 'Copernicus Sentinel-2 Harmonized',
        collection: 'COPERNICUS/S2_SR_HARMONIZED',
        timestamps: {
          acquired_at: '2026-09-08T05:32:10Z',
          published_at: '2026-09-08T07:12:00Z',
          ingested_at: '2026-09-08T07:48:00Z',
          processed_at: '2026-09-08T08:02:00Z',
          last_usable_at: '2026-09-08T05:32:10Z',
        },
        quality: {
          scl_cloud_percentage: 1.8,
          scl_shadow_percentage: 0.3,
          coverage_full: 0.99,
          coverage_core: 0.95,
          valid_pixel_count: 30,
          total_pixel_count: 31,
          grid_resolution_meters: 20,
          support_state: 'sufficient_evidence',
          exclusion_reasons: [],
        },
        bands: { b4_red_reflectance: 0.105, b8_nir_reflectance: 0.445, b11_swir_reflectance: 0.205 },
        indicators: {
          ndvi_median: 0.618,
          ndvi_p10: 0.580,
          ndvi_p90: 0.650,
          ndmi_median: 0.369,
          ndmi_p10: 0.330,
          ndmi_p90: 0.400,
        }
      },
      {
        id: 'S2A_MSIL2A_20260916_4',
        provider: 'Copernicus Sentinel-2 Harmonized',
        collection: 'COPERNICUS/S2_SR_HARMONIZED',
        timestamps: {
          acquired_at: '2026-09-16T05:32:10Z',
          published_at: '2026-09-16T07:18:00Z',
          ingested_at: '2026-09-16T07:55:00Z',
          processed_at: '2026-09-16T08:10:00Z',
          last_usable_at: '2026-09-16T05:32:10Z',
        },
        quality: {
          scl_cloud_percentage: 3.2,
          scl_shadow_percentage: 0.6,
          coverage_full: 0.97,
          coverage_core: 0.92,
          valid_pixel_count: 29,
          total_pixel_count: 31,
          grid_resolution_meters: 20,
          support_state: 'sufficient_evidence',
          exclusion_reasons: [],
        },
        bands: { b4_red_reflectance: 0.098, b8_nir_reflectance: 0.460, b11_swir_reflectance: 0.198 },
        indicators: {
          ndvi_median: 0.648,
          ndvi_p10: 0.610,
          ndvi_p90: 0.680,
          ndmi_median: 0.398,
          ndmi_p10: 0.360,
          ndmi_p90: 0.430,
        }
      },
      {
        id: 'S2A_MSIL2A_20260928_6',
        provider: 'Copernicus Sentinel-2 Harmonized',
        collection: 'COPERNICUS/S2_SR_HARMONIZED',
        timestamps: {
          acquired_at: '2026-09-28T05:32:10Z',
          published_at: '2026-09-28T07:11:00Z',
          ingested_at: '2026-09-28T07:46:00Z',
          processed_at: '2026-09-28T08:00:00Z',
          last_usable_at: '2026-09-28T05:32:10Z',
        },
        quality: {
          scl_cloud_percentage: 1.5,
          scl_shadow_percentage: 0.2,
          coverage_full: 0.99,
          coverage_core: 0.95,
          valid_pixel_count: 31,
          total_pixel_count: 31,
          grid_resolution_meters: 20,
          support_state: 'sufficient_evidence',
          exclusion_reasons: [],
        },
        bands: { b4_red_reflectance: 0.088, b8_nir_reflectance: 0.475, b11_swir_reflectance: 0.185 },
        indicators: {
          ndvi_median: 0.725,
          ndvi_p10: 0.680,
          ndvi_p90: 0.765,
          ndmi_median: 0.380,
          ndmi_p10: 0.340,
          ndmi_p90: 0.420,
        }
      }
    ],
    latestAlert: null,
    actions: [
      {
        id: 'ACT-NSK-01',
        fieldId: 'FIELD-NASHIK-DINDORI',
        seasonId: 'SEASON-NSK-2026-01',
        observedOn: '2026-09-29',
        observation: 'Checked vineyard trellis rows. Excellent canopy growth and vigorous shoot extension.',
        actionTaken: 'Normal scheduled fertigation and drip line inspection completed.',
        outcome: 'Uniform 100% green vegetative cover across entire block; peak vigor maintained.',
        alertConcernConfirmed: 'confirmed',
        createdAt: '2026-09-29T14:20:00Z',
      }
    ],
    recentAdvisory: null
  },

  // --------------------------------------------------------------------------
  // DEMO FARM 2: 🌾 Punjab Intensive Wheat Cropland (Samrala Plains, Ludhiana)
  // --------------------------------------------------------------------------
  {
    id: 'FIELD-PUNJAB-SAMRALA',
    farmName: 'Malwa Canal Agro-Holdings',
    fieldName: 'Plot 7C - Intensive Wheat & Mustard Border',
    locationName: 'Samrala, Ludhiana Agro-District, Punjab (30.8250° N, 76.1820° E)',
    currentGeometry: {
      id: 'GEOM-PB-SAMRALA-1',
      version: 1,
      areaHa: 2.10,
      createdAt: '2026-07-15T06:00:00Z',
      coordinates: [
        { lng: 76.1795, lat: 30.8232 },
        { lng: 76.1852, lat: 30.8236 },
        { lng: 76.1848, lat: 30.8272 },
        { lng: 76.1792, lat: 30.8268 },
      ]
    },
    activeSeason: {
      id: 'SEASON-PB-2026-01',
      fieldId: 'FIELD-PUNJAB-SAMRALA',
      cropCode: 'WHEAT_SHARBATI',
      cropNameEn: 'Sharbati Wheat (HD-3086)',
      cropNameHi: 'शरबती गेहूं (एचडी-3086)',
      sowingDate: '2026-07-20',
      expectedHarvestDate: '2026-11-20',
      irrigationMethod: 'sprinkler',
      status: 'active',
    },
    soilReport: {
      id: 'SOIL-PB-01',
      seasonId: 'SEASON-PB-2026-01',
      sampledOn: '2026-07-10',
      labName: 'PAU Agricultural Soil Testing Lab, Ludhiana',
      ph: 7.8,
      organicCarbonPercent: 0.44,
      availableNitrogenKgHa: 195,
      availablePhosphorusKgHa: 16.0,
      availablePotassiumKgHa: 310,
      electricalConductivityDsM: 0.35,
      confirmedByFarmer: true,
      confirmedAt: '2026-07-12T09:00:00Z',
    },
    observations: [
      {
        id: 'S2A_MSIL2A_20260920_PB',
        provider: 'Copernicus Sentinel-2 Harmonized',
        collection: 'COPERNICUS/S2_SR_HARMONIZED',
        timestamps: {
          acquired_at: '2026-09-20T05:40:10Z',
          published_at: '2026-09-20T07:25:00Z',
          ingested_at: '2026-09-20T08:00:00Z',
          processed_at: '2026-09-20T08:15:00Z',
          last_usable_at: '2026-09-20T05:40:10Z',
        },
        quality: {
          scl_cloud_percentage: 3.5,
          scl_shadow_percentage: 0.8,
          coverage_full: 0.98,
          coverage_core: 0.94,
          valid_pixel_count: 50,
          total_pixel_count: 52,
          grid_resolution_meters: 20,
          support_state: 'sufficient_evidence',
          exclusion_reasons: [],
        },
        bands: { b4_red_reflectance: 0.085, b8_nir_reflectance: 0.495, b11_swir_reflectance: 0.180 },
        indicators: {
          ndvi_median: 0.707,
          ndvi_p10: 0.670,
          ndvi_p90: 0.740,
          ndmi_median: 0.466,
          ndmi_p10: 0.430,
          ndmi_p90: 0.495,
        }
      }
    ],
    latestAlert: null,
    actions: [],
    recentAdvisory: null
  },

  // --------------------------------------------------------------------------
  // DEMO FARM 3: 🌶️ Guntur Red Chili & Cotton Delta Belt (Vatticherukuru)
  // --------------------------------------------------------------------------
  {
    id: 'FIELD-GUNTUR-VATTICHERUKURU',
    farmName: 'Krishna Delta Black Soil Estate',
    fieldName: 'Sector 3 - High-Pungency Red Chili',
    locationName: 'Vatticherukuru, Guntur Chili Belt, Andhra Pradesh (16.2240° N, 80.5280° E)',
    currentGeometry: {
      id: 'GEOM-AP-GUNTUR-1',
      version: 1,
      areaHa: 1.65,
      createdAt: '2026-08-01T06:00:00Z',
      coordinates: [
        { lng: 80.5255, lat: 16.2220 },
        { lng: 80.5305, lat: 16.2224 },
        { lng: 80.5302, lat: 16.2260 },
        { lng: 80.5252, lat: 16.2256 },
      ]
    },
    activeSeason: {
      id: 'SEASON-AP-2026-01',
      fieldId: 'FIELD-GUNTUR-VATTICHERUKURU',
      cropCode: 'CHILI_TEJA',
      cropNameEn: 'Dry Red Chili (Teja S17)',
      cropNameHi: 'लाल मिर्च (तेजा एस17)',
      sowingDate: '2026-08-15',
      expectedHarvestDate: '2026-12-30',
      irrigationMethod: 'drip',
      status: 'active',
    },
    soilReport: {
      id: 'SOIL-AP-01',
      seasonId: 'SEASON-AP-2026-01',
      sampledOn: '2026-08-08',
      labName: 'Guntur District Agri Soil Testing Lab',
      ph: 7.5,
      organicCarbonPercent: 0.52,
      availableNitrogenKgHa: 240,
      availablePhosphorusKgHa: 22.0,
      availablePotassiumKgHa: 380,
      electricalConductivityDsM: 0.45,
      confirmedByFarmer: true,
      confirmedAt: '2026-08-10T11:00:00Z',
    },
    observations: [
      {
        id: 'S2A_MSIL2A_20260925_AP',
        provider: 'Copernicus Sentinel-2 Harmonized',
        collection: 'COPERNICUS/S2_SR_HARMONIZED',
        timestamps: {
          acquired_at: '2026-09-25T05:25:10Z',
          published_at: '2026-09-25T07:10:00Z',
          ingested_at: '2026-09-25T07:45:00Z',
          processed_at: '2026-09-25T08:00:00Z',
          last_usable_at: '2026-09-25T05:25:10Z',
        },
        quality: {
          scl_cloud_percentage: 2.8,
          scl_shadow_percentage: 0.5,
          coverage_full: 0.98,
          coverage_core: 0.93,
          valid_pixel_count: 38,
          total_pixel_count: 41,
          grid_resolution_meters: 20,
          support_state: 'sufficient_evidence',
          exclusion_reasons: [],
        },
        bands: { b4_red_reflectance: 0.110, b8_nir_reflectance: 0.435, b11_swir_reflectance: 0.215 },
        indicators: {
          ndvi_median: 0.596,
          ndvi_p10: 0.560,
          ndvi_p90: 0.630,
          ndmi_median: 0.338,
          ndmi_p10: 0.305,
          ndmi_p90: 0.370,
        }
      }
    ],
    latestAlert: null,
    actions: [],
    recentAdvisory: null
  },

  // --------------------------------------------------------------------------
  // DEMO FARM 4: 🌱 Mandya Cauvery Sugarcane Basin (Pandavapura Farmland)
  // --------------------------------------------------------------------------
  {
    id: 'FIELD-MANDYA-PANDAVAPURA',
    farmName: 'Cauvery Perennial Sugarcane Co-op',
    fieldName: 'Canal Plot 12 - High-Sucrose Sugarcane',
    locationName: 'Pandavapura, Mandya Agro-Valley, Karnataka (12.4835° N, 76.6855° E)',
    currentGeometry: {
      id: 'GEOM-KA-MANDYA-1',
      version: 1,
      areaHa: 1.80,
      createdAt: '2026-07-01T06:00:00Z',
      coordinates: [
        { lng: 76.6830, lat: 12.4815 },
        { lng: 76.6880, lat: 12.4818 },
        { lng: 76.6876, lat: 12.4855 },
        { lng: 76.6826, lat: 12.4851 },
      ]
    },
    activeSeason: {
      id: 'SEASON-KA-2026-01',
      fieldId: 'FIELD-MANDYA-PANDAVAPURA',
      cropCode: 'SUGARCANE_CO',
      cropNameEn: 'Sugarcane (Co 86032)',
      cropNameHi: 'गन्ना (सीओ 86032)',
      sowingDate: '2026-07-05',
      expectedHarvestDate: '2027-05-20',
      irrigationMethod: 'flood',
      status: 'active',
    },
    soilReport: {
      id: 'SOIL-KA-01',
      seasonId: 'SEASON-KA-2026-01',
      sampledOn: '2026-06-28',
      labName: 'Visvesvaraya Canal Command Soil Laboratory',
      ph: 6.8,
      organicCarbonPercent: 0.62,
      availableNitrogenKgHa: 260,
      availablePhosphorusKgHa: 24.5,
      availablePotassiumKgHa: 350,
      electricalConductivityDsM: 0.32,
      confirmedByFarmer: true,
      confirmedAt: '2026-07-02T10:00:00Z',
    },
    observations: [
      {
        id: 'S2A_MSIL2A_20260927_KA',
        provider: 'Copernicus Sentinel-2 Harmonized',
        collection: 'COPERNICUS/S2_SR_HARMONIZED',
        timestamps: {
          acquired_at: '2026-09-27T05:30:10Z',
          published_at: '2026-09-27T07:15:00Z',
          ingested_at: '2026-09-27T07:50:00Z',
          processed_at: '2026-09-27T08:05:00Z',
          last_usable_at: '2026-09-27T05:30:10Z',
        },
        quality: {
          scl_cloud_percentage: 2.2,
          scl_shadow_percentage: 0.3,
          coverage_full: 0.99,
          coverage_core: 0.96,
          valid_pixel_count: 43,
          total_pixel_count: 45,
          grid_resolution_meters: 20,
          support_state: 'sufficient_evidence',
          exclusion_reasons: [],
        },
        bands: { b4_red_reflectance: 0.092, b8_nir_reflectance: 0.485, b11_swir_reflectance: 0.175 },
        indicators: {
          ndvi_median: 0.681,
          ndvi_p10: 0.650,
          ndvi_p90: 0.710,
          ndmi_median: 0.469,
          ndmi_p10: 0.440,
          ndmi_p90: 0.500,
        }
      }
    ],
    latestAlert: null,
    actions: [],
    recentAdvisory: null
  }
];
