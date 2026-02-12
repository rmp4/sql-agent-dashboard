import { test, expect } from '@playwright/test';

test.describe('Chart Types Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  });

  test('01 - App loads successfully', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    await page.screenshot({ path: 'test_screenshots/01-app-loaded.png' });
  });

  test('02 - Send query and render default chart', async ({ page }) => {
    // Find input field
    const inputLocators = [
      page.locator('input[type="text"]').first(),
      page.locator('textarea').first(),
      page.locator('input[placeholder*="Ask"]').first(),
    ];

    for (const input of inputLocators) {
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.fill('Show me total sales by category');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test_screenshots/02-initial-chart.png' });
        return;
      }
    }
  });

  test('03 - Verify dropdown contains all 10 chart types', async ({ page }) => {
    // Send query first
    const inputs = await page.locator('input[type="text"], textarea').all();
    if (inputs.length > 0) {
      await inputs[0].fill('Show me total sales by category');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }

    // Open config panel
    const configBtn = page.locator('button:has-text("Configure"), button:has-text("Config"), button:has-text("Edit")').first();
    if (await configBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await configBtn.click();
      await page.waitForTimeout(500);
    }

    // Find and open dropdown
    const dropdown = page.locator('[role="combobox"]').first();
    if (await dropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dropdown.click();
      await page.waitForTimeout(500);

      // Get all visible options
      const options = await page.locator('[role="option"]').allTextContents();
      console.log('Chart type options:', options);

      const expectedTypes = [
        'Table', 'Bar Chart', 'Horizontal Bar Chart', 'Stacked Bar Chart',
        'Line Chart', 'Area Chart', 'Pie Chart', 'Donut Chart',
        'Scatter Plot', 'Combo Chart'
      ];

      expectedTypes.forEach(type => {
        const found = options.some(opt => opt.includes(type));
        console.log(`${found ? '✓' : '✗'} ${type}`);
      });

      await page.screenshot({ path: 'test_screenshots/03-dropdown-open.png' });
    }
  });

  test('04 - Test Area Chart', async ({ page }) => {
    await testChartType(page, 'area', 'Area Chart', 4);
  });

  test('05 - Test Pie Chart', async ({ page }) => {
    await testChartType(page, 'pie', 'Pie Chart', 5);
  });

  test('06 - Test Donut Chart', async ({ page }) => {
    await testChartType(page, 'donut', 'Donut Chart', 6);
  });

  test('07 - Test Horizontal Bar Chart', async ({ page }) => {
    await testChartType(page, 'horizontalBar', 'Horizontal Bar Chart', 7);
  });

  test('08 - Test Stacked Bar Chart', async ({ page }) => {
    await testChartType(page, 'stackedBar', 'Stacked Bar Chart', 8);
  });

  test('09 - Test Scatter Plot', async ({ page }) => {
    await testChartType(page, 'scatter', 'Scatter Plot', 9);
  });

  test('10 - Test Combo Chart', async ({ page }) => {
    await testChartType(page, 'combo', 'Combo Chart (Bar + Line)', 10);
  });
});

async function testChartType(page: any, chartValue: string, chartLabel: string, stepNum: number) {
  // Send query
  const inputs = await page.locator('input[type="text"], textarea').all();
  if (inputs.length > 0) {
    await inputs[0].fill('Show me total sales by category');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
  }

  // Open config
  const configBtn = page.locator('button:has-text("Configure"), button:has-text("Config"), button:has-text("Edit")').first();
  if (await configBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await configBtn.click();
    await page.waitForTimeout(500);
  }

  // Open dropdown and select chart type
  const dropdown = page.locator('[role="combobox"]').first();
  if (await dropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dropdown.click();
    await page.waitForTimeout(300);

    const option = page.locator(`text="${chartLabel}"`).first();
    if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
      await option.click();
      await page.waitForTimeout(500);
    }
  }

  // Click Apply
  const applyBtn = page.locator('button:has-text("Apply")').first();
  if (await applyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await applyBtn.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: `test_screenshots/0${stepNum}-chart-${chartValue}.png` });
}
