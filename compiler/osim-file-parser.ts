import processTemplate, { ITemplateObject } from './template/process-template-imports';

interface IOsimDocument {
	template: ITemplateObject;
	script: string;
	style: string;
}

function extractPart(part, osim): string {
	part = part.toLowerCase();
	const loweredOsim = osim.toLowerCase();
	const start = loweredOsim.indexOf(`<${part}>`) + `<${part}>`.length;
	const end = loweredOsim.indexOf(`</${part}>`);

	return osim.substring(start, end);
}

export default (component): IOsimDocument => {
	return {
		template: processTemplate(extractPart('template', component)),
		script: extractPart('script', component),
		style: extractPart('style', component),
	};
};
