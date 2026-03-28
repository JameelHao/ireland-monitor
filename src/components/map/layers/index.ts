/**
 * Map Layers - Re-exports
 * FR #207: Modular layer architecture for DeckGLMap
 *
 * Each layer is extracted into its own module for:
 * - Better code organization
 * - Easier testing
 * - Potential lazy loading
 * - Improved tree shaking
 */

// Ireland-specific layers
export { createSubmarineCablesLayer } from './submarine-cables-layer';
export { createLandingStationsLayer } from './landing-stations-layer';
export { createCloudRegionsLayer } from './cloud-regions-layer';

// Types
export type { LayerOptions, LODLevel, RGBAColor } from '../types';
