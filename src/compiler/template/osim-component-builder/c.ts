import { IOsimNode } from '../../compiler-interfaces';

type componentBuilder = () => DocumentFragment;
export default (component: componentBuilder, props, children): IOsimNode => {
	const staticProps = [];
	const fragment = document.createDocumentFragment();

	props.forEach(([name, value]): void => {
		const dyn = value.match(/(?<=\$\{).*?(?=})/);
		if (!dyn) {
			staticProps.push([name, value]);
		}
	});

	return {
		dom: fragment,
	};
};
