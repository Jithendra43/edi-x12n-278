
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SchemaElement {
  id: string;
  name: string;
  description: string;
  type: 'loop' | 'segment' | 'element';
  required: boolean;
  status: 'mandatory' | 'optional' | 'removed';
  children?: SchemaElement[];
  maxOccurs?: number;
  elements?: number;
}

interface CustomSchema {
  transactionType: string;
  version: string;
  elements: SchemaElement[];
  generatedAt: Date;
}

interface SchemaMapperProps {
  onSchemaGenerated: (schema: CustomSchema) => void;
}

const SchemaMapper: React.FC<SchemaMapperProps> = ({ onSchemaGenerated }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [schemaElements, setSchemaElements] = useState<SchemaElement[]>([]);
  const [customElements, setCustomElements] = useState<SchemaElement[]>([]);
  const { toast } = useToast();

  const transactionTypes = [
    { value: '270', label: '270 - Eligibility Inquiry' },
    { value: '271', label: '271 - Eligibility Response' },
    { value: '278', label: '278 - Prior Authorization Request' },
    { value: '837', label: '837 - Healthcare Claim' },
    { value: '835', label: '835 - Healthcare Claim Payment' },
    { value: '275', label: '275 - Patient Information' },
    { value: '277', label: '277 - Healthcare Claim Status' },
    { value: '999', label: '999 - Implementation Acknowledgment' },
    { value: 'TA1', label: 'TA1 - Interchange Acknowledgment' }
  ];

  const versions = [
    { value: '005010X217', label: '005010X217 - CAQH CORE' },
    { value: '005010X212', label: '005010X212 - ASC X12N' },
    { value: '005010X279', label: '005010X279 - CMS' }
  ];

  const defaultSchema278: SchemaElement[] = [
    {
      id: 'ISA',
      name: 'ISA - Interchange Control Header',
      description: 'Defines the start of an interchange',
      type: 'segment',
      required: true,
      status: 'mandatory',
      elements: 16
    },
    {
      id: 'GS',
      name: 'GS - Functional Group Header',
      description: 'Defines the start of a functional group',
      type: 'segment',
      required: true,
      status: 'mandatory',
      elements: 8
    },
    {
      id: 'ST',
      name: 'ST - Transaction Set Header',
      description: 'Defines the start of a transaction set',
      type: 'segment',
      required: true,
      status: 'mandatory',
      elements: 3
    },
    {
      id: 'BHT',
      name: 'BHT - Beginning of Hierarchical Transaction',
      description: 'Defines the business purpose and reference identification',
      type: 'segment',
      required: true,
      status: 'mandatory',
      elements: 6
    },
    {
      id: '2000A',
      name: '2000A - UMO Level',
      description: 'Utilization Management Organization Level',
      type: 'loop',
      required: true,
      status: 'mandatory',
      maxOccurs: 1,
      children: [
        {
          id: 'HL_2000A',
          name: 'HL - Hierarchical Level',
          description: 'UMO hierarchical level',
          type: 'segment',
          required: true,
          status: 'mandatory',
          elements: 4
        },
        {
          id: 'NM1_2000A',
          name: 'NM1 - Entity Identifier',
          description: 'UMO name and identification',
          type: 'segment',
          required: true,
          status: 'mandatory',
          elements: 9
        }
      ]
    },
    {
      id: '2000B',
      name: '2000B - Requester Level',
      description: 'Information Source Level',
      type: 'loop',
      required: true,
      status: 'mandatory',
      maxOccurs: 1,
      children: [
        {
          id: 'HL_2000B',
          name: 'HL - Hierarchical Level',
          description: 'Requester hierarchical level',
          type: 'segment',
          required: true,
          status: 'mandatory',
          elements: 4
        },
        {
          id: 'NM1_2000B',
          name: 'NM1 - Entity Identifier',
          description: 'Requester name and identification',
          type: 'segment',
          required: true,
          status: 'mandatory',
          elements: 9
        }
      ]
    },
    {
      id: '2000C',
      name: '2000C - Patient Level',
      description: 'Patient Level',
      type: 'loop',
      required: true,
      status: 'mandatory',
      maxOccurs: 1,
      children: [
        {
          id: 'HL_2000C',
          name: 'HL - Hierarchical Level',
          description: 'Patient hierarchical level',
          type: 'segment',
          required: true,
          status: 'mandatory',
          elements: 4
        },
        {
          id: 'NM1_2000C',
          name: 'NM1 - Entity Identifier',
          description: 'Patient name and identification',
          type: 'segment',
          required: true,
          status: 'mandatory',
          elements: 9
        },
        {
          id: 'DMG',
          name: 'DMG - Patient Demographics',
          description: 'Patient demographic information',
          type: 'segment',
          required: false,
          status: 'optional',
          elements: 11
        }
      ]
    },
    {
      id: '2000E',
      name: '2000E - Service Level',
      description: 'Service Level',
      type: 'loop',
      required: true,
      status: 'mandatory',
      maxOccurs: 99,
      children: [
        {
          id: 'HL_2000E',
          name: 'HL - Hierarchical Level',
          description: 'Service hierarchical level',
          type: 'segment',
          required: true,
          status: 'mandatory',
          elements: 4
        },
        {
          id: 'UM',
          name: 'UM - Health Care Services Review',
          description: 'Service review information',
          type: 'segment',
          required: true,
          status: 'mandatory',
          elements: 9
        },
        {
          id: 'DTP',
          name: 'DTP - Date/Time Period',
          description: 'Service date information',
          type: 'segment',
          required: false,
          status: 'optional',
          elements: 3
        },
        {
          id: 'PWK',
          name: 'PWK - Paperwork',
          description: 'Additional documentation',
          type: 'segment',
          required: false,
          status: 'optional',
          elements: 9
        }
      ]
    },
    {
      id: 'SE',
      name: 'SE - Transaction Set Trailer',
      description: 'Defines the end of a transaction set',
      type: 'segment',
      required: true,
      status: 'mandatory',
      elements: 2
    },
    {
      id: 'GE',
      name: 'GE - Functional Group Trailer',
      description: 'Defines the end of a functional group',
      type: 'segment',
      required: true,
      status: 'mandatory',
      elements: 2
    },
    {
      id: 'IEA',
      name: 'IEA - Interchange Control Trailer',
      description: 'Defines the end of an interchange',
      type: 'segment',
      required: true,
      status: 'mandatory',
      elements: 2
    }
  ];

  const handleTransactionChange = (value: string) => {
    setSelectedTransaction(value);
    if (value === '278') {
      setSchemaElements([...defaultSchema278]);
      setCustomElements([...defaultSchema278]);
    } else {
      // For other transaction types, show basic structure
      setSchemaElements([]);
      setCustomElements([]);
    }
  };

  const toggleElementStatus = (elementId: string, newStatus: 'mandatory' | 'optional' | 'removed') => {
    const updateElements = (elements: SchemaElement[]): SchemaElement[] => {
      return elements.map(element => {
        if (element.id === elementId) {
          return { ...element, status: newStatus };
        }
        if (element.children) {
          return { ...element, children: updateElements(element.children) };
        }
        return element;
      });
    };

    setCustomElements(updateElements(customElements));
  };

  const generateCustomSchema = () => {
    if (!selectedTransaction || !selectedVersion) {
      toast({
        title: "Missing selection",
        description: "Please select both transaction type and version",
        variant: "destructive"
      });
      return;
    }

    const customSchema: CustomSchema = {
      transactionType: selectedTransaction,
      version: selectedVersion,
      elements: customElements,
      generatedAt: new Date()
    };

    toast({
      title: "Custom schema generated",
      description: `Schema for ${selectedTransaction} ${selectedVersion} has been created`,
    });

    onSchemaGenerated(customSchema);
  };

  const downloadSchema = () => {
    const customSchema: CustomSchema = {
      transactionType: selectedTransaction,
      version: selectedVersion,
      elements: customElements,
      generatedAt: new Date()
    };

    const blob = new Blob([JSON.stringify(customSchema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-schema-${selectedTransaction}-${selectedVersion}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Schema downloaded",
      description: "Custom schema file has been saved",
    });
  };

  const renderSchemaElement = (element: SchemaElement, level: number = 0) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'mandatory': return 'bg-red-100 text-red-800 border-red-200';
        case 'optional': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'removed': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div key={element.id} className={`mb-2 ${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {element.type.toUpperCase()}
              </Badge>
              <span className="font-medium">{element.name}</span>
              {element.elements && (
                <Badge variant="outline" className="text-xs">
                  {element.elements} elements
                </Badge>
              )}
              {element.maxOccurs && (
                <Badge variant="outline" className="text-xs">
                  Max: {element.maxOccurs}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{element.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getStatusColor(element.status)}`}>
              {element.status.toUpperCase()}
            </Badge>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleElementStatus(element.id, 'mandatory')}
                className={element.status === 'mandatory' ? 'bg-red-50' : ''}
              >
                M
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleElementStatus(element.id, 'optional')}
                className={element.status === 'optional' ? 'bg-blue-50' : ''}
              >
                O
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleElementStatus(element.id, 'removed')}
                className={element.status === 'removed' ? 'bg-gray-50' : ''}
              >
                R
              </Button>
            </div>
          </div>
        </div>
        {element.children && element.children.map(child => renderSchemaElement(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive Schema Mapper</h2>
        <p className="text-gray-600">Build custom EDI schemas by selecting transaction types and configuring elements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane - Default Schema */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Default Schema Selection</CardTitle>
            <CardDescription className="text-center">
              Choose your HIPAA transaction type and version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Transaction Type</label>
              <Select value={selectedTransaction} onValueChange={handleTransactionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
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

            <div>
              <label className="block text-sm font-medium mb-2">Version</label>
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
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

            {schemaElements.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Default Schema Structure</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {schemaElements.map(element => (
                    <div key={element.id} className="p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">{element.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {element.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Pane - Custom Schema Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Custom Schema Builder</CardTitle>
            <CardDescription className="text-center">
              Configure elements as Mandatory (M), Optional (O), or Removed (R)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customElements.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  {customElements.map(element => renderSchemaElement(element))}
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={generateCustomSchema}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Custom Schema
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={downloadSchema}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a transaction type to begin building your custom schema</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchemaMapper;
