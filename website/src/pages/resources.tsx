import React from 'react';
import {useHistory, useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import resourceData from '../data/resources.json';

type Resource = {
  id: string;
  name: string;
  description: string;
  website: string;
  type?: string[];
  domains?: string[];
  artefacts?: string[];
  runs_on?: string[];
  analyses?: string[];
  keywords?: string[];
  pricing?: {model?: string};
};

const resources = resourceData as Resource[];

type FilterField = 'type' | 'domains' | 'artefacts' | 'runs_on' | 'analyses';

function getOptions(field: FilterField): string[] {
  return Array.from(
    new Set(resources.flatMap((resource) => resource[field] ?? []))
  ).sort();
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label style={{display: 'block'}}>
      <strong>{label}</strong>
      <select
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

  // The URL is our single source of truth for all filters.
  const params = new URLSearchParams(location.search);
  const search = params.get('q') ?? '';
  const domain = params.get('domain') ?? '';
  const resourceType = params.get('type') ?? '';
  const artefact = params.get('artefact') ?? '';
  const runsOn = params.get('runsOn') ?? '';
  const analyses = params.get('analyses') ?? '';

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
      searchableText.includes(search.trim().toLowerCase()) &&
      (!domain || resource.domains?.includes(domain)) &&
      (!resourceType || resource.type?.includes(resourceType)) &&
      (!artefact || resource.artefacts?.includes(artefact)) &&
      (!runsOn || resource.runs_on?.includes(runsOn)) &&
      (!analyses || resource.analyses?.includes(analyses))
    );
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
          or resource type.
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
                label="Forensic Domain"
                value={domain}
                options={getOptions('domains')}
                onChange={(value) => updateUrlFilter('domain', value)}
              />
            </div>

            <div className="col col--4 margin-bottom--md">
              <FilterSelect
                label="Resource Type"
                value={resourceType}
                options={getOptions('type')}
                onChange={(value) => updateUrlFilter('type', value)}
              />
            </div>

            <div className="col col--4 margin-bottom--md">
              <FilterSelect
                label="Artefact"
                value={artefact}
                options={getOptions('artefacts')}
                onChange={(value) => updateUrlFilter('artefact', value)}
              />
            </div>

            <div className="col col--6 margin-bottom--md">
              <FilterSelect
                label="Runs On"
                value={runsOn}
                options={getOptions('runs_on')}
                onChange={(value) => updateUrlFilter('runsOn', value)}
              />
            </div>

            <div className="col col--6 margin-bottom--md">
              <FilterSelect
                label="Analyses"
                value={analyses}
                options={getOptions('analyses')}
                onChange={(value) => updateUrlFilter('analyses', value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="button button--secondary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <p>
          <strong>
            Showing {results.length} of {resources.length} resources
          </strong>
        </p>

        <div className="row">
          {results.map((resource) => (
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
                  <p className="dfir-card-platforms">
                    <strong>Runs on:</strong>{' '}
                    {(resource.runs_on ?? []).join(' · ') || 'Not specified'}
                  </p>

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
          <p>
            No resources match your filters. Try changing your selection or
            clearing the filters.
          </p>
        )}
      </main>
    </Layout>
  );
}
