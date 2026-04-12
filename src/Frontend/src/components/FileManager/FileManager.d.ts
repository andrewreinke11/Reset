interface FileManagerProps {
    currentFile: string | null;
    onFileSelect: (fileName: string) => void;
    onFileCreate: (fileName: string, width: number, height: number) => void;
    onFileDelete: (fileName: string) => void;
}
export declare const FileManager: React.FC<FileManagerProps>;
export {};
//# sourceMappingURL=FileManager.d.ts.map