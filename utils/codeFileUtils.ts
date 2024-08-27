export function getActiveFile(): string {
    return localStorage.getItem('activeFile') || '/App.tsx';
}

export function getFileContent(fileName: string): string {
    const files = JSON.parse(localStorage.getItem('codeFiles') || '{}');
    return files[fileName]?.code || '';
}

export function getAllComponents(skipActiveComponent: boolean = false): string[] {
    const files = JSON.parse(localStorage.getItem('codeFiles') || '{}');
    return Object.keys(files)
        .filter(fileName => 
            fileName.endsWith('.tsx') && 
            fileName.startsWith('/') && 
            !fileName.includes('/', 1) &&
            fileName !== '/App.tsx' &&
            (!skipActiveComponent || fileName !== getActiveFile())
        )
        .map(fileName => fileName.slice(1, -4)); // Remove leading '/' and '.tsx' extension
}