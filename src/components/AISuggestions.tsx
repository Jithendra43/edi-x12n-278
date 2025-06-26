
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, FileText, X } from 'lucide-react';
import { ValidationResult, EDIFile } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface AISuggestion {
  id: string;
  type: 'fix' | 'enhancement' | 'compliance';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  autoFixAvailable: boolean;
  relatedValidation?: ValidationResult;
}

interface AISuggestionsProps {
  validationResults: ValidationResult[];
  currentFile: EDIFile | null;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ validationResults, currentFile }) => {
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          type: 'fix',
          title: 'Missing Required Patient Identifier',
          description: 'NM1 segment in loop 2100C is missing required patient identifier. Add NM109 element with patient ID.',
          confidence: 95,
          impact: 'high',
          autoFixAvailable: true,
          relatedValidation: validationResults.find(r => r.segment === 'NM1*IL')
        },
        {
          id: '2',
          type: 'compliance',
          title: 'CAQH CORE Rule Violation',
          description: 'UM segment requires specific service type codes for CAQH CORE compliance. Consider using code "1" for admission review.',
          confidence: 87,
          impact: 'medium',
          autoFixAvailable: true
        },
        {
          id: '3',
          type: 'enhancement',
          title: 'Optimize Prior Authorization Workflow',
          description: 'Adding DTP segments with certification effective dates can improve processing time and reduce rejections.',
          confidence: 72,
          impact: 'low',
          autoFixAvailable: false
        },
        {
          id: '4',
          type: 'fix',
          title: 'Invalid Date Format',
          description: 'DTP segment contains date in incorrect format. HIPAA requires CCYYMMDD format for service dates.',
          confidence: 98,
          impact: 'high',
          autoFixAvailable: true
        },
        {
          id: '5',
          type: 'compliance',
          title: 'Companion Guide Alignment',
          description: 'Provider NPI in NM1 segment should match the rendering provider. Verify against payer companion guide requirements.',
          confidence: 84,
          impact: 'medium',
          autoFixAvailable: false
        }
      ];
      
      setSuggestions(mockSuggestions);
      setIsGenerating(false);
      
      toast({
        title: "AI analysis complete",
        description: `Generated ${mockSuggestions.length} suggestions for improvement`,
      });
    }, 2000);
  };

  const applyFix = (suggestionId: string) => {
    const newApplied = new Set(appliedFixes);
    newApplied.add(suggestionId);
    setAppliedFixes(newApplied);
    
    toast({
      title: "Fix applied",
      description: "The suggested fix has been applied to your EDI data",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fix': return 'bg-red-100 text-red-800 border-red-200';
      case 'enhancement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'compliance': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            AI-Powered Enhancement Suggestions
          </CardTitle>
          <CardDescription>
            Get intelligent recommendations for improving compliance, fixing errors, and optimizing your EDI transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentFile ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No file available for analysis. Please upload and process an EDI file first.</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">Ready to analyze your EDI file with AI</p>
                <Button 
                  onClick={generateSuggestions}
                  disabled={isGenerating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? 'Analyzing...' : 'Generate AI Suggestions'}
                </Button>
              </div>
              
              {isGenerating && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-4 bg-purple-50 rounded">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-purple-700">AI analyzing your EDI data...</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Checking HIPAA compliance rules</p>
                    <p>• Validating against CAQH CORE requirements</p>
                    <p>• Analyzing companion guide alignment</p>
                    <p>• Generating optimization recommendations</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {suggestions.length} suggestions generated • {appliedFixes.size} fixes applied
                </p>
                <Button 
                  onClick={generateSuggestions}
                  variant="outline"
                  size="sm"
                  className="text-purple-600"
                >
                  Refresh Analysis
                </Button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {suggestions.map((suggestion) => {
                  const isApplied = appliedFixes.has(suggestion.id);
                  return (
                    <div key={suggestion.id} className={`p-4 rounded-lg border ${isApplied ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getTypeColor(suggestion.type)}`}>
                            {suggestion.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                            {suggestion.impact.toUpperCase()} IMPACT
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.confidence}% confidence
                          </Badge>
                        </div>
                        {isApplied && (
                          <Badge className="bg-green-100 text-green-800">Applied</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                        
                        {suggestion.relatedValidation && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <span className="font-medium">Related validation:</span> {suggestion.relatedValidation.message}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-3">
                          {suggestion.autoFixAvailable && !isApplied && (
                            <Button
                              size="sm"
                              onClick={() => applyFix(suggestion.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Apply Fix
                            </Button>
                          )}
                          {!suggestion.autoFixAvailable && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              Manual review required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AISuggestions;
