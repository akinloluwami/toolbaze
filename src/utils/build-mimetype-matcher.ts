export function buildMimeMatcher(accept: Record<string, string[]>) {
    const exact: Set<string> = new Set();
    const wildcards: string[] = [];

    for (const key of Object.keys(accept)) {
        if (key.endsWith('/*')) {
            wildcards.push(key.slice(0, -2));
        } else {
            exact.add(key);
        }
    }

    return (mime: string) => {
        if (exact.has(mime)) return true;
        const [type] = mime.split('/');
        return wildcards.includes(type);
    };
}
