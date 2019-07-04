export default (tag, attrs = [], childs = []) => {
	const modifiers = {};
	// const id = tag.match(/(?<=#).*?(?=$|\.)/)[0];
	// const classNames = tag.match(/(?<=\.).*?(?=\#|$|\.)/gm);
	// const tagName = tag.match(/^.*?(?=#|$|\.)/)[0];
	const tagName = tag;
	let element;
	if (tagName === '#text') {
		element = document.createTextNode(childs);
	} else {
		if (tagName === '#document-fragment') {
			element = document.createDocumentFragment();
		} else {
			element = document.createElement(tagName || 'div');

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
		}

		if (childs.length > 0) {
			childs.forEach((child) => element.appendChild(child));
		}
	}

	return element;
};
