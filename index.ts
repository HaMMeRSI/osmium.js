import mainOsim from './osim-component';
import subOsim from './osim2-component';
import osimFileParser from './compiler/osim-file-parser';
import buildComponent from './compiler/template/build-component';

const mainOsimDocument = osimFileParser(mainOsim);
const subOsimDocument = osimFileParser(subOsim);

console.log(mainOsimDocument.template.imports);
console.log(buildComponent(mainOsimDocument.template.html));
