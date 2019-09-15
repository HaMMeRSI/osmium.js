export const importFile = /(?<=from ').*?(?=';?)/g;
export const importedElements = /(?<=({|,| ))\w+(?=(}|,| }| from))/g;
export const importStatement = /import.*?'.*';?/g;
export const matchModifierName = /(?<={{ ?)[\w.\-_]+?(?= ?}})/g;
export const matchFullModifierName = /{{ ?[\w.\-_]+? ?}}/g;
export const getSpecificMatchFullModifierName = (name): RegExp => new RegExp(`{{ ?${name} ?}}`, 'g');
