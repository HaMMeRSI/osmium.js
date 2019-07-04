const hp = require('htmlparser2');

const osimNode2 = (template) => {
	const handler = new hp.DomHandler((err, dom) => {
		if (err) console.error(err);
		else {
			dom.forEach((child) => {
				for (attr in child.attribs) {
				}
			});
		}
	});

	const parser = new hp.Parser(handler);
	parser.write(template);
	parser.done();
};

const osimNode = (template) => {
	const nodeData = {};
	const matches = template.match(/\$\[.*?\]/g);

	const params = matches.reduce((acc, match) => {
		const strippedMatch = match.replace('$[', '').replace(']', '');
		nodeData[strippedMatch] = '';

		acc[strippedMatch] = (value) => {
			if (!value) return nodeData[strippedMatch];
			nodeData[strippedMatch] = value;
		};

		return acc;
	}, {});

	return {
		params,
		nodeData,
		html: () => {
			return matches.reduce((acc, match) => {
				const strippedMatch = match.replace('$[', '').replace(']', '');
				return acc.replace(match, nodeData[strippedMatch]);
			}, template);
		},
	};
};

module.exports = {
	init(component) {
		osimNode2(component.template);
		rootNode = osimNode(component.template);
		component.ctor(rootNode.params);
		const aaa = rootNode.html();
		console.log(aaa);
	},
};
