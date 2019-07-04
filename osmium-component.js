const template = `<div class='$[content]'></div>`;
const ctor = (params) => {
	params.content('Hello world');
};

module.exports = {
	template,
	ctor,
};
