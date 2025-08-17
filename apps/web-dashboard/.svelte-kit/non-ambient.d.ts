
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/agu" | "/agu/task" | "/agu/task/[id]" | "/api" | "/api/workspace" | "/api/workspace/files" | "/api/workspace/files/content" | "/dev-communication" | "/matron" | "/roadmap" | "/workspace";
		RouteParams(): {
			"/agu/task/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/agu": { id?: string };
			"/agu/task": { id?: string };
			"/agu/task/[id]": { id: string };
			"/api": Record<string, never>;
			"/api/workspace": Record<string, never>;
			"/api/workspace/files": Record<string, never>;
			"/api/workspace/files/content": Record<string, never>;
			"/dev-communication": Record<string, never>;
			"/matron": Record<string, never>;
			"/roadmap": Record<string, never>;
			"/workspace": Record<string, never>
		};
		Pathname(): "/" | "/agu" | "/agu/task" | `/agu/task/${string}` & {} | "/api" | "/api/workspace" | "/api/workspace/files" | "/api/workspace/files/content" | "/dev-communication" | "/matron" | "/roadmap" | "/workspace";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): never;
	}
}