import { IOsimNode } from '../../compiler-interfaces';

export default (text): IOsimNode => {
	return { dom: document.createTextNode(text) };
};
