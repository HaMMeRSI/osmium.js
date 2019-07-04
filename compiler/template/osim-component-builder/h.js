export default (tagName = 'div', attrs = [], childs = []) => {
	element = document.createElement(tagName);

	attrs.forEach(([name, value]) => {
		const dyn = value.match(/(?<=\$\{).*?(?=})/);
		if (dyn) {
			// TODO: function for debounce queue
			// modifiers[name] = (newValue) => () => element.setAttribute(name, newValue);
			modifiers[name] = (newValue) => element.setAttribute(name, newValue);
		} else {
			element.setAttribute(name, value);
		}
	});

	childs.forEach((child) => fragment.appendChild(child));
};
