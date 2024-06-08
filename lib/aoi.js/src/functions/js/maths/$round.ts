import { TranspilerError } from '../../../core/error.js';
import { TranspilerCustoms } from '../../../typings/enums.js';
import { type FunctionData } from '../../../typings/interfaces.js';
import {
	escapeMathResult,
	parseResult,
} from '../../../util/transpilerHelpers.js';

export const $round: FunctionData = {
	name: '$round',
	type: 'getter',
	brackets: true,
	optional: false,
	fields: [
		{
			name: 'number',
			type: 'number',
			description: 'The number to round off',
			required: true,
		}, {
			name: 'decimal',
			type: 'number',
			description: 'The decimal to round off',
			required: false,
		},
	],
	version: '7.0.0',
	default: ['void'],
	returns: 'number',
	description: 'Returns the Roundo off value of the number',
	example: `
    $round[1;2] // returns 1.00
    $round[1.2;0] // returns 1
    `,
	code: (data, scope) => {
		const [number, decimal = '0'] = data.splits;
		const currentScope = scope[scope.length - 1];
		if (
			data.splits.length === 0 &&
            !currentScope.name.startsWith('$try_') &&
            !currentScope.name.startsWith('$catch_')
		) {
			throw new TranspilerError(
				`${data.name} requires at least 1 argument`,
			);
		}

		if (!number)
			throw new TranspilerError(
				`${data.name} requires at least 1 argument`,
			);
		let round =
            number.includes(TranspilerCustoms.FS) ||
            number.includes('__$DISCORD_DATA$__') ||
            number.includes(TranspilerCustoms.MFS)
            	? parseResult(number.trim())
            	: Number( number );
		const rounddecimal =
            decimal.includes( TranspilerCustoms.FS ) ||
            decimal.includes( '__$DISCORD_DATA$__' ) ||
            decimal.includes( TranspilerCustoms.MFS )
            	? parseResult( decimal.trim() )
            	: Number( decimal );

		round = `((${round}).toFixed(${rounddecimal}))`;

		const res = escapeMathResult(`(${round})`);
		currentScope.update(res, data);
		return {
			code: res,
			scope,
		};
	},
};
