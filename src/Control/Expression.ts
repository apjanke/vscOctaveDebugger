import { Runtime } from '../Runtime';
import { Variables } from '../Variables/Variables';
import { Variable } from '../Variables/Variable';
import * as Constants from '../Constants';


//******************************************************************************
export class Expression {
	//**************************************************************************
	public static evaluate(
		expression: string,
		runtime: Runtime,
		ctx: string | undefined,
		callback: (info: string | undefined) => void
	): void
	{
		if(ctx === Constants.CTX_CONSOLE) {
			// Console just passes through.
			runtime.execute(expression);
			// We don't send anything back now as any output will be written on the console anyway.
			// This also avoids the issue with the pause, input, etc.
			callback('');
		} else if(ctx === Constants.CTX_WATCH) {
			Expression.loadAsVariable(expression, runtime, callback);
		} else {
			Expression.type(expression, runtime,
				(value: string | undefined, type: string | undefined) => {
					if(value === undefined && type === undefined) {
						callback(Constants.EVAL_UNDEF);
					} else if(ctx === Constants.CTX_HOVER) {
						Expression.handleHover(expression, runtime, value, type, callback);
					} else { // and all the rest
						Expression.forceEvaluate(expression, runtime, callback);
					}
				}
			);
		}
	}


	//**************************************************************************
	public static handleHover(
		expression: string,
		runtime: Runtime,
		val: string | undefined,
		type: string | undefined,
		callback: (info: string | undefined) => void
	): void
	{
		// TODO: also skip comments
		if(type !== undefined && (type === 'file' || type === 'function')) {
			callback(val); // Don't evaluate further to avoid side effects
		} else {
			Expression.loadAsVariable(expression, runtime, callback);
		}
	}


	//**************************************************************************
	public static loadAsVariable(
		expression: string,
		runtime: Runtime,
		callback: (info: string | undefined) => void
	): void
	{
		Variables.loadVariable(expression, runtime, (v: Variable | null) => {
			if(v === null) {
				Variables.getSize(expression, runtime, (size: Array<number>) => {
					if(Variables.loadable(size)) {
						Expression.forceEvaluate(expression, runtime, callback);
					} else {
						callback(size.join(Constants.SIZE_SEPARATOR));
					}
				});
			} else {
				callback(v.value());
			}
		});
	}


	//**************************************************************************
	public static forceEvaluate(
		expression: string,
		runtime: Runtime,
		callback: (info: string | undefined) => void
	): void
	{
		runtime.evaluateAsLine(expression, (output: string) => {
			callback(Variables.removeName(expression, output));
		});
	}


	//**************************************************************************
	public static type(
		expression: string,
		runtime: Runtime,
		callback: (val: string | undefined, type: string | undefined) => void
	): void
	{
		if(expression.match(/^'[^']*$/) !== null) {
			expression = expression.replace('\'', '');
		}

		const typeRegex = new RegExp(`^.*'${expression}' is (?:a|the) (?:built-in )?(\\S+).*$`);
		let val: string | undefined = undefined;
		let type: string | undefined = undefined;

		runtime.evaluate(`which ${expression}`, (output: string[]) => {
			output.forEach(line => {
				const match = line.match(typeRegex);

				if(match !== null) {
					val = line;
					type = match[1];
				} else if(val === undefined && line.length !== 0) {
					val = '';
				}
			});

			callback(val, type);
		});
	}
}
