/**
 * Tests for modular map layers (FR #207)
 *
 * Verifies that the modular layer architecture exists and exports correctly
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const srcDir = join(import.meta.dirname, '..', 'src', 'components', 'map');

describe('FR #207: Modular map layers', () => {
  describe('Directory structure', () => {
    it('has map/layers directory', () => {
      assert.ok(existsSync(join(srcDir, 'layers')));
    });

    it('has types.ts', () => {
      assert.ok(existsSync(join(srcDir, 'types.ts')));
    });
  });

  describe('Layer modules exist', () => {
    it('has submarine-cables-layer.ts', () => {
      assert.ok(existsSync(join(srcDir, 'layers', 'submarine-cables-layer.ts')));
    });

    it('has landing-stations-layer.ts', () => {
      assert.ok(existsSync(join(srcDir, 'layers', 'landing-stations-layer.ts')));
    });

    it('has cloud-regions-layer.ts', () => {
      assert.ok(existsSync(join(srcDir, 'layers', 'cloud-regions-layer.ts')));
    });

    it('has index.ts re-exports', () => {
      assert.ok(existsSync(join(srcDir, 'layers', 'index.ts')));
    });
  });

  describe('Module content validation', () => {
    it('submarine-cables-layer exports createSubmarineCablesLayer', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(srcDir, 'layers', 'submarine-cables-layer.ts'), 'utf-8')
      );
      assert.ok(content.includes('export function createSubmarineCablesLayer'));
    });

    it('landing-stations-layer exports createLandingStationsLayer', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(srcDir, 'layers', 'landing-stations-layer.ts'), 'utf-8')
      );
      assert.ok(content.includes('export function createLandingStationsLayer'));
    });

    it('cloud-regions-layer exports createCloudRegionsLayer', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(srcDir, 'layers', 'cloud-regions-layer.ts'), 'utf-8')
      );
      assert.ok(content.includes('export function createCloudRegionsLayer'));
    });

    it('index.ts re-exports all layer factories', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(srcDir, 'layers', 'index.ts'), 'utf-8')
      );
      assert.ok(content.includes('createSubmarineCablesLayer'));
      assert.ok(content.includes('createLandingStationsLayer'));
      assert.ok(content.includes('createCloudRegionsLayer'));
    });
  });

  describe('DeckGLMap.ts integration', () => {
    it('imports modular layers', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(import.meta.dirname, '..', 'src', 'components', 'DeckGLMap.ts'), 'utf-8')
      );
      assert.ok(content.includes("from './map/layers'"));
    });

    it('uses createSubmarineCablesLayer factory', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(import.meta.dirname, '..', 'src', 'components', 'DeckGLMap.ts'), 'utf-8')
      );
      assert.ok(content.includes('createSubmarineCablesLayer(zoom)'));
    });

    it('uses createLandingStationsLayer factory', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(import.meta.dirname, '..', 'src', 'components', 'DeckGLMap.ts'), 'utf-8')
      );
      assert.ok(content.includes('createLandingStationsLayer()'));
    });

    it('uses createCloudRegionsLayer factory', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(import.meta.dirname, '..', 'src', 'components', 'DeckGLMap.ts'), 'utf-8')
      );
      assert.ok(content.includes('createCloudRegionsLayer('));
    });

    it('removed old private createSubmarineCablesLayer method', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(import.meta.dirname, '..', 'src', 'components', 'DeckGLMap.ts'), 'utf-8')
      );
      // Old method was "private createSubmarineCablesLayer(): PathLayer"
      assert.ok(!content.includes('private createSubmarineCablesLayer()'));
    });

    it('removed old private createLandingStationsLayer method', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(import.meta.dirname, '..', 'src', 'components', 'DeckGLMap.ts'), 'utf-8')
      );
      assert.ok(!content.includes('private createLandingStationsLayer()'));
    });

    it('removed old private createCloudRegionsLayer method', async () => {
      const content = await import('node:fs').then((fs) =>
        fs.readFileSync(join(import.meta.dirname, '..', 'src', 'components', 'DeckGLMap.ts'), 'utf-8')
      );
      assert.ok(!content.includes('private createCloudRegionsLayer()'));
    });
  });
});
