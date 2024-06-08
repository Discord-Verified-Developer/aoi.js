import { type FunctionData } from '../../../typings/interfaces.js';
import {
	escapeResult,
} from '../../../util/transpilerHelpers.js';

export const $username: FunctionData = {
	name: '$username',
	type: 'getter',
	brackets: true,
	optional: false,
	fields: [
		{
			name: 'user',
			type: 'bigint',
			required: true,
		},
	],
	version: '7.0.0',
	default: ['void'],
	returns: 'string',
	description: 'Returns the name of the user',
	example: `
        $username[$authorId] // returns the name of the author

        $username[123456789012345678] // returns the name of the user with id 123456789012345678
    `,
	code: (data, scope) => {
		const currentScope = scope[scope.length - 1];

		const id = data.inside;

		const username = `(await __$DISCORD_DATA$__.bot.util.getUser(${id}))?.username`;

		const res = escapeResult(`(${username})`);
		currentScope.update(res, data);
		return {
			code: res,
			scope,
		};
	},
};
