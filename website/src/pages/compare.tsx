import React from 'react';
import {useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {BackToCatalogueLink} from '../components/CatalogueLink';
import resourceData from '../data/resources.json';

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
  last_verified?: string | null;
};

const resources = resourceData as Resource[];

function formatList(items?: string[]) {
  return items?.length ? items.join(', ') : 'Not specified';
}

function yesNoUnknown(value?: boolean | null) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Unknown';
}

export default function ComparePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const ids = [...new Set(
    (params.get('ids') ?? '').split(',').filter(Boolean)
  )].slice(0, 3);

  const selected = ids
    .map((id) => resources.find((resource) => resource.id === id))
    .filter((resource): resource is Resource => resource !== undefined);

  const rows = [
    {label: 'Description', value: (r: Resource) => r.description},
    {label: 'Resource Type', value: (r: Resource) => formatList(r.type)},
    {label: 'Author / Creator', value: (r: Resource) => r.author || 'Unknown'},
    {label: 'Forensic Domains', value: (r: Resource) => formatList(r.domains)},
    {label: 'Runs On', value: (r: Resource) => formatList(r.runs_on)},
    {label: 'Analyses', value: (r: Resource) => formatList(r.analyses)},
    {label: 'Artefacts', value: (r: Resource) => formatList(r.artefacts)},
    {label: 'Keywords', value: (r: Resource) => formatList(r.keywords)},
    {label: 'Pricing', value: (r: Resource) => r.pricing?.model || 'Unknown'},
    {label: 'Commercial Use', value: (r: Resource) => yesNoUnknown(r.pricing?.commercial_use)},
    {label: 'Open Source', value: (r: Resource) => yesNoUnknown(r.open_source)},
    {label: 'Licence', value: (r: Resource) => r.licence || 'Not specified'},
    {label: 'Status', value: (r: Resource) => r.status || 'Unknown'},
    {label: 'Last Verified', value: (r: Resource) => r.last_verified || 'Not verified'},
  ];

  return (
    <Layout
      title="Compare Resources"
      description="Compare digital forensics resources side by side"
    >
      <main className="container margin-vert--lg dfir-compare-page">
        <BackToCatalogueLink />

        <h1 className="margin-top--md">Compare Resources</h1>

        <p>Compare capabilities and catalogue metadata side by side.</p>

        {selected.length < 2 ? (
          <p>
            Please select at least two valid resources from the catalogue.
          </p>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%'}}>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  {selected.map((resource) => (
                    <th key={resource.id} scope="col">
                      <Link to={`/resource/${resource.id}`}>
                        {resource.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {selected.map((resource) => (
                      <td key={resource.id}>
                        {row.value(resource)}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr>
                  <th scope="row">Website</th>
                  {selected.map((resource) => (
                    <td key={resource.id}>
                      <a
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Website ↗
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </Layout>
  );
}