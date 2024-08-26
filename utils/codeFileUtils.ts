export function getActiveFile(): string {
    return localStorage.getItem('activeFile') || '/App.tsx';
}

export function getFileContent(fileName: string): string {
    const files = JSON.parse(localStorage.getItem('codeFiles') || '{}');
    return files[fileName]?.code || '';
}