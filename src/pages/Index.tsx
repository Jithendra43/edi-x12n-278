import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SchemaMapper from '@/components/SchemaMapper';
import FileUpload from '@/components/FileUpload';
import ValidationResults from '@/components/ValidationResults';
import AISuggestions from '@/components/AISuggestions';
import TransformationPanel from '@/components/TransformationPanel';
import TransactionHistory from '@/components/TransactionHistory';
import { FileText, Upload, Hexagon, Star, Folder, Settings, ChevronRight } from 'lucide-react';

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
  const [fixedEDIContent, setFixedEDIContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState('mapper');
  const [selectedTransaction, setSelectedTransaction] = useState('278');
  const [selectedVersion, setSelectedVersion] = useState('005010X217');

  const transactionTypes = [
    { value: '270', label: '270 - Eligibility, Coverage or Benefit Inquiry' },
    { value: '271', label: '271 - Eligibility, Coverage or Benefit Response' },
    { value: '278', label: '278 - Health Care Services Review Request' },
    { value: '837', label: '837 - Health Care Claim: Professional' },
    { value: '835', label: '835 - Health Care Claim Payment/Advice' },
    { value: '275', label: '275 - Patient Information' },
    { value: '277', label: '277 - Health Care Information Status Notification' },
    { value: '999', label: '999 - Implementation Acknowledgment' },
    { value: 'TA1', label: 'TA1 - Interchange Acknowledgment' }
  ];

  const versions = [
    { value: '005010X217', label: '005010X217 - CMS esMD X12N 278 Companion Guide AR2024.10.0' },
    { value: '005010X212', label: '005010X212 - ASC X12N Standard' },
    { value: '005010X279', label: '005010X279 - CMS Implementation' },
    { value: '004010X094', label: '004010X094 - Legacy Standard' }
  ];

  const handleSchemaGenerated = (schema: CustomSchema) => {
    setCustomSchema(schema);
    console.log('Custom schema generated:', schema);
  };

  const handleFileUploaded = (file: EDIFile) => {
    setCurrentFile(file);
    console.log('File uploaded:', file);
  };

  const handleFileParsed = (data: ParsedEDI) => {
    setParsedData(data);
    console.log('File parsed:', data);
  };

  const handleValidationComplete = (results: ValidationResult[]) => {
    setValidationResults(results);
    console.log('Validation complete:', results);
  };

  const handleFixedEDI = (content: string) => {
    setFixedEDIContent(content);
    console.log('Fixed EDI content:', content);
  };

  const canNavigateToTab = (tabName: string) => {
    switch (tabName) {
      case 'mapper': return true;
      case 'upload': return !!customSchema;
      case 'validate': return !!currentFile;
      case 'ai': return validationResults.length > 0;
      case 'transform': return !!parsedData;
      case 'history': return true;
      default: return false;
    }
  };

  const navigateToNext = () => {
    const tabOrder = ['mapper', 'upload', 'validate', 'ai', 'transform', 'history'];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      const nextTab = tabOrder[currentIndex + 1];
      if (canNavigateToTab(nextTab)) {
        setActiveTab(nextTab);
      }
    }
  };

  const getNextButtonText = () => {
    switch (activeTab) {
      case 'mapper': return 'Proceed to Upload';
      case 'upload': return 'Proceed to Validate';
      case 'validate': return 'Proceed to AI';
      case 'ai': return 'Proceed to Transform';
      case 'transform': return 'Proceed to History';
      default: return '';
    }
  };

  const canShowNextButton = () => {
    switch (activeTab) {
      case 'mapper': return !!customSchema;
      case 'upload': return !!currentFile;
      case 'validate': return validationResults.length > 0;
      case 'ai': return true;
      case 'transform': return true;
      default: return false;
    }
  };

  const getTransactionDescription = () => {
    const transaction = transactionTypes.find(t => t.value === selectedTransaction);
    const version = versions.find(v => v.value === selectedVersion);
    return `ASC X12N ${selectedTransaction} – ${transaction?.label.split(' - ')[1] || 'Health Care Services Review'} – Request for Review & Response (${selectedVersion})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Global Header with Transaction Selector */}
        <Card className="mb-6 border-blue-200 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">C-HIT EVIQ</h1>
                  <p className="text-lg text-blue-600 font-medium">EVIQ: Intelligent EDI. Verified. Interpreted. Qualified</p>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  HIPAA Compliant
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  TR3/CMS Certified
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  AI Enhanced
                </span>
              </div>

              {/* Transaction Selector */}
              <div className="bg-gray-50 rounded-lg p-4 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Transaction Type</label>
                    <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transactionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Implementation Version</label>
                    <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map(version => (
                          <SelectItem key={version.value} value={version.value}>
                            {version.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-center text-sm font-medium text-blue-800 bg-blue-100 rounded p-2">
                  {getTransactionDescription()}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Status Cards */}
        {currentFile && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Active File: {currentFile.name}
              </CardTitle>
              <CardDescription className="text-center">
                Status: <span className="capitalize font-medium text-blue-700">{currentFile.status}</span> • 
                Size: {Math.round(currentFile.size / 1024)}KB • 
                Uploaded: {currentFile.uploadedAt.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {customSchema && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
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

        {/* Main Workflow Tabs - Removed Parser */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm border">
            <TabsTrigger value="mapper" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Mapper
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className="flex items-center gap-2"
              disabled={!canNavigateToTab('upload')}
            >
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger 
              value="validate" 
              className="flex items-center gap-2"
              disabled={!canNavigateToTab('validate')}
            >
              <Hexagon className="w-4 h-4" />
              Validate
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="flex items-center gap-2"
              disabled={!canNavigateToTab('ai')}
            >
              <Star className="w-4 h-4" />
              AI
            </TabsTrigger>
            <TabsTrigger 
              value="transform" 
              className="flex items-center gap-2"
              disabled={!canNavigateToTab('transform')}
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
            <SchemaMapper 
              onSchemaGenerated={handleSchemaGenerated}
              selectedTransaction={selectedTransaction}
              selectedVersion={selectedVersion}
            />
            {canShowNextButton() && (
              <div className="flex justify-center mt-6">
                <Button onClick={navigateToNext} className="bg-blue-600 hover:bg-blue-700">
                  {getNextButtonText()}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <FileUpload onFileUploaded={handleFileUploaded} />
            {canShowNextButton() && (
              <div className="flex justify-center mt-6">
                <Button onClick={navigateToNext} className="bg-blue-600 hover:bg-blue-700">
                  {getNextButtonText()}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="validate" className="mt-6">
            <ValidationResults 
              parsedData={parsedData}
              validationResults={validationResults}
              onValidationComplete={handleValidationComplete}
              customSchema={customSchema}
              currentFile={currentFile}
              onFileParsed={handleFileParsed}
            />
            {canShowNextButton() && (
              <div className="flex justify-center mt-6">
                <Button onClick={navigateToNext} className="bg-blue-600 hover:bg-blue-700">
                  {getNextButtonText()}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <AISuggestions 
              validationResults={validationResults}
              currentFile={currentFile}
              onFixedEDI={handleFixedEDI}
            />
            {canShowNextButton() && (
              <div className="flex justify-center mt-6">
                <Button onClick={navigateToNext} className="bg-blue-600 hover:bg-blue-700">
                  {getNextButtonText()}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transform" className="mt-6">
            <TransformationPanel 
              parsedData={parsedData}
              currentFile={currentFile}
              fixedEDIContent={fixedEDIContent}
            />
            {canShowNextButton() && (
              <div className="flex justify-center mt-6">
                <Button onClick={navigateToNext} className="bg-blue-600 hover:bg-blue-700">
                  {getNextButtonText()}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <TransactionHistory 
              currentFile={currentFile}
              customSchema={customSchema}
              validationResults={validationResults}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
