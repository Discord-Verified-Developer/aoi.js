import { type FunctionData } from '../../../index.js';
import { escapeFunctionResult } from '../../../util/transpilerHelpers.js';

export const $break: FunctionData = {
	name: '$break',
	type: 'function',
	brackets: false,
	optional: false,
	fields: [],
	version: '7.0.0',
	default: [],
	returns: 'void',
	description: 'Breaks out of a loop',
	example: `
    
    $let[i;0]
    $while[$get[i] < 5 ;
        $if[$get[i] == 3; $break]
        $log[$get[i]]
        $inc[$get[i]]
    ]
    // Logs 0, 1, 2
    `,
	code: (data, scope) => {
		const currentScope = scope[scope.length - 1];
		const res = escapeFunctionResult('break;');
		currentScope.rest = currentScope.rest.replace(data.total, res);
		scope[scope.length - 1] = currentScope;
		return {
			code: res,
			scope,
		};
	},
};
