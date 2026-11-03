
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import YAML from 'yaml';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const websiteDir = path.resolve(scriptDir, '..');
const projectDir = path.resolve(websiteDir, '..');

const resourcesDir = path.join(projectDir, 'resources');
const outputFile = path.join(
  websiteDir,
  'src',
  'data',
  'resources.json'
);

const files = fs.readdirSync(resourcesDir)
  .filter((file) => /\.ya?ml$/i.test(file))
  .sort();

const resources = files.map((file) => {
  const content = fs.readFileSync(
    path.join(resourcesDir, file),
    'utf8'
  );

  const resource = YAML.parse(content);

  if (
    !resource ||
    typeof resource !== 'object' ||
    !resource.name ||
    !resource.website
  ) {
    throw new Error(`Invalid resource record: ${file}`);
  }

  return {
    ...resource,
    id: path.basename(file, path.extname(file)),
  };
});

resources.sort((a, b) =>
  a.name.localeCompare(b.name)
);

fs.mkdirSync(path.dirname(outputFile), {recursive: true});

fs.writeFileSync(
  outputFile,
  JSON.stringify(resources, null, 2) + '\n',
  'utf8'
);

console.log(
  `Generated ${resources.length} resources in src/data/resources.json`
);
