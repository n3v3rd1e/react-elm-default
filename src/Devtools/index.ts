type ReduxExtension = {
	connect: <Model, Msg>(options: any) => {
		init: (m: Model) => void;
		send: (msg: Msg, model: Model) => void;
	};
};

declare var window: Window &
	typeof globalThis & {
		__REDUX_DEVTOOLS_EXTENSION__: ReduxExtension;
	};

const debug =
	window &&
	window.__REDUX_DEVTOOLS_EXTENSION__ &&
	window.__REDUX_DEVTOOLS_EXTENSION__.connect({ trace: true });
	
type Msg = { type: string, payload?: any, child?: Msg }
const deepChild = (msg: Msg): Msg => msg.child ? deepChild(msg.child) : msg;

export const devTools: { onInit: typeof debug['init'], onUpdate: typeof debug['send'] } | undefined = debug
	? {
			onInit: debug.init,
			onUpdate: (msg, model) => debug.send(deepChild(msg as Msg), model)
	  }
	: undefined;
