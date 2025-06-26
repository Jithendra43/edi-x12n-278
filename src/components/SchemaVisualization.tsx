
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, FileText, Folder, FolderOpen } from 'lucide-react';
import { EDIFile, ParsedEDI } from '@/pages/Index';
import { mockParseEDI } from '@/utils/mockApi';
import { useToast } from '@/hooks/use-toast';

interface SchemaVisualizationProps {
  currentFile: EDIFile | null;
  parsedData: ParsedEDI | null;
  onFileParsed: (data: ParsedEDI) => void;
}

interface SchemaNode {
  id: string;
  name: string;
  type: 'envelope' | 'loop' | 'segment' | 'element';
  required: boolean;
  maxUse: number;
  children?: SchemaNode[];
  description?: string;
  dataType?: string;
  minLength?: number;
  maxLength?: number;
}

const schemaStructure: SchemaNode = {
  id: 'envelope',
  name: 'X12N 278 Envelope',
  type: 'envelope',
  required: true,
  maxUse: 1,
  children: [
    {
      id: 'isa',
      name: 'ISA - Interchange Control Header',
      type: 'segment',
      required: true,
      maxUse: 1,
      description: 'Defines the start of an interchange'
    },
    {
      id: 'gs',
      name: 'GS - Functional Group Header',
      type: 'segment',
      required: true,
      maxUse: 1,
      description: 'Identifies the functional group'
    },
    {
      id: 'st',
      name: 'ST - Transaction Set Header',
      type: 'segment',
      required: true,
      maxUse: 1,
      description: 'Transaction Set 278 - Health Care Services Review'
    },
    {
      id: '2000a',
      name: '2000A - Utilization Management Organization (UMO) Level',
      type: 'loop',
      required: true,
      maxUse: 1,
      children: [
        {
          id: 'hl_2000a',
          name: 'HL - Hierarchical Level',
          type: 'segment',
          required: true,
          maxUse: 1,
          description: 'UMO level identifier'
        },
        {
          id: '2100a',
          name: '2100A - UMO Identification',
          type: 'loop',
          required: true,
          maxUse: 1,
          children: [
            {
              id: 'nm1_2100a',
              name: 'NM1 - Entity Identifier',
              type: 'segment',
              required: true,
              maxUse: 1,
              description: 'UMO identification'
            }
          ]
        }
      ]
    },
    {
      id: '2000b',
      name: '2000B - Requester Level',
      type: 'loop',
      required: true,
      maxUse: 1,
      children: [
        {
          id: 'hl_2000b',
          name: 'HL - Hierarchical Level',
          type: 'segment',
          required: true,
          maxUse: 1,
          description: 'Requester level identifier'
        },
        {
          id: '2100b',
          name: '2100B - Requester Identification',
          type: 'loop',
          required: true,
          maxUse: 1,
          children: [
            {
              id: 'nm1_2100b',
              name: 'NM1 - Entity Identifier',
              type: 'segment',
              required: true,
              maxUse: 1,
              description: 'Requester identification'
            }
          ]
        }
      ]
    },
    {
      id: '2000c',
      name: '2000C - Patient Level',
      type: 'loop',
      required: true,
      maxUse: 1,
      children: [
        {
          id: 'hl_2000c',
          name: 'HL - Hierarchical Level',
          type: 'segment',
          required: true,
          maxUse: 1,
          description: 'Patient level identifier'
        },
        {
          id: '2100c',
          name: '2100C - Patient Identification',
          type: 'loop',
          required: true,
          maxUse: 1,
          children: [
            {
              id: 'nm1_2100c',
              name: 'NM1 - Entity Identifier',
              type: 'segment',
              required: true,
              maxUse: 1,
              description: 'Patient identification'
            },
            {
              id: 'dtp_2100c',
              name: 'DTP - Date/Time Period',
              type: 'segment',
              required: false,
              maxUse: 9,
              description: 'Patient birth date'
            }
          ]
        }
      ]
    },
    {
      id: '2000e',
      name: '2000E - Service Level',
      type: 'loop',
      required: true,
      maxUse: 1,
      children: [
        {
          id: 'hl_2000e',
          name: 'HL - Hierarchical Level',
          type: 'segment',
          required: true,
          maxUse: 1,
          description: 'Service level identifier'
        },
        {
          id: '2100e',
          name: '2100E - Service Provider Identification',
          type: 'loop',
          required: false,
          maxUse: 1,
          children: [
            {
              id: 'nm1_2100e',
              name: 'NM1 - Entity Identifier',
              type: 'segment',
              required: true,
              maxUse: 1,
              description: 'Service provider identification'
            }
          ]
        },
        {
          id: '2200e',
          name: '2200E - Service Review Information',
          type: 'loop',
          required: true,
          maxUse: 1,
          children: [
            {
              id: 'um_2200e',
              name: 'UM - Health Care Services Review Information',
              type: 'segment',
              required: true,
              maxUse: 1,
              description: 'Service review request details'
            },
            {
              id: 'hcp_2200e',
              name: 'HCP - Health Care Pricing',
              type: 'segment',
              required: false,
              maxUse: 1,
              description: 'Pricing information'
            }
          ]
        }
      ]
    },
    {
      id: 'se',
      name: 'SE - Transaction Set Trailer',
      type: 'segment',
      required: true,
      maxUse: 1,
      description: 'End of transaction set'
    }
  ]
};

const SchemaVisualization: React.FC<SchemaVisualizationProps> = ({ 
  currentFile, 
  parsedData, 
  onFileParsed 
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['envelope']));
  const { toast } = useToast();

  const handleParseFile = async () => {
    if (!currentFile) return;

    setIsParsing(true);
    try {
      const result = await mockParseEDI(currentFile);
      onFileParsed(result);
      toast({
        title: "File parsed successfully",
        description: `Found ${result.transactionCount} transaction(s)`,
      });
    } catch (error) {
      toast({
        title: "Parsing failed",
        description: "Unable to parse the EDI file",
        variant: "destructive"
      });
    } finally {
      setIsParsing(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderSchemaNode = (node: SchemaNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 24;

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'envelope': return 'text-purple-700 bg-purple-100';
        case 'loop': return 'text-blue-700 bg-blue-100';
        case 'segment': return 'text-green-700 bg-green-100';
        case 'element': return 'text-gray-700 bg-gray-100';
        default: return 'text-gray-700 bg-gray-100';
      }
    };

    return (
      <div key={node.id} className="space-y-1">
        <div 
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors`}
          style={{ marginLeft: `${indent}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <Folder className="w-4 h-4 text-gray-600" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-4"></div>}
          
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(node.type)}`}>
            {node.type.toUpperCase()}
          </span>
          
          <span className={`font-medium ${node.required ? 'text-gray-900' : 'text-gray-600'}`}>
            {node.name}
          </span>
          
          {node.required && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>
          )}
          
          {node.maxUse > 1 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Max: {node.maxUse}
            </span>
          )}
        </div>
        
        {node.description && (
          <div className="text-sm text-gray-600 ml-6" style={{ marginLeft: `${indent + 24}px` }}>
            {node.description}
          </div>
        )}
        
        {hasChildren && isExpanded && (
          <div>
            {node.children?.map(child => renderSchemaNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Parse & Analyze EDI Structure
          </CardTitle>
          <CardDescription>
            Parse the uploaded EDI file and visualize its structure against the X12N 278 schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentFile ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No file uploaded yet. Please upload an EDI file first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{currentFile.name}</p>
                  <p className="text-sm text-gray-600">Ready for parsing</p>
                </div>
                <Button 
                  onClick={handleParseFile}
                  disabled={isParsing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isParsing ? 'Parsing...' : 'Parse File'}
                </Button>
              </div>
              
              {isParsing && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-700">Analyzing EDI structure...</span>
                </div>
              )}
              
              {parsedData && (
                <div className="mt-6 p-4 bg-green-50 rounded border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">Parsing Results</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>Transaction Count: {parsedData.transactionCount}</p>
                    <p>ISA Control Number: {parsedData.controlNumbers.isa}</p>
                    <p>GS Control Number: {parsedData.controlNumbers.gs}</p>
                    <p>ST Control Number: {parsedData.controlNumbers.st}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>X12N 278 Schema Structure (005010X217)</CardTitle>
          <CardDescription>
            HIPAA-compliant schema for Prior Authorization Request transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            {renderSchemaNode(schemaStructure)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchemaVisualization;
