
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Hexagon, FileText, CheckCircle } from 'lucide-react';
import { ParsedEDI, ValidationResult, CustomSchema, EDIFile } from '@/pages/Index';
import { mockValidateEDI, mockParseEDI } from '@/utils/mockApi';
import { validateWithESLOverlay } from '@/utils/eslValidator';
import { useToast } from '@/hooks/use-toast';

interface ValidationResultsProps {
  parsedData: ParsedEDI | null;
  validationResults: ValidationResult[];
  onValidationComplete: (results: ValidationResult[]) => void;
  customSchema?: CustomSchema | null;
  currentFile?: EDIFile | null;
  onFileParsed?: (data: ParsedEDI) => void;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({
  parsedData,
  validationResults,
  onValidationComplete,
  customSchema,
  currentFile,
  onFileParsed
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [useCustomSchema, setUseCustomSchema] = useState(false);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [autoValidationRun, setAutoValidationRun] = useState(false);
  const { toast } = useToast();

  // Auto-run default validation when file is uploaded
  useEffect(() => {
    const runAutoValidation = async () => {
      if (currentFile && !autoValidationRun && !parsedData) {
        setIsValidating(true);
        try {
          // First parse the file
          const parsed = await mockParseEDI(currentFile);
          onFileParsed?.(parsed);
          
          // Then run default validation
          const results = await mockValidateEDI(parsed, false);
          onValidationComplete(results);
          setAutoValidationRun(true);
          
          toast({
            title: "Automatic validation complete",
            description: `ANSI X12 default schema validation completed`,
          });
        } catch (error) {
          toast({
            title: "Auto-validation failed",
            description: "Unable to automatically validate the EDI file",
            variant: "destructive"
          });
        } finally {
          setIsValidating(false);
        }
      }
    };

    runAutoValidation();
  }, [currentFile, autoValidationRun, parsedData, onFileParsed, onValidationComplete, toast]);

  const handleValidation = async () => {
    if (!parsedData) return;

    setIsValidating(true);
    try {
      let results: ValidationResult[];
      
      if (useCustomSchema && customSchema) {
        results = await validateWithESLOverlay(parsedData, true);
      } else {
        results = await mockValidateEDI(parsedData, false);
      }
      
      onValidationComplete(results);
      
      const errorCount = results.filter(r => r.type === 'error').length;
      const warningCount = results.filter(r => r.type === 'warning').length;
      
      toast({
        title: "Validation complete",
        description: `Found ${errorCount} error(s) and ${warningCount} warning(s)${useCustomSchema && customSchema ? ' using custom ESL overlay' : ' using default schema'}`,
      });
    } catch (error) {
      toast({
        title: "Validation failed",
        description: "Unable to validate the EDI file",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const filteredResults = validationResults.filter(result => 
    filter === 'all' || result.type === filter
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSNIPLevel = (level: number) => {
    const levels = [
      { level: 1, name: 'Syntax', description: 'Basic EDI syntax validation' },
      { level: 2, name: 'Structure', description: 'Segment and loop structure' },
      { level: 3, name: 'Semantics', description: 'Data element relationships' },
      { level: 4, name: 'Business Rules', description: 'Transaction-specific rules' },
      { level: 5, name: 'Code Sets', description: 'Valid code validation' },
      { level: 6, name: 'Situational', description: 'Conditional requirements' },
      { level: 7, name: 'Implementation', description: 'Custom schema rules' }
    ];
    return levels.find(l => l.level === level) || levels[0];
  };

  const calculateComplianceScore = () => {
    if (validationResults.length === 0) return 100;
    const errorCount = validationResults.filter(r => r.type === 'error').length;
    const warningCount = validationResults.filter(r => r.type === 'warning').length;
    return Math.max(0, 100 - (errorCount * 15) - (warningCount * 5));
  };

  const errorCount = validationResults.filter(r => r.type === 'error').length;
  const warningCount = validationResults.filter(r => r.type === 'warning').length;
  const infoCount = validationResults.filter(r => r.type === 'info').length;
  const complianceScore = calculateComplianceScore();

  // Generate SNIP Level summary
  const snipLevels = [1, 2, 3, 4, 5, 6, 7].map(level => {
    const levelResults = validationResults.filter(r => r.level === level);
    const levelErrors = levelResults.filter(r => r.type === 'error').length;
    const snipInfo = getSNIPLevel(level);
    
    return {
      level,
      name: snipInfo.name,
      description: snipInfo.description,
      passed: levelErrors === 0,
      errorCount: levelErrors,
      warningCount: levelResults.filter(r => r.type === 'warning').length,
      infoCount: levelResults.filter(r => r.type === 'info').length
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Hexagon className="w-5 h-5" />
            SNIP Level Validation - ASC X12N 005010X217
          </CardTitle>
          <CardDescription className="text-center">
            Comprehensive validation using CMS esMD X12N 278 Companion Guide AR2024.10.0
            {customSchema && (
              <span className="block mt-2 text-blue-600 font-medium">
                Custom schema available: {customSchema.transactionType} {customSchema.version}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentFile ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No file available for validation. Please upload an EDI file first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Auto-validation status */}
              {autoValidationRun && (
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Automatic ANSI X12 default schema validation completed
                  </span>
                </div>
              )}

              {/* Custom Schema Toggle */}
              {customSchema && (
                <div className="flex items-center justify-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-sm font-medium">Validate with Custom Schema</span>
                  <Switch
                    checked={useCustomSchema}
                    onCheckedChange={setUseCustomSchema}
                  />
                  <span className="text-xs text-blue-600">
                    {useCustomSchema ? 'Using custom ESL overlay' : 'Using default schema'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="font-medium">
                    {parsedData ? 'Ready for validation' : 'Processing file...'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {parsedData ? `${parsedData.transactionCount} transaction(s) processed` : 'Parsing EDI structure...'}
                  </p>
                </div>
                <Button 
                  onClick={handleValidation}
                  disabled={isValidating || !parsedData}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isValidating ? 'Validating...' : useCustomSchema ? 'Run Custom Validation' : 'Re-run Default Validation'}
                </Button>
              </div>
              
              {isValidating && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-700">
                      Running SNIP Level 1-7 validation with {useCustomSchema && customSchema ? 'custom ESL overlay' : 'default schema'}...
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {snipLevels.map(snipLevel => (
                      <div key={snipLevel.level} className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs font-medium">Level {snipLevel.level}</div>
                        <div className="text-xs text-gray-600">{snipLevel.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SNIP Level Summary */}
      {validationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">SNIP Level Compliance Summary</CardTitle>
            <CardDescription className="text-center">
              Overall Compliance Score: <span className={`font-bold text-lg ${complianceScore >= 90 ? 'text-green-600' : complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                {complianceScore}%
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {snipLevels.map(snipLevel => (
                <div key={snipLevel.level} className="flex items-center gap-4 p-3 border rounded">
                  <div className="w-12 text-center">
                    <div className="text-sm font-bold">L{snipLevel.level}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{snipLevel.name}</div>
                    <div className="text-xs text-gray-600">{snipLevel.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${snipLevel.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {snipLevel.passed ? 'PASS' : 'FAIL'}
                    </Badge>
                    {snipLevel.errorCount > 0 && (
                      <Badge variant="outline" className="text-xs text-red-600">
                        {snipLevel.errorCount} errors
                      </Badge>
                    )}
                    {snipLevel.warningCount > 0 && (
                      <Badge variant="outline" className="text-xs text-amber-600">
                        {snipLevel.warningCount} warnings
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {validationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-4">
              <span>Detailed Validation Results</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {errorCount} Errors
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {warningCount} Warnings
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {infoCount} Info
                </Badge>
              </div>
            </CardTitle>
            <CardDescription className="text-center">
              {errorCount === 0 ? (
                <span className="flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  No critical errors found - ready for processing
                </span>
              ) : (
                `${errorCount} critical issues require attention before processing`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({validationResults.length})
                </Button>
                <Button
                  variant={filter === 'error' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('error')}
                  className={filter === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Errors ({errorCount})
                </Button>
                <Button
                  variant={filter === 'warning' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('warning')}
                  className={filter === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  Warnings ({warningCount})
                </Button>
                <Button
                  variant={filter === 'info' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('info')}
                  className={filter === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  Info ({infoCount})
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredResults.map((result, index) => {
                  const snipLevel = getSNIPLevel(result.level);
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${getTypeColor(result.type)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            SNIP Level {result.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {snipLevel.name}
                          </Badge>
                          <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                            {result.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">{result.message}</p>
                        <div className="text-sm">
                          <span className="font-medium">Segment:</span> {result.segment}
                          {result.element && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-medium">Element:</span> {result.element}
                            </>
                          )}
                        </div>
                        {result.suggestion && (
                          <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                            <span className="font-medium text-green-700">Suggestion:</span> {result.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ValidationResults;
