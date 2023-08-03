declare module 'getFrameworkViews' {
    export function getFrameworkViews(): Promise<{
        name: string;
        path: string;
    }>
}