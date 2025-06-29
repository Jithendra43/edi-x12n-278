import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hexagon, FileText, CheckCircle } from 'lucide-react';
import { ParsedEDI, ValidationResult, CustomSchema } from '@/pages/Index';
import { mockValidateEDI } from '@/utils/mockApi';
import { useToast } from '@/hooks/use-toast';

interface ValidationResultsProps {
  parsedData: ParsedEDI | null;
  validationResults: ValidationResult[];
  onValidationComplete: (results: ValidationResult[]) => void;
  customSchema?: CustomSchema | null;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({
  parsedData,
  validationResults,
  onValidationComplete,
  customSchema
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const { toast } = useToast();

  const handleValidation = async () => {
    if (!parsedData) return;

    setIsValidating(true);
    try {
      // Use custom schema if available
      const results = await mockValidateEDI(parsedData, !!customSchema);
      onValidationComplete(results);
      
      const errorCount = results.filter(r => r.type === 'error').length;
      const warningCount = results.filter(r => r.type === 'warning').length;
      
      toast({
        title: "Validation complete",
        description: `Found ${errorCount} error(s) and ${warningCount} warning(s)${customSchema ? ' using custom ESL overlay' : ''}`,
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

  const errorCount = validationResults.filter(r => r.type === 'error').length;
  const warningCount = validationResults.filter(r => r.type === 'warning').length;
  const infoCount = validationResults.filter(r => r.type === 'info').length;

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
                Using custom ESL overlay: {customSchema.transactionType} {customSchema.version}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!parsedData ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No parsed data available. Please parse an EDI file first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="font-medium">Ready for validation</p>
                  <p className="text-sm text-gray-600">
                    {parsedData.transactionCount} transaction(s) to validate
                    {customSchema && <span className="text-blue-600"> with custom ESL overlay</span>}
                  </p>
                </div>
                <Button 
                  onClick={handleValidation}
                  disabled={isValidating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isValidating ? 'Validating...' : 'Run SNIP Validation'}
                </Button>
              </div>
              
              {isValidating && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-700">
                      Running SNIP Level 1-7 validation with {customSchema ? 'custom ESL overlay' : 'default schema'}...
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(level => {
                      const snipLevel = getSNIPLevel(level);
                      return (
                        <div key={level} className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-xs font-medium">Level {level}</div>
                          <div className="text-xs text-gray-600">{snipLevel.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {validationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-4">
              <span>Validation Results</span>
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
