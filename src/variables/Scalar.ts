import { Variables } from './Variables';
import { Variable } from './Variable';
import { Runtime } from '../Runtime';


export class Scalar extends Variable  {
	//**************************************************************************
	constructor(name: string = '',
				value: string = '')
	{
		super();
		this._name = name;
		this._value = value;
	}


	//**************************************************************************
	public typename(): string { return 'scalar'; }


	//**************************************************************************
	public loads(type: string): boolean {
		// TODO: for now everything can be loaded as a scalar as a fallback.
		return true;
	}


	//**************************************************************************
	public load(name: string,
				runtime: Runtime,
				callback: (v: Variable) => void)
	{
		Variables.getValue(name, runtime, (value: string) => {
			callback(new Scalar(name, value));
		});
	}


	//**************************************************************************
	public listChildren(runtime: Runtime,
						callback: (vars: Array<Variable>) => void)
	{} // Scalars have no children.
}
