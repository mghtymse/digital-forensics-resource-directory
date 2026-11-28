
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
    page.locator('strong').filter({
      hasText: `Showing ${resourceData.length} of ${resourceData.length} resources`,
    })
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
test('resource detail pages display valid related resources', async ({page}) => {
  await page.goto('resource/autopsy');

  // Find the Related Resources section.
  const relatedSection = page.getByRole('region', {
    name: 'Related Resources',
  });

  await expect(relatedSection).toBeVisible();

  // Confirm recommendations are displayed.
  const relatedLinks = relatedSection.locator('h3 a');

  const count = await relatedLinks.count();

  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(5);

  // The current resource must not recommend itself.
  await expect(
    relatedLinks.filter({hasText: /^Autopsy$/})
  ).toHaveCount(0);

  // Follow a recommendation.
  const firstResourceName = await relatedLinks.first().textContent();

  await relatedLinks.first().click();

  // Confirm the recommended resource page opens.
  await expect(
    page.getByRole('heading', {
      name: firstResourceName?.trim(),
      exact: true,
      level: 1,
    })
  ).toBeVisible();
});
test('resources can be selected and compared', async ({page}) => {
  await page.goto('resources');

  await page.getByRole('checkbox', {name: 'Compare Autopsy', exact: true}).press('Space');
  await page.getByRole('checkbox', {name: 'Compare Volatility 3', exact: true}).press('Space');

  await page.getByRole('link', {
    name: 'Compare Selected Resources',
  }).press('Enter');

  await expect(page).toHaveURL(/compare\?ids=/);

  await expect(
    page.getByRole('heading', {
      name: 'Compare Resources',
      level: 1,
    })
  ).toBeVisible();

  await expect(
    page.getByRole('columnheader', {name: 'Autopsy', exact: true})
  ).toBeVisible();

  await expect(
    page.getByRole('columnheader', {name: 'Volatility 3', exact: true})
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole('columnheader', {name: 'Autopsy', exact: true})
  ).toBeVisible();

  await expect(
    page.getByRole('columnheader', {name: 'Volatility 3', exact: true})
  ).toBeVisible();
});
test('returning from resource details restores the catalogue query, filters and sort', async ({page, context}) => {
  await page.goto('resources?q=Autopsy&domain=Disk+Forensics&runsOn=Windows&sort=name-desc');
  const catalogueUrl = page.url();

  const autopsyCard = page.locator('.dfir-resource-card').filter({
    has: page.getByRole('link', {name: 'Autopsy', exact: true}),
  });
  await autopsyCard.getByRole('link', {name: 'View Details', exact: true}).click();
  await expect(page).toHaveURL(/resource\/autopsy\/?$/);
  const detailUrl = page.url();

  await page.reload();
  await page.getByRole('link', {name: 'Back to Browse Resources'}).click();
  await expect(page).toHaveURL(catalogueUrl);
  await expect(page.getByRole('searchbox', {name: 'Search resources'})).toHaveValue('Autopsy');
  await expect(page.getByRole('combobox', {name: 'Forensic Domain'})).toHaveValue('Disk Forensics');
  await expect(page.getByRole('combobox', {name: 'Sort resources by'})).toHaveValue('name-desc');

  const directPage = await context.newPage();
  await directPage.goto(detailUrl);
  await directPage.getByRole('link', {name: 'Back to Browse Resources'}).click();
  await expect(directPage).toHaveURL(/\/resources\/?$/);
  await expect(directPage.getByRole('searchbox', {name: 'Search resources'})).toHaveValue('');
});

for (const names of [
  ['DB Browser for SQLite', 'FQLite'],
  ['DB Browser for SQLite', 'FQLite', 'ALEAPP'],
]) {
  test(`returning from comparison restores the catalogue with ${names.length} selected resources`, async ({page, context}) => {
    await page.goto('resources?q=sqlite&artefact=SQLite+Databases&type=Tool&sort=name-desc');
    const catalogueUrl = page.url();

    for (const name of names) {
      await page.getByRole('checkbox', {name: `Compare ${name}`, exact: true}).press('Space');
    }

    await page.getByRole('link', {name: 'Compare Selected Resources'}).press('Enter');
    await expect(page).toHaveURL(/\/compare\?ids=[^&]+$/);
    const comparisonUrl = page.url();

    await page.reload();
    await page.getByRole('link', {name: 'Back to Browse Resources'}).click();
    await expect(page).toHaveURL(catalogueUrl);
    await expect(page.getByRole('searchbox', {name: 'Search resources'})).toHaveValue('sqlite');
    await expect(page.getByRole('combobox', {name: 'Artefact', exact: true})).toHaveValue('SQLite Databases');
    await expect(page.getByRole('combobox', {name: 'Resource Type'})).toHaveValue('Tool');
    await expect(page.getByRole('combobox', {name: 'Sort resources by'})).toHaveValue('name-desc');
    for (const name of names) {
      await expect(page.getByRole('checkbox', {name: `Compare ${name}`, exact: true})).toBeChecked();
    }

    const directPage = await context.newPage();
    await directPage.goto(comparisonUrl);
    await directPage.getByRole('link', {name: 'Back to Browse Resources'}).click();
    await expect(directPage).toHaveURL(/\/resources\/?$/);
    await expect(directPage.getByRole('checkbox', {checked: true})).toHaveCount(0);
  });
}

test('artefact discovery and catalogue navigation work', async ({page}) => {
  await page.goto('artefacts');

  await expect(
    page.getByRole('heading', {
      name: 'Browse Artefacts',
      level: 1,
    })
  ).toBeVisible();

  const searchBox = page.getByRole('searchbox', {
    name: 'Search artefacts',
  });

  await searchBox.fill('Memory Dumps');

  const artefactLink = page.getByRole('link', {
    name: /Memory Dumps/,
  });

  await expect(artefactLink).toHaveCount(1);
  await artefactLink.click();

  await expect(page).toHaveURL(/artefact=Memory(?:%20|\+)Dumps/);

  await expect(
    page.getByRole('combobox', {name: 'Artefact'})
  ).toHaveValue('Memory Dumps');

  await expect(
    page.locator('.dfir-resource-card').first()
  ).toBeVisible();
});
test('saved searches persist and restore filters', async ({page}) => {
  await page.goto('resources');

  const domainFilter = page.getByRole('combobox', {
    name: 'Forensic Domain',
  });

  const typeFilter = page.getByRole('combobox', {
    name: 'Resource Type',
  });

  await domainFilter.selectOption('Memory Forensics');
  await typeFilter.selectOption('Tool');

  await page.getByRole('textbox', {
    name: 'Saved search name',
  }).fill('Memory Analysis Tools');

  await page.getByRole('button', {
    name: 'Save Search',
    exact: true,
  }).click();

  const savedSearch = page.getByRole('button', {
    name: 'Memory Analysis Tools',
    exact: true,
  });

  await expect(savedSearch).toBeVisible();

  await page.reload();

  await expect(savedSearch).toBeVisible();

  await page.getByRole('button', {
    name: 'Clear Filters',
  }).click();

  await expect(domainFilter).toHaveValue('');
  await expect(typeFilter).toHaveValue('');

  await savedSearch.click();

  await expect(domainFilter).toHaveValue('Memory Forensics');
  await expect(typeFilter).toHaveValue('Tool');

  await page.getByRole('button', {
    name: 'Delete saved search Memory Analysis Tools',
  }).click();

  await expect(savedSearch).toHaveCount(0);

  await page.reload();

  await expect(savedSearch).toHaveCount(0);
});
test('removing a filter by keyboard restores focus and exposes the result count', async ({page}) => {
  await page.goto('resources?artefact=Prefetch');

  const results = page.getByRole('status').filter({hasText: 'Showing'});
  await expect(results).toHaveText(`Showing 1 of ${resourceData.length} resources`);

  const search = page.getByRole('searchbox', {name: 'Search resources'});
  await search.fill('no-match-audit-query');
  await expect(results).toHaveText(`Showing 0 of ${resourceData.length} resources`);
  await expect(search).toBeFocused();

  const chip = page.getByRole('button', {name: 'Remove Artefact: Prefetch'});
  await chip.press('Enter');
  await expect(chip).toHaveCount(0);
  await expect(page.getByRole('combobox', {name: 'Artefact', exact: true})).toBeFocused();
  await expect(search).toHaveValue('no-match-audit-query');
});
