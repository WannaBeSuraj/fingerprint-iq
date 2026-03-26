import { test, expect } from '@playwright/test';

test.describe('FingerprintIQ Single Page Features', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Hero section loads and displays terminal text', async ({ page }) => {
    // Check if hero heading exists
    await expect(page.locator('text=/See what your browser/i')).toBeVisible();
    
    // Check if terminal initializes
    await expect(page.locator('text=> Initializing FingerprintIQ')).toBeVisible();
  });

  test('Live Browser Scanner runs and shows results', async ({ page }) => {
    // Start scan
    const startBtn = page.locator('button', { hasText: 'START SCAN' });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Verify it transitions to results
    // Wait for the score or "Your Fingerprint" text. The scan might take ~8s.
    test.setTimeout(30000);
    
    // Wait for the reset button or Threat Level text to appear
    await expect(page.locator('text=/Privacy Leakage Score/i')).toBeVisible({ timeout: 15000 });
    
    // Ensure the ID exists (like "Browser Fingerprint ID")
    await expect(page.locator('text=/Fingerprint ID/i')).toBeVisible();
    
    // Click 'SCAN AGAIN' to test the reset flow
    const scanAgainBtn = page.locator('button', { hasText: 'SCAN AGAIN' });
    await expect(scanAgainBtn).toBeVisible();
    await scanAgainBtn.click();
    await expect(startBtn).toBeVisible();
  });

  test('How It Works section is visible', async ({ page }) => {
    // Scroll to the How It Works section
    const heading = page.locator('h2', { hasText: 'How Fingerprinting Works' });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    
    // Check for some content
    await expect(page.locator('text=/Signals Collected/i').first()).toBeVisible();
    await expect(page.locator('text=/Intelligence Computed/i').first()).toBeVisible();
  });

  test('Use Case Tabs feature is functional', async ({ page }) => {
    // Scroll to the tabs section
    const heading = page.locator('h2', { hasText: 'Who Uses FingerprintIQ?' });
    await heading.scrollIntoViewIfNeeded();
    
    // Check if base tab is visible
    const securityTab = page.locator('button', { hasText: 'Security' }).first();
    await securityTab.click();
    await expect(page.locator('text=/Stop Bots Before They Reach Your Login/i').first()).toBeVisible();
    
    const complianceTab = page.locator('button', { hasText: 'Compliance' }).first();
    await complianceTab.click();
    await expect(page.locator('text=/Know Your GDPR Exposure/i').first()).toBeVisible();
    await expect(page.locator('text=/Stop Bots Before They Reach Your Login/i').first()).not.toBeVisible();
  });

  test('Identity Graph section is visible', async ({ page }) => {
    const heading = page.locator('h2', { hasText: 'One Person. Six Sessions.' });
    await heading.scrollIntoViewIfNeeded();
    
    // Check for the descriptive text in the graph section rather than looking for a specific class on svg
    await expect(page.locator('text=/Click any node to inspect it/i').first()).toBeVisible();
    
    // Check for SVG
    const svg = page.locator('section svg').first();
    await expect(svg).toBeVisible();
  });

});
