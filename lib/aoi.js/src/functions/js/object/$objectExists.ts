import { TranspilerError } from '../../../core/error.js';
import type Scope from '../../../core/structs/Scope.js';
import { type FunctionData, type funcData } from '../../../typings/interfaces.js';
import { escapeResult } from '../../../util/transpilerHelpers.js';
export const $objectExists: FunctionData = {
	name: '$objectExists',
	brackets: true,
	optional: false,
	type: 'getter',
	fields: [
		{
			name: 'name',
			type: 'string',
			description: 'The name of the object to check',
			required: true,
		},
	],
	version: '7.0.0',
	description: 'returns whether object exists or not',
	default: ['void'],
	returns: 'object',
	example: `
        $createObject[object;{key:value}]
        $objectExists[object] // returns true

        $objectExists[object2] // returns false
    `,
	code: (data: funcData, scope: Scope[]) => {
		const currentScope = scope[scope.length - 1];
		const name = data.inside;
		if (
			!name &&
            !currentScope.name.startsWith('$try_') &&
            !currentScope.name.endsWith('$catch_')
		) {
			throw new TranspilerError(`${data.name}: No Object Name Provided`);
		}

		const res = escapeResult(
			`${!!currentScope.objects[name! ?? '']}`,
		);

		currentScope.update(res, data);
		return {
			code: res,
			scope,
		};
	},
};
