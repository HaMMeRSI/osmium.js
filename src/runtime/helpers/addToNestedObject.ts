export const addToObject = (object, items: string[], objectToAdd) => {
	if (items[0] in object) {
		if (items[1] in object[items[0]]) {
			object[items[0]][items[1]].push(objectToAdd);
		} else {
			object[items[0]][items[1]] = [objectToAdd];
		}
	} else {
		object[items[0]] = {
			[items[1]]: [objectToAdd],
		};
	}
};
