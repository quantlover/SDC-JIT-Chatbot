import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Paperclip, X, FileText, Image, FileAudio, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (files: any[]) => void;
  disabled?: boolean;
  className?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadStatus: 'uploading' | 'completed' | 'error';
}

export function FileUpload({ 
  onFileUpload, 
  disabled = false, 
  className,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024 // 10MB default
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('audio/')) return FileAudio;
    if (fileType.includes('text') || fileType.includes('pdf') || fileType.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadStatus: 'uploading' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const results = await response.json();
      
      // Update file status and URLs
      setUploadedFiles(prev => 
        prev.map(file => {
          const result = results.find((r: any) => r.originalName === file.name);
          if (result) {
            return {
              ...file,
              url: result.url,
              uploadStatus: 'completed' as const,
            };
          }
          return file;
        })
      );

      // Notify parent component
      onFileUpload(results);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Mark files as error
      setUploadedFiles(prev => 
        prev.map(file => 
          newFiles.some(nf => nf.id === file.id) 
            ? { ...file, uploadStatus: 'error' as const }
            : file
        )
      );
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter valid files
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        console.warn(`File ${file.name} is too large (${formatFileSize(file.size)})`);
        return false;
      }
      return true;
    });

    if (uploadedFiles.length + validFiles.length > maxFiles) {
      console.warn(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    // Update parent component
    const remainingFiles = uploadedFiles
      .filter(file => file.id !== fileId && file.uploadStatus === 'completed')
      .map(file => ({ name: file.name, url: file.url, type: file.type, size: file.size }));
    
    onFileUpload(remainingFiles);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          isDragOver 
            ? "border-primary bg-primary/10" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploadedFiles.length >= maxFiles}
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Attach Files
          </Button>
          
          <span className="text-sm text-muted-foreground">
            or drag and drop
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Max {maxFiles} files, up to {formatFileSize(maxFileSize)} each
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => {
            const FileIcon = getFileIcon(file.type);
            
            return (
              <div
                key={file.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  file.uploadStatus === 'completed' && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
                  file.uploadStatus === 'error' && "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
                  file.uploadStatus === 'uploading' && "bg-muted"
                )}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        file.uploadStatus === 'completed' ? 'default' :
                        file.uploadStatus === 'error' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {file.uploadStatus === 'uploading' && '⏳'}
                      {file.uploadStatus === 'completed' && '✓'}
                      {file.uploadStatus === 'error' && '✗'}
                      {file.uploadStatus}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}