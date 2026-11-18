
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import resources from '../data/resources.json';

type Resource = {
  id: string;
  name: string;
  description: string;
  website: string;
  repository?: string;
  author?: string;
  type?: string[];
  domains?: string[];
  runs_on?: string[];
  analyses?: string[];
  artefacts?: string[];
  keywords?: string[];
  pricing?: {
    model?: string;
    commercial_use?: boolean | null;
  };
  open_source?: boolean | null;
  licence?: string;
  status?: string;
  last_verified?: string;
};


function InformationSection({
  title,
  items,
  filterParam,
}: {
  title: string;
  items?: string[];
  filterParam?: string;
}) {
  if (!items?.length) return null;

  return (
    <section className="margin-bottom--lg">
      <h2>{title}</h2>

      <div className="dfir-detail-tags">
        {items.map((item) =>
          filterParam ? (
            <Link
              key={item}
              to={`/resources?${filterParam}=${encodeURIComponent(item)}`}
              className="dfir-resource-chip dfir-resource-chip--link"
              title={`Find resources matching ${item}`}
            >
              {item} ↗
            </Link>
          ) : (
            <span
              key={item}
              className="dfir-resource-chip"
            >
              {item}
            </span>
          )
        )}
      </div>
    </section>
  );
}

function yesNoUnknown(value?: boolean | null) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Unknown';
}
// Score how closely two resources are related.
function relatedResourceScore(
  current: Resource,
  candidate: Resource
): number {
  const fields: {
    key: 'artefacts' | 'domains' | 'keywords' |
         'analyses' | 'runs_on' | 'type';
    weight: number;
  }[] = [
    {key: 'artefacts', weight: 5},
    {key: 'domains', weight: 4},
    {key: 'keywords', weight: 3},
    {key: 'analyses', weight: 2},
    {key: 'runs_on', weight: 1},
    {key: 'type', weight: 1},
  ];

  return fields.reduce((score, {key, weight}) => {
    const currentValues = new Set(
      (current[key] ?? []).map((value) => value.toLowerCase())
    );

    const matches = (candidate[key] ?? []).filter(
      (value) => currentValues.has(value.toLowerCase())
    );

    return score + matches.length * weight;
  }, 0);
}

export default function ResourceDetail({
  resource,
}: {
  resource: Resource;
}) {
    // Find the five highest-scoring related resources.
  const relatedResources = resources
    .filter((candidate) => candidate.id !== resource.id)
    .map((candidate) => ({
      resource: candidate,
      score: relatedResourceScore(resource, candidate),
    }))
    .filter(({score}) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.resource.name.localeCompare(b.resource.name)
    )
    .slice(0, 5);
  const softwareTypes = new Set([
    'Tool',
    'Tool Suite',
    'Forensic Suite',
    'Script',
    'Library / Framework',
    'Plugin / Extension',
  ]);

  const isSoftware = (resource.type ?? []).some(
    (type) => softwareTypes.has(type)
  );

  const showCommercialUse =
    isSoftware || resource.pricing?.commercial_use != null;

  const showOpenSource =
    isSoftware || resource.open_source != null;

  const showLicence =
    isSoftware || Boolean(resource.licence?.trim());

  return (

    <Layout title={resource.name} description={resource.description}>
      <main className="container margin-vert--lg">
        <Link to="/resources">← Back to Browse Resources</Link>

        <header className="margin-vert--lg">
          <h1>{resource.name}</h1>
          <p style={{fontSize: '1.2rem'}}>
            {resource.description}
          </p>
        </header>

        <div className="margin-bottom--lg">
          <a
            className="button button--primary margin-right--sm"
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Website
          </a>

          {resource.repository && (
            <a
              className="button button--secondary"
              href={resource.repository}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Repository
            </a>
          )}
        </div>

        
<InformationSection
  title="Resource Type"
  items={resource.type}
  filterParam="type"
/>

<InformationSection
  title="Forensic Domains"
  items={resource.domains}
  filterParam="domain"
/>

<InformationSection
  title="Runs On"
  items={resource.runs_on}
  filterParam="runsOn"
/>

<InformationSection
  title="Analyses"
  items={resource.analyses}
  filterParam="analyses"
/>

<InformationSection
  title="Artefacts"
  items={resource.artefacts}
  filterParam="artefact"
/>

<InformationSection
  title="Keywords"
  items={resource.keywords}
  filterParam="keyword"
/>

        <h2>Additional Information</h2>
      
<table>
  <tbody>
    <tr>
      <th scope="row">Author / Creator</th>
      <td>{resource.author || 'Unknown'}</td>
    </tr>

    <tr>
      <th scope="row">Pricing</th>
      <td>{resource.pricing?.model || 'Unknown'}</td>
    </tr>

    {showCommercialUse && (
      <tr>
        <th scope="row">Commercial Use</th>
        <td>
          {yesNoUnknown(resource.pricing?.commercial_use)}
        </td>
      </tr>
    )}

    {showOpenSource && (
      <tr>
        <th scope="row">Open Source</th>
        <td>{yesNoUnknown(resource.open_source)}</td>
      </tr>
    )}

    {showLicence && (
      <tr>
        <th scope="row">Licence</th>
        <td>{resource.licence || 'Not specified'}</td>
      </tr>
    )}

    <tr>
      <th scope="row">Status</th>
      <td>{resource.status || 'Unknown'}</td>
    </tr>

    <tr>
      <th scope="row">Last Verified</th>
      <td>{resource.last_verified || 'Not verified'}</td>
    </tr>
  </tbody>
</table>
        {relatedResources.length > 0 && (
          <section
            className="margin-top--lg margin-bottom--lg"
            aria-labelledby="related-resources-heading"
          >
            <h2 id="related-resources-heading">
              Related Resources
            </h2>

            <p>
              Explore other resources with similar forensic
              domains, artefacts, platforms or keywords.
            </p>

            <div className="row">
              {relatedResources.map(({resource: related}) => (
                <div
                  key={related.id}
                  className="col col--6 margin-bottom--md"
                >
                  <div className="card">
                    <div className="card__body">
                      <h3>
                        <Link to={`/resource/${related.id}`}>
                          {related.name}
                        </Link>
                      </h3>

                      <p>{related.description}</p>

                      <Link to={`/resource/${related.id}`}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
