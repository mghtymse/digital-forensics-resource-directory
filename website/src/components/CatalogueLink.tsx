import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useHistory, useLocation} from '@docusaurus/router';

type CatalogueContext = {
  search: string;
  selectedResources: string[];
};

export type CatalogueNavigationState = {
  catalogueContext?: CatalogueContext;
};

export function CatalogueLink({
  to,
  catalogueContext,
  className,
  title,
  children,
}: {
  to: string;
  catalogueContext?: CatalogueContext;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  const history = useHistory<CatalogueNavigationState>();

  return (
    <Link
      to={to}
      className={className}
      title={title}
      onClick={(event) => {
        // Keep context on this history entry, while allowing ordinary links in new tabs.
        if (
          !catalogueContext || event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
        ) {
          return;
        }

        event.preventDefault();
        const {pathname, search, hash} = event.currentTarget;
        history.push({pathname, search, hash, state: {catalogueContext}});
      }}
    >
      {children}
    </Link>
  );
}

export function BackToCatalogueLink() {
  const {state} = useLocation<CatalogueNavigationState>();
  const catalogueContext = useIsBrowser() ? state?.catalogueContext : undefined;

  return (
    <CatalogueLink
      to={`/resources${catalogueContext?.search ?? ''}`}
      catalogueContext={catalogueContext}
    >
      ← Back to Browse Resources
    </CatalogueLink>
  );
}
