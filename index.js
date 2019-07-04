// const osimComp = require('./osmium-component.js');
// const osim = require('./osmium.js').init;

// osim(osimComp);
const mainOsim = require('./osim-component.js');
const subOsim = require('./osim2-component.js');
const parse5 = require('parse5');
const osimDocumentParser = require('./compiler/osim-file-parser');
const osimExtractImports = require('./compiler/template/extract-imports');
const buildComponent = require('./compiler/template/build-component');

const mainOsimDocument = osimDocumentParser(mainOsim);
const subOsimDocument = osimDocumentParser(subOsim);

const hast = parse5.parseFragment(mainOsimDocument.template);
const { imports, components } = osimExtractImports(hast);

console.log(imports);
console.log(buildComponent(hast));
