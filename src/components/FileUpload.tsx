
import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { EDIFile } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUploaded: (file: EDIFile) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    setIsUploading(true);
    
    // Validate file type
    const validExtensions = ['.edi', '.txt', '.x12', '.278'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an EDI file (.edi, .txt, .x12, .278)",
        variant: "destructive"
      });
      setIsUploading(false);
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Basic EDI validation - check for ISA header
      if (!content.startsWith('ISA')) {
        toast({
          title: "Invalid EDI format",
          description: "File must start with ISA segment (Interchange Control Header)",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }

      const ediFile: EDIFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        content: content,
        uploadedAt: new Date(),
        status: 'uploaded'
      };

      // Simulate processing delay
      setTimeout(() => {
        setIsUploading(false);
        onFileUploaded(ediFile);
        toast({
          title: "File uploaded successfully",
          description: `${file.name} is ready for processing`,
        });
      }, 1000);
    };

    reader.onerror = () => {
      toast({
        title: "File read error",
        description: "Unable to read the selected file",
        variant: "destructive"
      });
      setIsUploading(false);
    };

    reader.readAsText(file);
  }, [onFileUploaded, toast]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload EDI X12N 278 File
          </CardTitle>
          <CardDescription>
            Upload your HIPAA X12N 278 Prior Authorization Request file for processing and validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600">Processing file...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your EDI file here, or click to browse
                  </p>
                  <p className="text-gray-600 text-sm">
                    Supports .edi, .txt, .x12, .278 files (Max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  onChange={onFileSelect}
                  accept=".edi,.txt,.x12,.278"
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select File
                  </label>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Requirements */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-800 text-lg">File Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-700">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
            <span>Must be valid X12N 278 format (005010X217)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
            <span>File must start with ISA (Interchange Control Header)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
            <span>Maximum file size: 10MB</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
            <span>HIPAA compliant data only</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
