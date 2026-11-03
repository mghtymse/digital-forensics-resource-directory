
import fs from 'node:fs';
import path from 'node:path';

export default function resourcePagesPlugin(context) {
  return {
    name: 'dfir-resource-pages',

    async loadContent() {
      const file = path.join(
        context.siteDir,
        'src',
        'data',
        'resources.json'
      );

      return JSON.parse(fs.readFileSync(file, 'utf8'));
    },

    async contentLoaded({content, actions}) {
      const {createData, addRoute} = actions;

      for (const resource of content) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resource.id)) {
          throw new Error(`Invalid resource ID: ${resource.id}`);
        }

        const dataPath = await createData(
          `resource-${resource.id}.json`,
          JSON.stringify(resource)
        );

        addRoute({
          path: `/resource/${resource.id}`,
          component: '@site/src/components/ResourceDetail.tsx',
          modules: {
            resource: dataPath,
          },
          exact: true,
        });
      }
    },
  };
}
