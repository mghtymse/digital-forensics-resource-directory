
import {test, expect} from '@playwright/test';
import resourceData from '../../src/data/resources.json';

test('resource catalogue loads correctly', async ({page}) => {
  // Open the resource catalogue.
  await page.goto('resources');

  // Confirm the catalogue heading appears.
  await expect(
    page.getByRole('heading', {name: 'Browse Resources', level: 1})
  ).toBeVisible();

  // Confirm all generated resources are displayed.
  const cards = page.locator('.dfir-resource-card');

  await expect(cards).toHaveCount(resourceData.length);

  // Confirm the resource count is correct.
  await expect(
    page.getByText(
      `Showing ${resourceData.length} of ${resourceData.length} resources`
    )
  ).toBeVisible();

  // Confirm a known resource is present.
  await expect(
    page.getByRole('link', {name: 'Autopsy', exact: true})
  ).toBeVisible();
});

test('resource search works and persists after refresh', async ({page}) => {
  // Open the resource catalogue.
  await page.goto('resources');

  // Search for Autopsy.
  const searchBox = page.getByRole('searchbox', {
    name: 'Search resources',
  });

  await searchBox.fill('Autopsy');

  // Confirm the search is reflected in the URL.
  await expect(page).toHaveURL(/q=Autopsy/);

  // Confirm Autopsy appears in the results.
  await expect(
    page.getByRole('link', {name: 'Autopsy', exact: true})
  ).toBeVisible();

  // Refresh the page.
  await page.reload();

  // Confirm the search term is preserved.
  await expect(searchBox).toHaveValue('Autopsy');

  // Confirm the matching resource is still displayed.
  await expect(
    page.getByRole('link', {name: 'Autopsy', exact: true})
  ).toBeVisible();
});

test('search and domain filters work together and persist', async ({page}) => {
  await page.goto('resources');

  // Select a forensic domain.
  const domainFilter = page.getByRole('combobox', {
    name: 'Forensic Domain',
  });

  await domainFilter.selectOption('Disk Forensics');

  // Search for Autopsy within that domain.
  const searchBox = page.getByRole('searchbox', {
    name: 'Search resources',
  });

  await searchBox.fill('Autopsy');

  // Confirm both selections appear in the URL.
  await expect(page).toHaveURL(/domain=Disk(?:\+|%20)Forensics/);
  await expect(page).toHaveURL(/q=Autopsy/);

  // Confirm the matching resource appears.
  await expect(
    page.getByRole('link', {name: 'Autopsy', exact: true})
  ).toBeVisible();

  // Refresh and confirm both selections persist.
  await page.reload();

  await expect(domainFilter).toHaveValue('Disk Forensics');
  await expect(searchBox).toHaveValue('Autopsy');

  await expect(
    page.getByRole('link', {name: 'Autopsy', exact: true})
  ).toBeVisible();
});

test('resource detail page navigation works', async ({page}) => {
  // Open the resource catalogue.
  await page.goto('resources');

  // Find and click the Autopsy resource.
  await page.getByRole('link', {
    name: 'Autopsy',
    exact: true,
  }).click();

  // Confirm navigation to the correct resource page.
  await expect(page).toHaveURL(
    /\/digital-forensics-resource-directory\/resource\/autopsy\/?$/
  );

  // Confirm the resource detail page loads.
  await expect(
    page.getByRole('heading', {
      name: 'Autopsy',
      exact: true,
    })
  ).toBeVisible();

  // Confirm browser Back navigation works.
  await page.goBack();

  await expect(
    page.getByRole('heading', {
      name: 'Browse Resources',
      level: 1,
    })
  ).toBeVisible();
});
