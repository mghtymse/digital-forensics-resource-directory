import React, {useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useHistory} from '@docusaurus/router';
import resourceData from '../data/resources.json';

type ResourceSummary = {
  domains?: string[];
};

const resources = resourceData as ResourceSummary[];
const DOMAIN_SHORTCUT_LIMIT = 6;

// Count each resource once per domain. Both names and counts come from the
// generated catalogue, so there is no separate list to maintain.
const domainCounts = new Map<string, number>();

for (const resource of resources) {
  for (const domain of new Set(resource.domains ?? [])) {
    domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1);
  }
}

// Show the most represented domains first, with alphabetical tie-breaking.
const featuredDomains = Array.from(domainCounts, ([name, count]) => ({
  name,
  count,
}))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  .slice(0, DOMAIN_SHORTCUT_LIMIT);

export default function Home() {
  const [query, setQuery] = useState('');
  const history = useHistory();

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    history.push(term ? `/resources?q=${encodeURIComponent(term)}` : '/resources');
  }

  return (
    <Layout
      title="Home"
      description="A curated, searchable directory of digital forensics resources"
    >
      <main>
        <header
          style={{
            padding: '5rem 1rem',
            textAlign: 'center',
            background: 'var(--ifm-background-surface-color)',
          }}
        >
          <div className="container">
            <p style={{fontWeight: 700, letterSpacing: '0.15em'}}>
              DIGITAL FORENSICS RESOURCE DIRECTORY
            </p>
            <h1 style={{fontSize: 'clamp(2rem, 5vw, 3.25rem)'}}>
              Explore the DFIR Universe
            </h1>
            <p style={{fontSize: '1.15rem', maxWidth: 680, margin: '1rem auto 2rem'}}>
              Discover curated tools, research, training, sample evidence, and
              other digital forensics resources.
            </p>

            <form
              onSubmit={handleSearch}
              role="search"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                justifyContent: 'center',
                maxWidth: 650,
                margin: '0 auto 1.25rem',
              }}
            >
              <input
                id="homepage-resource-search"
                aria-label="Search digital forensics resources"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools, artefacts, keywords..."
                style={{
                  flex: '1 1 280px',
                  minWidth: 0,
                  padding: '0.8rem',
                  border: '1px solid var(--ifm-color-emphasis-400)',
                  borderRadius: 6,
                }}
              />
              <button className="button button--primary" type="submit">
                Search Resources
              </button>
            </form>
            <Link to="/resources" className="button button--secondary">
              Browse All Resources
            </Link>
          </div>
        </header>

        <section className="container margin-vert--xl" aria-labelledby="explore-domains">
          <h2 id="explore-domains" style={{textAlign: 'center'}}>
            Explore by Forensic Domain
          </h2>
          <p style={{textAlign: 'center', marginBottom: '2rem'}}>
            {domainCounts.size > DOMAIN_SHORTCUT_LIMIT
              ? `Showing the ${DOMAIN_SHORTCUT_LIMIT} most represented of ${domainCounts.size} domains.`
              : 'Browse domains represented in the directory.'}
          </p>

          {featuredDomains.length > 0 ? (
            <div className="row">
              {featuredDomains.map((domain) => (
                <div className="col col--4 margin-bottom--lg" key={domain.name}>
                  <article
                    style={{
                      height: '100%',
                      padding: '1.5rem',
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      borderRadius: 12,
                      background: 'var(--ifm-background-surface-color)',
                    }}
                  >
                    <h3>{domain.name}</h3>
                    <p>
                      {domain.count} {domain.count === 1 ? 'resource' : 'resources'}
                    </p>
                    <Link to={`/resources?domain=${encodeURIComponent(domain.name)}`}>
                      Explore {domain.name} →
                    </Link>
                  </article>
                </div>
              ))}
            </div>
          ) : (
            <p style={{textAlign: 'center'}}>
              Domain shortcuts will appear once resources are classified.
            </p>
          )}

          <p style={{textAlign: 'center'}}>
            <Link to="/resources">Browse all resources and domains →</Link>
          </p>
        </section>
      </main>
    </Layout>
  );
}
