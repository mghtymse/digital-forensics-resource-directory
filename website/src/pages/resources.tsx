import React, {useState, useEffect, useRef} from 'react';
import {useHistory, useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import resourceData from '../data/resources.json';

type Resource = {
  id: string;
  name: string;
  description: string;
  website: string;
  author?: string;
  type?: string[];
  domains?: string[];
  artefacts?: string[];
  runs_on?: string[];
  analyses?: string[];
  keywords?: string[];
  pricing?: {model?: string};
    last_verified?: string | null;
};

const resources = resourceData as Resource[];

type SavedSearch = {
  id: string;
  name: string;
  query: string;
};

const SAVED_SEARCHES_KEY = 'dfir-saved-searches';

type FilterField = 'type' | 'domains' | 'artefacts' | 'runs_on' | 'analyses' | 'keywords';

function getOptions(field: FilterField): string[] {
  return Array.from(
    new Set(resources.flatMap((resource) => resource[field] ?? []))
  ).sort();
}

function FilterSelect({
  filterKey,
  label,
  value,
  options,
  onChange,
}: {
  filterKey: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label style={{display: 'block'}}>
      <strong>{label}</strong>
      <select
        id={`catalogue-filter-${filterKey}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginTop: '0.35rem',
        }}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ResourcesPage() {
  const location = useLocation();
  const history = useHistory();
  const filterToFocus = useRef<string | null>(null);

  useEffect(() => {
    if (filterToFocus.current !== null) {
      document.getElementById(`catalogue-filter-${filterToFocus.current}`)?.focus();
      filterToFocus.current = null;
    }
  }, [location.search]);

  const [selectedResources, setSelectedResources] = useState<string[]>([]);
const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
const [savedSearchName, setSavedSearchName] = useState('');
const [shareMessage, setShareMessage] = useState('');

useEffect(() => {
  try {
    const stored = localStorage.getItem(SAVED_SEARCHES_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setSavedSearches(parsed);
      }
    }
  } catch {
    console.warn('Unable to load saved searches.');
  }
}, []);
  const maxComparisonResources = 3;

  function toggleComparison(resourceId: string) {
    setSelectedResources((current) => {
      if (current.includes(resourceId)) {
        return current.filter((id) => id !== resourceId);
      }

      if (current.length >= maxComparisonResources) {
        return current;
      }

      return [...current, resourceId];
    });
  }

  function clearComparison() {
    setSelectedResources([]);
  }
  function updateSavedSearches(updated: SavedSearch[]) {
  try {
    localStorage.setItem(
      SAVED_SEARCHES_KEY,
      JSON.stringify(updated)
    );

    setSavedSearches(updated);
    return true;
  } catch {
    setShareMessage('Unable to store saved searches.');
    return false;
  }
}

function saveCurrentSearch() {
  const name = savedSearchName.trim();

  if (!name) {
    setShareMessage('Please enter a name for your search.');
    return;
  }

  const newSearch: SavedSearch = {
    id: crypto.randomUUID(),
    name,
    query: location.search,
  };

  if (updateSavedSearches([...savedSearches, newSearch])) {
    setSavedSearchName('');
    setShareMessage('Search saved successfully.');
  }
}

function openSavedSearch(saved: SavedSearch) {
  history.push({
    pathname: location.pathname,
    search: saved.query,
  });

  setShareMessage(`Loaded: ${saved.name}`);
}

function deleteSavedSearch(id: string) {
  if (
    updateSavedSearches(
      savedSearches.filter((saved) => saved.id !== id)
    )
  ) {
    setShareMessage('Saved search removed.');
  }
}

async function copyFilterLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    setShareMessage('Filter link copied to clipboard.');
  } catch {
    setShareMessage('Unable to copy. Copy the browser address instead.');
  }
}
  // The URL is our single source of truth for all filters.
  const params = new URLSearchParams(location.search);
  const search = params.get('q') ?? '';
  const domain = params.get('domain') ?? '';
  const resourceType = params.get('type') ?? '';
  const artefact = params.get('artefact') ?? '';
  const keyword = params.get('keyword') ?? '';
  const runsOn = params.get('runsOn') ?? '';
  const analyses = params.get('analyses') ?? '';
      const sort = params.get('sort') ?? (search.trim() ? 'relevance' : 'name-asc');

  const activeFilters = [
    {key: 'q', label: 'Search', value: search},
    {key: 'domain', label: 'Domain', value: domain},
    {key: 'type', label: 'Resource Type', value: resourceType},
    {key: 'artefact', label: 'Artefact', value: artefact},
    {key: 'keyword', label: 'Keyword', value: keyword},
    {key: 'runsOn', label: 'Runs On', value: runsOn},
    {key: 'analyses', label: 'Analyses', value: analyses},
  ].filter((filter) => filter.value !== '');

  function updateUrlFilter(key: string, value: string, replace = false) {
    const nextParams = new URLSearchParams(location.search);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    const query = nextParams.toString();
    const destination = {
      pathname: location.pathname,
      search: query ? `?${query}` : '',
    };

    if (replace) {
      history.replace(destination);
    } else {
      history.push(destination);
    }
  }

  function clearFilters() {
    history.push({pathname: location.pathname, search: ''});
  }
  // Split the search into individual, case-insensitive terms.
  const searchTerms = search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

      // Calculate how closely each resource matches the search terms.
  function relevanceScore(resource: (typeof resources)[number]): number {
    if (searchTerms.length === 0) return 0;

    const fields = [
      {text: resource.name, weight: 10},
      {text: (resource.keywords ?? []).join(' '), weight: 6},
      {text: (resource.artefacts ?? []).join(' '), weight: 5},
      {text: (resource.domains ?? []).join(' '), weight: 4},
      {text: resource.description ?? '', weight: 2},
      {text: (resource.type ?? []).join(' '), weight: 1},
      {text: (resource.runs_on ?? []).join(' '), weight: 1},
      {text: (resource.analyses ?? []).join(' '), weight: 1},
    ];

    return searchTerms.reduce((score, term) => {
      return (
        score +
        fields.reduce((termScore, field) => {
          return (
            termScore +
            (field.text.toLowerCase().includes(term) ? field.weight : 0)
          );
        }, 0)
      );
    }, 0);
  }

  const results = resources.filter((resource) => {
    const searchableText = [
      resource.name,
      resource.description,
      ...(resource.type ?? []),
      ...(resource.domains ?? []),
      ...(resource.artefacts ?? []),
      ...(resource.runs_on ?? []),
      ...(resource.analyses ?? []),
      ...(resource.keywords ?? []),
    ]
      .join(' ')
      .toLowerCase();

    return (
      searchTerms.every((term) => searchableText.includes(term)) &&
      (!domain || resource.domains?.includes(domain)) &&
      (!resourceType || resource.type?.includes(resourceType)) &&
      (!artefact || resource.artefacts?.includes(artefact)) &&
      (!keyword || resource.keywords?.includes(keyword)) &&
      (!runsOn || resource.runs_on?.includes(runsOn)) &&
      (!analyses || resource.analyses?.includes(analyses))
    );
  });

  const sortedResults = [...results].sort((a, b) => {
    const nameComparison = a.name.localeCompare(b.name);

        switch (sort) {
      case 'relevance':
        return relevanceScore(b) - relevanceScore(a) || nameComparison;

      case 'name-desc':
        return -nameComparison;

      case 'verified-newest':
      case 'verified-oldest': {
        const aDate = a.last_verified ?? '';
        const bDate = b.last_verified ?? '';

        // Resources without verification dates appear last.
        if (!aDate && !bDate) return nameComparison;
        if (!aDate) return 1;
        if (!bDate) return -1;

        const dateComparison = aDate.localeCompare(bDate);

        return (
          (sort === 'verified-newest'
            ? -dateComparison
            : dateComparison) || nameComparison
        );
      }

      case 'type-asc':
        return (
          (a.type?.[0] ?? '').localeCompare(b.type?.[0] ?? '') ||
          nameComparison
        );

      case 'name-asc':
      default:
        return nameComparison;
    }
  });

  return (
    <Layout
      title="Browse Resources"
      description="Search the digital forensics resource directory"
    >
      <main className="container margin-vert--lg">
        <h1>Browse Resources</h1>
        <p>
          Find digital forensics resources by discipline, artefact, platform,
          resource type, or keyword.
        </p>

        <div
          style={{
            padding: '1.5rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '12px',
            marginBottom: '2rem',
          }}
        >
          <label style={{display: 'block', marginBottom: '1rem'}}>
            <strong>Search resources</strong>
            <input
              id="catalogue-filter-q"
              type="search"
              value={search}
              onChange={(event) =>
                updateUrlFilter('q', event.target.value, true)
              }
              placeholder="Search tools, artefacts, keywords..."
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.35rem',
              }}
            />
          </label>

          <div className="row">
            <div className="col col--4 margin-bottom--md">
              <FilterSelect
                filterKey="domain"
                label="Forensic Domain"
                value={domain}
                options={getOptions('domains')}
                onChange={(value) => updateUrlFilter('domain', value)}
              />
            </div>

            <div className="col col--4 margin-bottom--md">
              <FilterSelect
                filterKey="type"
                label="Resource Type"
                value={resourceType}
                options={getOptions('type')}
                onChange={(value) => updateUrlFilter('type', value)}
              />
            </div>

            <div className="col col--4 margin-bottom--md">
              <FilterSelect
                filterKey="artefact"
                label="Artefact"
                value={artefact}
                options={getOptions('artefacts')}
                onChange={(value) => updateUrlFilter('artefact', value)}
              />
            </div>

            <div className="col col--4 margin-bottom--md">
              <FilterSelect
                filterKey="keyword"
                label="Keyword"
                value={keyword}
                options={getOptions('keywords')}
                onChange={(value) => updateUrlFilter('keyword', value)}
              />
            </div>

            <div className="col col--6 margin-bottom--md">
              <FilterSelect
                filterKey="runsOn"
                label="Runs On"
                value={runsOn}
                options={getOptions('runs_on')}
                onChange={(value) => updateUrlFilter('runsOn', value)}
              />
            </div>

            <div className="col col--6 margin-bottom--md">
              <FilterSelect
                filterKey="analyses"
                label="Analyses"
                value={analyses}
                options={getOptions('analyses')}
                onChange={(value) => updateUrlFilter('analyses', value)}
              />
            </div>
          </div>

          <label
            style={{
              display: 'block',
              marginBottom: '1rem',
              maxWidth: '350px',
            }}
          >
            <strong>Sort resources by</strong>
            <select
              value={sort}
              onChange={(event) =>
                updateUrlFilter(
                  'sort',
                  event.target.value === 'name-asc'
                    ? ''
                    : event.target.value
                )
              }
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.35rem',
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="verified-newest">
                Recently verified (newest first)
              </option>
              <option value="verified-oldest">
                Recently verified (oldest first)
              </option>
              <option value="type-asc">Resource type (A–Z)</option>
            </select>
          </label>

          <button
            type="button"
            className="button button--secondary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
        <section
  aria-label="Saved searches"
  style={{
    padding: '1rem',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  }}
>
  <h3>Save & Share Searches</h3>

  <p>Save your current filters or share them with others.</p>

  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'center',
    }}
  >
    <input
      type="text"
      aria-label="Saved search name"
      placeholder="Name your search..."
      value={savedSearchName}
      onChange={(event) =>
        setSavedSearchName(event.target.value)
      }
      style={{
        padding: '0.75rem',
        flex: '1 1 200px',
        minWidth: 0,
      }}
    />

    <button
      type="button"
      className="button button--primary"
      onClick={saveCurrentSearch}
    >
      Save Search
    </button>

    <button
      type="button"
      className="button button--secondary"
      onClick={copyFilterLink}
    >
      Copy Filter Link
    </button>
  </div>

  {shareMessage && (
    <p role="status" className="margin-top--md">
      {shareMessage}
    </p>
  )}

  {savedSearches.length > 0 && (
    <div className="margin-top--md">
      <h4>Saved Searches ({savedSearches.length})</h4>

      {savedSearches.map((saved) => (
        <div
          key={saved.id}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          <button
            type="button"
            className="button button--secondary"
            onClick={() => openSavedSearch(saved)}
          >
            {saved.name}
          </button>

          <button
            type="button"
            className="button button--outline button--danger"
            onClick={() => deleteSavedSearch(saved.id)}
            aria-label={`Delete saved search ${saved.name}`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )}
</section>
{selectedResources.length > 0 && (
  <section
    aria-label="Resource comparison"
    style={{
      padding: '1rem',
      border: '1px solid var(--ifm-color-primary)',
      borderRadius: '12px',
      marginBottom: '1.5rem',
    }}
  >
    <h3>
      Compare Resources ({selectedResources.length}/3)
    </h3>

    <ul>
      {selectedResources.map((id) => (
        <li key={id}>
          {resources.find((resource) => resource.id === id)?.name}
          {' '}
          <button
            type="button"
            onClick={() => toggleComparison(id)}
            aria-label={`Remove ${id} from comparison`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>

    {selectedResources.length >= 2 ? (
      <Link
        className="button button--primary"
        to={`/compare?ids=${selectedResources.join(',')}`}
      >
        Compare Selected Resources
      </Link>
    ) : (
      <p>Select at least two resources to compare.</p>
    )}

    {' '}

    <button
      type="button"
      className="button button--secondary"
      onClick={clearComparison}
    >
      Clear Selection
    </button>
  </section>
)}
        {activeFilters.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <strong>Active filters:</strong>

            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="button button--secondary button--sm"
                onClick={(event) => {
                  if (event.detail === 0) {
                    filterToFocus.current = filter.key;
                  }
                  updateUrlFilter(filter.key, '');
                }}
                aria-label={`Remove ${filter.label}: ${filter.value}`}
                title={`Remove ${filter.label} filter`}
              >
                {filter.label}: {filter.value} ×
              </button>
            ))}
          </div>
        )}

        <p role="status" aria-atomic="true">
          <strong>
            Showing {results.length} of {resources.length} resources
          </strong>
        </p>

        <div className="row">
          {sortedResults.map((resource) => (
            <div
              key={resource.id}
              className="col col--6 margin-bottom--lg"
            >
              <article className="dfir-resource-card">
                <div className="dfir-card-top">
                  <div>
                    <h2>
                      <Link to={`/resource/${resource.id}`}>
                        {resource.name}
                      </Link>
                    </h2>
                    <div className="dfir-card-type">
                      {(resource.type ?? []).join(' · ') || 'Resource'}
                    </div>
                  </div>
                  <span className="dfir-card-pricing">
                    {resource.pricing?.model ?? 'Unknown'}
                  </span>
                </div>

                <p className="dfir-card-description">{resource.description}</p>

                <div className="dfir-card-tags">
                  {(resource.domains ?? []).slice(0, 3).map((item) => (
                    <Link
                      key={item}
                      to={`/resources?domain=${encodeURIComponent(item)}`}
                      className="dfir-resource-chip dfir-resource-chip--link"
                      title={`Browse all ${item} resources`}
                    >
                      {item}
                    </Link>
                  ))}

                  {(resource.domains?.length ?? 0) > 3 && (
                    <Link
                      to={`/resource/${resource.id}`}
                      className="dfir-resource-chip dfir-resource-chip--more"
                      title={(resource.domains ?? []).slice(3).join(', ')}
                    >
                      +{resource.domains!.length - 3}{' '}
                      {resource.domains!.length - 3 === 1
                        ? 'more domain'
                        : 'more domains'}
                    </Link>
                  )}
                </div>

                <div className="dfir-card-bottom">
                  
{(resource.runs_on?.length ?? 0) > 0 ? (
  <p className="dfir-card-platforms">
    <strong>Runs on:</strong>{' '}
    {resource.runs_on!.join(' · ')}
  </p>
) : resource.author ? (
  <p className="dfir-card-platforms">
    <strong>Creator:</strong>{' '}
    {resource.author}
  </p>
) : null}
<label
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  }}
>
  <input
    type="checkbox"
    aria-label={`Compare ${resource.name}`}
    checked={selectedResources.includes(resource.id)}
    disabled={
      selectedResources.length >= maxComparisonResources &&
      !selectedResources.includes(resource.id)
    }
    onChange={() => toggleComparison(resource.id)}
  />
  Compare
</label>
                  <div className="dfir-card-actions">
                    <Link
                      className="button button--primary"
                      to={`/resource/${resource.id}`}
                    >
                      View Details
                    </Link>
                    <a
                      className="button button--secondary"
                      href={resource.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website ↗
                    </a>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>

        
        {results.length === 0 && (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '12px',
              marginTop: '1rem',
            }}
          >
            <h2>No matching resources found</h2>

            <p>
              Try adjusting your search terms or removing some filters
              to find more resources.
            </p>

            <button
              type="button"
              className="button button--primary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}

      </main>
    </Layout>
  );
}