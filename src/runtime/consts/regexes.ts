export const importFile = /(?<=from ').*?(?=';?)/g;
export const importedElements = /(?<=({|,| ))\w+(?=(}|,| }| from))/g;
export const importStatement = /import.*?'.*';?/g;
export const matchModifierName = /(?<={{ ?).+(?= ?}})/g;
export const matchFullModifierName = /({{ ?.+? ?}})/g;
export const demo = /((?<!\{)\{(?!{)|(?<!\})\}(?!}))/g;
export const matchRuntimeName = /(?<=\${)(.+?)(?=})/g;
export const matchFullRuntimeName = /(\${.+?})/g;
// export const matchRuntimeName = /(?<=\+)(.+?)(?=\+)/g;
// export const matchFullRuntimeName = /(\+.+?\+)/;
export const getSpecificMatchFullModifierName = (name): RegExp => new RegExp(`{{ ?${name} ?}}`, 'g');
export const matchFuncCall = /(.+?)\((.+)?\)/;
export const matchPrefixAttr = /^([@:])?(.+)/;

function extractProp(text: string) {
	text = ` ${text}`;
	let isProp = false;
	let inProp = false;
	let propName = [];
	const props = [];

	for (let i = 1; i < text.length; i++) {
		if (text[i] === '}') {
			inProp = false;
			if (inProp) {
				propName.push(text[i]);
			} else if (isProp) {
				props.push(propName.join(''));
				propName = [];
				isProp = false;
			} else {
			}
		} else if (isProp) {
			propName.push(text[i]);
		}

		if (text[i] === '{') {
			if (isProp) {
				inProp = true;
			} else if (text[i - 1] !== '{' && text[i + 1] !== '{') {
				isProp = true;
			}
		}
	}

	return props;
}
