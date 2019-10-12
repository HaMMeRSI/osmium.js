export const splitObjectAccessor = (path: string, separator = '.') => {
	return path
		.replace(/\[/g, '.')
		.replace(/\]/g, '')
		.split(separator);
};

export const resolveObjectKey = (path: string, obj, separator = '.') => {
	const properties = splitObjectAccessor(path, separator);
	return properties.reduce((prev, curr) => prev && prev[curr], obj);
};

export const assignByPath = (path, value, root) => {
	const segments = path.split('.');
	let cursor = root || window;
	let segment;
	let i;

	for (i = 0; i < segments.length - 1; ++i) {
		segment = segments[i];
		cursor = cursor[segment] = cursor[segment] || {};
	}

	return (cursor[segments[i]] = value);
};

export const getAccessorFromString = (path: string) => {
	return path.substring(path.indexOf('.') + 1);
};
