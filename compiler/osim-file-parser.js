function extractPart(part, osim) {
	part = part.toLowerCase();
	const loweredOsim = osim.toLowerCase();
	const start = loweredOsim.indexOf(`<${part}>`) + '<>'.length;
	const end = loweredOsim.indexOf(`</${part}>`);

	return osim.substring(start, end);
}

export default () => {
	return {
		template: extractPart('template', mainOsim),
		script: extractPart('script', mainOsim),
		style: extractPart('style', mainOsim),
	};
};
