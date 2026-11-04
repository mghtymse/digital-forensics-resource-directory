
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

type Resource = {
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


export default function ResourceDetail({
  resource,
}: {
  resource: Resource;
}) {
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

      </main>
    </Layout>
  );
}
