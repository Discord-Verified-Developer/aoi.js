import StringObject from '../structs/StringObject.js';
import { parseString } from './stringParser.js';
import { parseData } from '../../util/transpilerHelpers.js';

export const ObjectQuoteRegex = /".*?"/g;

export function getObjectData(stringObject: string, currentObj: StringObject) {
	let i = 0,
		text = '';
	let arrayEnded = false;
	while (i < stringObject.length) {
		const char = stringObject[i];
		if (char === '{' || char === '[') {
			const newObj = new StringObject(char, currentObj);
			currentObj.addValue(`#StringObject_${newObj.name}#`);
			currentObj = newObj;
		} else if (char === '}' || char === ']') {
			if (char === ']') arrayEnded = true;
			currentObj.addEnd(char);
			if (text.trim() !== '') {
				let t = parseData(text.trim());
				if (typeof t === 'string') {
					if (
						t.trim().startsWith('\'') ||
                        t.trim().startsWith('"') ||
                        t.trim().startsWith('`')
					) {
						t = t.trim().slice(1, t.trim().length - 1);
						t = parseString(t);
					} else if (t.includes('#FUNCTION_START#')) {
						if (
							t
								.replaceAll(
									/#FUNCTION_START#(.+?)#FUNCTION_END#/g,
									'',
								)
								.trim() !== ''
						) {
							t = parseString(t);
						}
					} else t = parseString(t);
				}

				currentObj.addValue(t);
				text = '';
			}

			currentObj.parent?.pushChild(currentObj);
			currentObj = currentObj.parent!;
		} else if (char === ':') {
			currentObj.addKey(text.trim());
			text = '';
		} else if (char === ',') {
			if (arrayEnded) {
				i++;
				arrayEnded = false;
				continue;
			}

			if (currentObj.start === '[') {
				let t = parseData(text.trim());
				if (typeof t === 'string') {
					if (
						t.trim().startsWith('\'') ||
                        t.trim().startsWith('"') ||
                        t.trim().startsWith('`')
					) {
						t = t.trim().slice(1, t.trim().length - 1);
						t = parseString(t);
					} else if (t.includes('#FUNCTION_START#')) {
						if (
							t
								.replaceAll(
									/#FUNCTION_START#(.+?)#FUNCTION_END#/g,
									'',
								)
								.trim() !== ''
						) {
							t = parseString(t);
						}
					} else t = parseString(t);
				}

				currentObj.addValue(t);
			} else {
				let t = parseData(text.trim());
				if (typeof t === 'string') {
					if (
						t.trim().startsWith('\'') ||
                        t.trim().startsWith('"') ||
                        t.trim().startsWith('`')
					) {
						t = t.trim().slice(1, t.trim().length - 1);
						t = parseString(t);
					} else if (t.includes('#FUNCTION_START#')) {
						if (
							t
								.replaceAll(
									/#FUNCTION_START#(.+?)#FUNCTION_END#/g,
									'',
								)
								.trim() !== ''
						) {
							t = parseString(t);
						}
					} else t = parseString(t);
				}

				currentObj.addValue(t);
			}

			text = '';
		} else {
			text += char;
		}

		i++;
	}

	if (text.trim() !== '') {
		let t = parseData(text.trim());
		if (typeof t === 'string') {
			if (
				t.trim().startsWith('\'') ||
                t.trim().startsWith('"') ||
                t.trim().startsWith('`')
			) {
				t = t.trim().slice(1, t.trim().length - 1);
				t = parseString(t);
			} else if (t.includes('#FUNCTION_START#')) {
				if (
					t
						.replaceAll(/#FUNCTION_START#(.+?)#FUNCTION_END#/g, '')
						.trim() !== ''
				) {
					t = parseString(t);
				}
			} else t = parseString(t);
		}

		currentObj.addValue(t);
	}

	return currentObj;
}

export function parseStringObject(
	stringObject: string,
	currentObj: StringObject,
) {
	const quotes = stringObject.match(ObjectQuoteRegex);
	if (quotes) {
		quotes.forEach((x) => {
			const newx = x
				.replaceAll(':', '#OBJECT_SEPARATOR#')
				.replaceAll('{', '#OBJECT_STARTER#')
				.replaceAll('}', '#OBJECT_ENDER#')
				.replaceAll('[', '#ARRAY_STARTER#')
				.replaceAll(']', '#ARRAY_ENDER#')
				.replaceAll(',', '#ARRAY_SEPARATOR#');
			stringObject = stringObject.replace(x, newx);
		});
	}

	return getObjectData(
		stringObject.slice(1, stringObject.length - 1),
		currentObj,
	);
}