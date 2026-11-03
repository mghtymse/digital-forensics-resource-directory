
import React from 'react';
import Layout from '@theme/Layout';

export default function Home() {
  return (
    <Layout
      title="Home"
      description="A curated directory of digital forensics resources"
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
              DIGITAL FORENSICS
            </p>
            <h1 style={{fontSize: '3rem'}}>
              Explore the DFIR Universe
            </h1>
            <p style={{fontSize: '1.2rem', maxWidth: 650, margin: '1rem auto'}}>
              A curated directory of tools, research, training,
              datasets, and other digital forensics resources.
            </p>
            <p>
              Discover resources by forensic discipline, platform,
              artefact, and purpose.
            </p>
          </div>
        </header>

        <section className="container margin-vert--xl">
          <h2 style={{textAlign: 'center'}}>
            Explore Resources
          </h2>

          <div className="row">
            {[
              {
                title: 'Tools & Software',
                description:
                  'Find forensic applications, frameworks, scripts, and utilities.',
              },
              {
                title: 'Research & Learning',
                description:
                  'Explore documentation, blogs, articles, and training materials.',
              },
              {
                title: 'Evidence & Datasets',
                description:
                  'Discover sample evidence, datasets, and practical challenges.',
              },
            ].map((item) => (
              <div className="col col--4 margin-bottom--lg" key={item.title}>
                <div
                  style={{
                    padding: '1.5rem',
                    height: '100%',
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '12px',
                  }}
                >
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
