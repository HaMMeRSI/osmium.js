export const importFile = /(?<=from ').*?(?=';?)/g;
export const importedElements = /(?<=({|,| ))\w+(?=(}|,| }| from))/g;
export const importStatement = /import.*?'.*';?/g;
export const matchDynamicGetterName = /(?<={{ ?)[\w.\-_]+?(?= ?}})/g;
export const matchDynamicGetter = /{{ ?[\w.\-_]+? ?}}/g;
export const getSpecificMatchDynamicGetter = (name): RegExp => new RegExp(`{{ ?${name} ?}}`, 'g');
