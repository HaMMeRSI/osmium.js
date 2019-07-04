import { dynamicAttribute } from '../../../consts/regexes';
import { IOsimNode, IModifiers } from '../../compiler-interfaces';

export default (tagName = 'div', attrs = [], childs = []): IOsimNode => {
	const modifiers: IModifiers = {};
	const element = document.createElement(tagName);

	attrs.forEach(([name, value]): void => {
		const dyn = value.match(dynamicAttribute);
		if (dyn) {
			// TODO: function for debounce queue
			// modifiers[name] = (newValue) => () => element.setAttribute(name, newValue);
			modifiers[name] = (newValue): void => element.setAttribute(name, newValue);
		} else {
			element.setAttribute(name, value);
		}
	});

	childs.forEach((child): void => element.appendChild(child));

	return {
		dom: element,
		modifiers,
	};
};
