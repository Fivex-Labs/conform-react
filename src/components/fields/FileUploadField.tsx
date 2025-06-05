import React, { useState, useCallback, useRef } from 'react';

export interface FileUploadFieldProps {
  name: string;
  label: string;
  multiple?: boolean;
  accept?: string[];
  maxSize?: number; // in bytes
  maxFiles?: number;
  preview?: boolean;
  upload?: {
    endpoint: string;
    method?: 'POST' | 'PUT';
    headers?: Record<string, string>;
    chunk?: boolean;
    chunkSize?: number;
  };
  value?: File[] | File;
  onChange?: (files: File[] | File | null) => void;
  onUploadProgress?: (progress: number, file: File) => void;
  onUploadComplete?: (response: any, file: File) => void;
  onUploadError?: (error: Error, file: File) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  description?: string;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  name,
  label,
  multiple = false,
  accept = [],
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  preview = false,
  upload,
  value,
  onChange,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  disabled = false,
  className = '',
  error,
  description,
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    // Check file type
    if (accept.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isValidType = accept.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return acceptedType === fileExtension;
        }
        return mimeType.startsWith(acceptedType.replace('*', ''));
      });

      if (!isValidType) {
        return `File type not allowed. Accepted types: ${accept.join(', ')}`;
      }
    }

    return null;
  }, [accept, maxSize]);

  const uploadFile = useCallback(async (fileWithProgress: FileWithProgress) => {
    if (!upload) return;

    const { file } = fileWithProgress;
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          
          setFiles(prev => prev.map(f => 
            f.file === file 
              ? { ...f, progress, status: 'uploading' as const }
              : f
          ));

          onUploadProgress?.(progress, file);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          
          setFiles(prev => prev.map(f => 
            f.file === file 
              ? { ...f, progress: 100, status: 'completed' as const, url: response.url }
              : f
          ));

          onUploadComplete?.(response, file);
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        const error = new Error('Upload failed');
        
        setFiles(prev => prev.map(f => 
          f.file === file 
            ? { ...f, status: 'error' as const, error: error.message }
            : f
        ));

        onUploadError?.(error, file);
      });

      // Start upload
      xhr.open(upload.method || 'POST', upload.endpoint);
      
      // Set headers
      if (upload.headers) {
        Object.entries(upload.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.send(formData);

    } catch (error) {
      const uploadError = error instanceof Error ? error : new Error('Upload failed');
      
      setFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'error' as const, error: uploadError.message }
          : f
      ));

      onUploadError?.(uploadError, file);
    }
  }, [upload, onUploadProgress, onUploadComplete, onUploadError]);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    // Validate file count
    if (multiple && files.length + fileArray.length > maxFiles) {
      return; // TODO: Show error message
    }

    const validatedFiles: FileWithProgress[] = [];
    
    for (const file of fileArray) {
      const validationError = validateFile(file);
      
      if (validationError) {
        // TODO: Show validation error
        continue;
      }

      const fileWithProgress: FileWithProgress = {
        file,
        progress: 0,
        status: 'pending'
      };

      validatedFiles.push(fileWithProgress);
    }

    const updatedFiles = multiple 
      ? [...files, ...validatedFiles]
      : validatedFiles;

    setFiles(updatedFiles);

    // Trigger onChange
    const fileValues = updatedFiles.map(f => f.file);
    onChange?.(multiple ? fileValues : fileValues[0] || null);

    // Auto-upload if endpoint is provided
    if (upload) {
      validatedFiles.forEach(uploadFile);
    }
  }, [files, multiple, maxFiles, validateFile, onChange, upload, uploadFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileToRemove: File) => {
    const updatedFiles = files.filter(f => f.file !== fileToRemove);
    setFiles(updatedFiles);

    const fileValues = updatedFiles.map(f => f.file);
    onChange?.(multiple ? fileValues : fileValues[0] || null);
  }, [files, multiple, onChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File): string => {
    const type = file.type;
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📁';
  };

  return (
    <div className={`file-upload-field ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}

      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-colors duration-200 cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${error ? 'border-red-500' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <div className="text-lg font-medium text-gray-900">
            {dragActive ? 'Drop files here' : 'Click to upload or drag files here'}
          </div>
          <div className="text-sm text-gray-500">
            {accept.length > 0 && `Accepted types: ${accept.join(', ')}`}
            {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
            {multiple && ` • Max files: ${maxFiles}`}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileWithProgress, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-2xl">{getFileIcon(fileWithProgress.file)}</span>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {fileWithProgress.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(fileWithProgress.file.size)}
                    {fileWithProgress.status === 'uploading' && 
                      ` • ${fileWithProgress.progress}% uploaded`
                    }
                    {fileWithProgress.status === 'completed' && ' • Uploaded'}
                    {fileWithProgress.status === 'error' && 
                      ` • Error: ${fileWithProgress.error}`
                    }
                  </div>
                  
                  {/* Progress Bar */}
                  {fileWithProgress.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${fileWithProgress.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Preview */}
                {preview && fileWithProgress.file.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(fileWithProgress.file)}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeFile(fileWithProgress.file)}
                className="ml-3 text-red-500 hover:text-red-700 text-sm"
                disabled={disabled}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}; 