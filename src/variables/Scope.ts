import { Variables } from './Variables';
import { Variable } from './Variable';
import { Runtime } from '../Runtime';


export class Scope extends Variable  {
	//**************************************************************************
	constructor(name: string) {
		super();
		this._name = name;
	}


	//**************************************************************************
	public typename(): string { return 'scope'; }


	//**************************************************************************
	public loads(type: string): boolean {
		return false;
	}


	//**************************************************************************
	public load(name: string,
				runtime: Runtime,
				callback: (v: Variable) => void)
	{}


	//**************************************************************************
	public listChildren(runtime: Runtime,
						callback: (vars: Array<Variable>) => void)
	{
		var matchesHeader = false;
		var vars = '';
		var syncRegex;

		runtime.addInputHandler((str: string) => {
			if(str.match(syncRegex) !== null) {
				if(vars.length !== 0) {
					const names = vars.split(' ').filter((val) => val);
					Variables.listVariables(names, runtime, callback);
				} else
					callback(new Array<Variable>());

				return true;
			}

			if(matchesHeader) {
				vars += str;
			} else if(str.match(/^(?:debug> )?Variables in the current scope:$/)) {
				matchesHeader = true;
			}

			return false;
		});

		runtime.send(`who ${this.name()}`);
		syncRegex = Runtime.syncRegEx(runtime.sync());
	}
}
