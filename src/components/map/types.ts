/**
 * Shared types for map layer modules
 * FR #207: Split giant components
 */

/** Layer configuration options */
export interface LayerOptions {
  pickable?: boolean;
  visible?: boolean;
}

/** LOD (Level of Detail) level for zoom-based simplification */
export type LODLevel = 'low' | 'medium' | 'high';

/** Color with alpha channel */
export type RGBAColor = [number, number, number, number];
