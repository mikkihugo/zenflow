export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.Byq66dJt.js",app:"_app/immutable/entry/app.CYHOqeG6.js",imports:["_app/immutable/entry/start.Byq66dJt.js","_app/immutable/chunks/Wh8Gc9PJ.js","_app/immutable/chunks/B7z1MOZy.js","_app/immutable/chunks/B2TdpOED.js","_app/immutable/entry/app.CYHOqeG6.js","_app/immutable/chunks/B7z1MOZy.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/CEHbExR_.js","_app/immutable/chunks/C5nUUyNm.js","_app/immutable/chunks/CXII8-yk.js","_app/immutable/chunks/B2TdpOED.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/agu",
				pattern: /^\/agu\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/agu/task/[id]",
				pattern: /^\/agu\/task\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/api/workspace/files",
				pattern: /^\/api\/workspace\/files\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/workspace/files/_server.ts.js'))
			},
			{
				id: "/api/workspace/files/content",
				pattern: /^\/api\/workspace\/files\/content\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/workspace/files/content/_server.ts.js'))
			},
			{
				id: "/dev-communication",
				pattern: /^\/dev-communication\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/matron",
				pattern: /^\/matron\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/roadmap",
				pattern: /^\/roadmap\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/workspace",
				pattern: /^\/workspace\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
