import { type FunctionData, type Scope, TranspilerError, type funcData, parseString } from '../../../index.js';
import { convertToBool, escapeResult } from '../../../util/transpilerHelpers.js';

export const $jseval: FunctionData = {
	name: '$jseval',
	brackets: true,
	optional: false,
	type: 'function_getter',
	fields: [
		{
			name: 'output',
			type: 'string',
			description: 'Whether to output the result of the code',
			required: true,
		},
		{
			name: 'code',
			type: 'string',
			description: 'The code to evaluate',
			required: true,
		},
	],
	version: '1.0.0',
	default: ['void', 'void'],
	returns: 'any',
	description: 'Evaluates the provided Js code',
	example: `
        $jsEval[false;log("hello world")]
    `,
	code: (data: funcData, scope: Scope[]) => {
		const splits = data.splits;
		const [output, ...code] = splits;
		const currentScope = scope[scope.length - 1];
		const parsedOutput = convertToBool(output);
		if ($jseval.brackets) {
			if (
				!data.total.startsWith($jseval.name + '[') &&
                (!currentScope.name.startsWith('$try_') ||
                    !currentScope.name.startsWith('$catch_'))
			) {
				throw new TranspilerError(
					`${data.name} requires closure brackets`,
				);
			}
		}

		if (
			splits.length < 2 &&
            !currentScope.name.startsWith('$try_') &&
            !currentScope.name.startsWith('$catch_')
		) {
			throw new TranspilerError(`${data.name} requires 2 arguments`);
		}

		const Code = parseString(code.join(';'));
		if (
			!currentScope.functions.includes(
				'async function __$jseval$__(Code) {',
			)
		) {
			const setres = `
    async function __$jsEval$__(Code) {
      try {
        const evaled =  await eval(Code);
        return evaled;
      } catch (e) {
        return e;
      }
    }`;
			currentScope.functions += escapeResult(setres) + '\n';
		}

		const res = `${escapeResult(
			`await __$jsEval$__.call(__$DISCORD_DATA$__,${Code})`,
		) }`;

		currentScope.rest = currentScope.rest.replace(data.total, res);
		return {
			code: parsedOutput ? res : '',
			scope: scope,
		};
	},
};
