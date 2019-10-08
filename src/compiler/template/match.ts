export function extractModifierName(regex, fullModifierName) {
	const match = fullModifierName.match(regex);
	return match ? match[0] : null;
}
