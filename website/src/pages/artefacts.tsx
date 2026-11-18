import React, {useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import resourceData from '../data/resources.json';

type Resource = {
  id: string;
  name: string;
  artefacts?: string[];
};

const resources = resourceData as Resource[];

const artefactCounts = new Map<string, number>();

for (const resource of resources) {
  for (const artefact of new Set(resource.artefacts ?? [])) {
    artefactCounts.set(
      artefact,
      (artefactCounts.get(artefact) ?? 0) + 1
    );
  }
}

const artefacts = Array.from(
  artefactCounts,
  ([name, count]) => ({name, count})
);

export default function ArtefactsPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name-asc');

  const results = artefacts
    .filter((artefact) =>
      artefact.name.toLowerCase().includes(
        search.trim().toLowerCase()
      )
    )
    .sort((a, b) => {
      if (sort === 'count-desc') {
        return b.count - a.count ||
          a.name.localeCompare(b.name);
      }

      if (sort === 'name-desc') {
        return b.name.localeCompare(a.name);
      }

      return a.name.localeCompare(b.name);
    });

  return (
    <Layout
      title="Browse Artefacts"
      description="Discover digital forensics resources by artefact"
    >
      <main className="container margin-vert--lg">
        <h1>Browse Artefacts</h1>

        <p>
          Discover tools, datasets and other forensic resources
          associated with specific digital artefacts.
        </p>

        <div className="row margin-bottom--lg">
          <div className="col col--8">
            <label>
              <strong>Search artefacts</strong>
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search artefacts..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '0.35rem',
                }}
              />
            </label>
          </div>

          <div className="col col--4">
            <label>
              <strong>Sort artefacts by</strong>
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '0.35rem',
                }}
              >
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="count-desc">Most resources</option>
              </select>
            </label>
          </div>
        </div>

        <p>
          <strong>
            Showing {results.length} of {artefacts.length} artefacts
          </strong>
        </p>

        <div className="row">
          {results.map((artefact) => (
            <div
              key={artefact.name}
              className="col col--4 margin-bottom--lg"
            >
              <Link
                to={`/resources?artefact=${encodeURIComponent(artefact.name)}`}
                style={{
                  display: 'block',
                  height: '100%',
                  padding: '1.25rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                }}
              >
                <h3>{artefact.name}</h3>

                <p>
                  {artefact.count}{' '}
                  {artefact.count === 1 ? 'resource' : 'resources'}
                </p>

                Browse resources →
              </Link>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <p>No artefacts match your search.</p>
        )}
      </main>
    </Layout>
  );
}