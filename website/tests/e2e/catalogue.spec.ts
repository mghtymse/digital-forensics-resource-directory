
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
test('multi-term search works regardless of word order and case', async ({page}) => {
  await page.goto('resources');

  const searchBox = page.getByRole('searchbox', {
    name: 'Search resources',
  });

  const cards = page.locator('.dfir-resource-card');

  // Search using two terms.
  await searchBox.fill('memory forensics');

  await expect(page).toHaveURL(/q=memory(?:\+|%20)forensics/);

  const firstResults = await cards.allTextContents();

  // The search should return at least one matching resource.
  expect(firstResults.length).toBeGreaterThan(0);

  // Reverse the word order.
  await searchBox.fill('forensics memory');

  await expect(page).toHaveURL(/q=forensics(?:\+|%20)memory/);

  const reversedResults = await cards.allTextContents();

  // The same resources should be returned.
  expect(reversedResults).toEqual(firstResults);

  // Repeat using uppercase.
  await searchBox.fill('MEMORY FORENSICS');

  await expect(page).toHaveURL(/q=MEMORY(?:\+|%20)FORENSICS/);

  const uppercaseResults = await cards.allTextContents();

  expect(uppercaseResults).toEqual(firstResults);
});
test('search defaults to relevance and supports alphabetical sorting', async ({page}) => {
  await page.goto('resources');

  const searchBox = page.getByRole('searchbox', {
    name: 'Search resources',
  });

  const sortSelect = page.getByRole('combobox', {
    name: 'Sort resources by',
  });

  // Browsing without a search defaults to alphabetical sorting.
  await expect(sortSelect).toHaveValue('name-asc');

  // Entering a search automatically selects relevance sorting.
  await searchBox.fill('forensics');

  await expect(sortSelect).toHaveValue('relevance');

  // An explicit sorting choice overrides relevance.
  await sortSelect.selectOption('name-desc');

  await expect(sortSelect).toHaveValue('name-desc');
  await expect(page).toHaveURL(/sort=name-desc/);

  // Confirm the search results are in reverse alphabetical order.
  const names = await page
    .locator('.dfir-resource-card')
    .evaluateAll((cards) =>
      cards.map((card) => {
        const link = card.querySelector('a[href*="/resource/"]');
        return link?.textContent?.trim() ?? '';
      })
    );

  expect(names.length).toBeGreaterThan(1);

  expect(names).toEqual(
    [...names].sort((a, b) => b.localeCompare(a))
  );

  // Clearing filters restores the default alphabetical sort.
  await page.getByRole('button', {name: 'Clear Filters'}).click();

  await expect(searchBox).toHaveValue('');
  await expect(sortSelect).toHaveValue('name-asc');
});