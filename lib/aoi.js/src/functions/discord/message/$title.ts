import { type RawEmbedData } from 'zeneth';
import { parseString } from '../../../core/parsers/stringParser.js';
import type Scope from '../../../core/structs/Scope.js';
import { type FunctionData, type funcData } from '../../../typings/interfaces.js';
import { escapeResult, escapeVars } from '../../../util/transpilerHelpers.js';
export const $title: FunctionData = {
	name: '$title',
	brackets: true,
	optional: false,
	type: 'setter',
	fields: [
		{
			name: 'index or title',
			type: 'string | number',
			description: 'The index of the embed to set the title of',
			required: true,
		},
		{
			name: 'title',
			type: 'string',
			description: 'The title to set',
			required: false,
		},
	],
	description: 'Sets the title of an embed at the specified index',
	default: ['text', ''],
	returns: 'void',
	version: '7.0.0',
	example: `
        $title[hello world] // sets the title of the first embed to "hello world"

        $title[2;hello world] // sets the title of the second embed to "hello world"
    `,
	code: (data: funcData, scope: Scope[]) => {
		const currentScope = scope.at(-1)!;
		//code here
		const [indexOrTitle, ...title] = data.splits;
		const parsedTitle = title.join(';');
		let actualTitle: string;
		let index = 0;
		if (!parsedTitle) actualTitle = indexOrTitle;
		else if (parsedTitle && isNaN(Number(indexOrTitle)))
			actualTitle = indexOrTitle + ';' + parsedTitle;
		else {
			actualTitle = parsedTitle;
			index = Number(indexOrTitle) - 1;
		}

		let embed = currentScope.embeds[index] as RawEmbedData;
		if (!embed) {
			embed = {
				fields: [],
			};

			currentScope.setters += escapeResult(
				`${escapeVars(
					`${currentScope.name}_embeds`,
				)}[${index}] = { fields: [] };`,
			);
		}

		embed.title = actualTitle;
		currentScope.embeds[index] = embed;

		const res = escapeResult(
			`${escapeVars(
				currentScope.name + '_embeds',
			)}[${index}].title = ${parseString(actualTitle)};`,
		);

		currentScope.update(res, data);

		return {
			code: res,
			scope,
		};
	},
};
