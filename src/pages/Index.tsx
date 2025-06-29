
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SchemaMapper from '@/components/SchemaMapper';
import FileUpload from '@/components/FileUpload';
import SchemaVisualization from '@/components/SchemaVisualization';
import ValidationResults from '@/components/ValidationResults';
import AISuggestions from '@/components/AISuggestions';
import TransformationPanel from '@/components/TransformationPanel';
import TransactionHistory from '@/components/TransactionHistory';
import { FileText, Upload, Search, Hexagon, Star, Folder, Settings } from 'lucide-react';

export interface EDIFile {
  id: string;
  name: string;
  size: number;
  content: string;
  uploadedAt: Date;
  status: 'uploaded' | 'parsing' | 'parsed' | 'validated' | 'error';
}

export interface ValidationResult {
  level: number;
  type: 'error' | 'warning' | 'info';
  segment: string;
  element?: string;
  message: string;
  suggestion?: string;
}

export interface ParsedEDI {
  envelope: any;
  loops: any[];
  segments: any[];
  transactionCount: number;
  controlNumbers: {
    isa: string;
    gs: string;
    st: string;
  };
}

export interface CustomSchema {
  transactionType: string;
  version: string;
  elements: any[];
  generatedAt: Date;
}

const Index = () => {
  const [currentFile, setCurrentFile] = useState<EDIFile | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEDI | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [customSchema, setCustomSchema] = useState<CustomSchema | null>(null);
  const [activeTab, setActiveTab] = useState('mapper');

  const handleSchemaGenerated = (schema: CustomSchema) => {
    setCustomSchema(schema);
    setActiveTab('upload');
    console.log('Custom schema generated:', schema);
  };

  const handleFileUploaded = (file: EDIFile) => {
    setCurrentFile(file);
    setActiveTab('parse');
    console.log('File uploaded:', file);
  };

  const handleFileParsed = (data: ParsedEDI) => {
    setParsedData(data);
    setActiveTab('validate');
    console.log('File parsed:', data);
  };

  const handleValidationComplete = (results: ValidationResult[]) => {
    setValidationResults(results);
    setActiveTab('ai');
    console.log('Validation complete:', results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">C-HIT EDI X12N 278 Processor</h1>
              <p className="text-gray-600">Healthcare Prior Authorization Request Processing & Validation</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              HIPAA Compliant
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              CAQH CORE Certified
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              AI Enhanced
            </span>
          </div>
        </div>

        {/* Current File Status */}
        {currentFile && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Current File: {currentFile.name}
              </CardTitle>
              <CardDescription className="text-center">
                Status: <span className="capitalize font-medium text-blue-700">{currentFile.status}</span> • 
                Size: {Math.round(currentFile.size / 1024)}KB • 
                Uploaded: {currentFile.uploadedAt.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Custom Schema Status */}
        {customSchema && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" />
                Custom Schema: {customSchema.transactionType} {customSchema.version}
              </CardTitle>
              <CardDescription className="text-center">
                Generated: {customSchema.generatedAt.toLocaleTimeString()} • 
                Elements: {customSchema.elements.length}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Main Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-sm border">
            <TabsTrigger value="mapper" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Mapper
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className="flex items-center gap-2"
              disabled={!customSchema}
            >
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger 
              value="parse" 
              className="flex items-center gap-2"
              disabled={!currentFile}
            >
              <Search className="w-4 h-4" />
              Parse
            </TabsTrigger>
            <TabsTrigger 
              value="validate" 
              className="flex items-center gap-2"
              disabled={!parsedData}
            >
              <Hexagon className="w-4 h-4" />
              Validate
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="flex items-center gap-2"
              disabled={validationResults.length === 0}
            >
              <Star className="w-4 h-4" />
              AI
            </TabsTrigger>
            <TabsTrigger 
              value="transform" 
              className="flex items-center gap-2"
              disabled={!parsedData}
            >
              <FileText className="w-4 h-4" />
              Transform
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mapper" className="mt-6">
            <SchemaMapper onSchemaGenerated={handleSchemaGenerated} />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <FileUpload onFileUploaded={handleFileUploaded} />
          </TabsContent>

          <TabsContent value="parse" className="mt-6">
            <SchemaVisualization 
              currentFile={currentFile}
              parsedData={parsedData}
              onFileParsed={handleFileParsed}
            />
          </TabsContent>

          <TabsContent value="validate" className="mt-6">
            <ValidationResults 
              parsedData={parsedData}
              validationResults={validationResults}
              onValidationComplete={handleValidationComplete}
            />
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <AISuggestions 
              validationResults={validationResults}
              currentFile={currentFile}
            />
          </TabsContent>

          <TabsContent value="transform" className="mt-6">
            <TransformationPanel 
              parsedData={parsedData}
              currentFile={currentFile}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
