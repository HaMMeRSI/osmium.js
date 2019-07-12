export const importFile = /(?<=from ').*?(?=';?)/gm;
export const importedElements = /(?<=({|,| ))\w+(?=(}|,| }| from))/gm;
export const importStatement = /import.*?'.*';?/gm;
export const matchModifierName = /(?<={{ ?)[\w.\-_]+?(?= ?}})/gm;
export const matchModifier = /{{ ?[\w.\-_]+? ?}}/gm;
export const getSpecificMatchModifier = (name): RegExp => new RegExp(`{{ ?${name} ?}}`, 'gm');
