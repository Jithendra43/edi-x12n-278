
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Settings, Download, FileCode, Plus, Minus, ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';
import { CustomSchema } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface SchemaMapperProps {
  onSchemaGenerated: (schema: CustomSchema) => void;
}

interface SchemaElement {
  id: string;
  name: string;
  description: string;
  type: 'loop' | 'segment' | 'element';
  required: boolean;
  maxUse: number;
  children?: SchemaElement[];
  status: 'mandatory' | 'optional' | 'removed';
  order: number;
  selected?: boolean;
  minLength?: number;
  maxLength?: number;
  dataType?: string;
}

const SchemaMapper: React.FC<SchemaMapperProps> = ({ onSchemaGenerated }) => {
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [defaultSchema, setDefaultSchema] = useState<SchemaElement[]>([]);
  const [customSchema, setCustomSchema] = useState<SchemaElement[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [showAddElementDialog, setShowAddElementDialog] = useState(false);
  const [newElementName, setNewElementName] = useState('');
  const { toast } = useToast();

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
    { value: '005010X217', label: '005010X217 - Current Implementation Guide' },
    { value: '005010X212', label: '005010X212 - ASC X12N Standard' },
    { value: '005010X279', label: '005010X279 - CMS Implementation' },
    { value: '004010X094', label: '004010X094 - Legacy Standard' }
  ];

  const comprehensive278Schema: SchemaElement[] = [
    {
      id: 'ISA',
      name: 'ISA - Interchange Control Header',
      description: 'Defines the interchange envelope and partner identification',
      type: 'segment',
      required: true,
      maxUse: 1,
      status: 'mandatory',
      order: 1,
      children: [
        { id: 'ISA01', name: 'Authorization Information Qualifier', description: '00=No Authorization, 03=Password', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 1, minLength: 2, maxLength: 2, dataType: 'ID' },
        { id: 'ISA02', name: 'Authorization Information', description: 'Authorization password or spaces', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 2, minLength: 10, maxLength: 10, dataType: 'AN' },
        { id: 'ISA03', name: 'Security Information Qualifier', description: '00=No Security, 01=Password', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 3, minLength: 2, maxLength: 2, dataType: 'ID' },
        { id: 'ISA04', name: 'Security Information', description: 'Security password or spaces', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 4, minLength: 10, maxLength: 10, dataType: 'AN' },
        { id: 'ISA05', name: 'Interchange ID Qualifier', description: 'ZZ=Mutually Defined', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 5, minLength: 2, maxLength: 2, dataType: 'ID' },
        { id: 'ISA06', name: 'Interchange Sender ID', description: 'Sender identification', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 6, minLength: 15, maxLength: 15, dataType: 'AN' }
      ]
    },
    {
      id: 'GS',
      name: 'GS - Functional Group Header',
      description: 'Identifies the functional group and provides control information',
      type: 'segment',
      required: true,
      maxUse: 1,
      status: 'mandatory',
      order: 2,
      children: [
        { id: 'GS01', name: 'Functional Identifier Code', description: 'HS=Health Services', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 1, minLength: 2, maxLength: 2, dataType: 'ID' },
        { id: 'GS02', name: 'Application Sender Code', description: 'Code identifying party sending', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 2, minLength: 2, maxLength: 15, dataType: 'AN' },
        { id: 'GS03', name: 'Application Receiver Code', description: 'Code identifying party receiving', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 3, minLength: 2, maxLength: 15, dataType: 'AN' },
        { id: 'GS04', name: 'Date', description: 'Date of transmission CCYYMMDD', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 4, minLength: 8, maxLength: 8, dataType: 'DT' }
      ]
    },
    {
      id: 'ST',
      name: 'ST - Transaction Set Header',
      description: 'Indicates the start of a transaction set and assigns control number',
      type: 'segment',
      required: true,
      maxUse: 1,
      status: 'mandatory',
      order: 3,
      children: [
        { id: 'ST01', name: 'Transaction Set Identifier Code', description: '278=Health Care Services Review', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 1, minLength: 3, maxLength: 3, dataType: 'ID' },
        { id: 'ST02', name: 'Transaction Set Control Number', description: 'Unique control number', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 2, minLength: 4, maxLength: 9, dataType: 'AN' },
        { id: 'ST03', name: 'Implementation Convention Reference', description: 'Version identifier', type: 'element', required: false, maxUse: 1, status: 'optional', order: 3, minLength: 1, maxLength: 35, dataType: 'AN' }
      ]
    },
    {
      id: 'BHT',
      name: 'BHT - Beginning of Hierarchical Transaction',
      description: 'Defines the business purpose and reference identification',
      type: 'segment',
      required: true,
      maxUse: 1,
      status: 'mandatory',
      order: 4,
      children: [
        { id: 'BHT01', name: 'Hierarchical Structure Code', description: '0007=Hierarchical Structure', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 1, minLength: 4, maxLength: 4, dataType: 'ID' },
        { id: 'BHT02', name: 'Transaction Set Purpose Code', description: '00=Original, 18=Reissue', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 2, minLength: 2, maxLength: 2, dataType: 'ID' },
        { id: 'BHT03', name: 'Reference Identification', description: 'Submitter transaction identifier', type: 'element', required: false, maxUse: 1, status: 'optional', order: 3, minLength: 1, maxLength: 50, dataType: 'AN' },
        { id: 'BHT04', name: 'Date', description: 'Transaction creation date CCYYMMDD', type: 'element', required: false, maxUse: 1, status: 'optional', order: 4, minLength: 8, maxLength: 8, dataType: 'DT' },
        { id: 'BHT05', name: 'Time', description: 'Transaction creation time HHMM', type: 'element', required: false, maxUse: 1, status: 'optional', order: 5, minLength: 4, maxLength: 8, dataType: 'TM' },
        { id: 'BHT06', name: 'Transaction Type Code', description: 'RQ=Request, RS=Response', type: 'element', required: false, maxUse: 1, status: 'optional', order: 6, minLength: 2, maxLength: 2, dataType: 'ID' }
      ]
    },
    {
      id: 'LOOP_2000A',
      name: '2000A - Utilization Management Organization (UMO) Level',
      description: 'Loop containing UMO information for the transaction',
      type: 'loop',
      required: true,
      maxUse: 1,
      status: 'mandatory',
      order: 5,
      children: [
        {
          id: 'HL_2000A',
          name: 'HL - Hierarchical Level',
          description: 'Hierarchical level for UMO',
          type: 'segment',
          required: true,
          maxUse: 1,
          status: 'mandatory',
          order: 1,
          children: [
            { id: 'HL01_2000A', name: 'Hierarchical ID Number', description: 'Unique hierarchical ID', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 1, minLength: 1, maxLength: 12, dataType: 'AN' },
            { id: 'HL02_2000A', name: 'Hierarchical Parent ID Number', description: 'Parent hierarchical ID', type: 'element', required: false, maxUse: 1, status: 'optional', order: 2, minLength: 1, maxLength: 12, dataType: 'AN' },
            { id: 'HL03_2000A', name: 'Hierarchical Level Code', description: '20=Information Source', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 3, minLength: 1, maxLength: 2, dataType: 'ID' },
            { id: 'HL04_2000A', name: 'Hierarchical Child Code', description: '0=No Child, 1=Child Exists', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 4, minLength: 1, maxLength: 1, dataType: 'ID' }
          ]
        },
        {
          id: 'NM1_2000A',
          name: 'NM1 - Entity Identifier',
          description: 'UMO identification and demographic information',
          type: 'segment',
          required: true,
          maxUse: 1,
          status: 'mandatory',
          order: 2,
          children: [
            { id: 'NM101_2000A', name: 'Entity Identifier Code', description: 'X3=UMO', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 1, minLength: 2, maxLength: 3, dataType: 'ID' },
            { id: 'NM102_2000A', name: 'Entity Type Qualifier', description: '2=Non-Person Entity', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 2, minLength: 1, maxLength: 1, dataType: 'ID' },
            { id: 'NM103_2000A', name: 'Name Last or Organization Name', description: 'UMO organization name', type: 'element', required: false, maxUse: 1, status: 'optional', order: 3, minLength: 1, maxLength: 60, dataType: 'AN' },
            { id: 'NM108_2000A', name: 'Identification Code Qualifier', description: 'PI=Payor Identification', type: 'element', required: false, maxUse: 1, status: 'optional', order: 8, minLength: 1, maxLength: 2, dataType: 'ID' },
            { id: 'NM109_2000A', name: 'Identification Code', description: 'UMO identifier', type: 'element', required: false, maxUse: 1, status: 'optional', order: 9, minLength: 2, maxLength: 80, dataType: 'AN' }
          ]
        }
      ]
    },
    {
      id: 'LOOP_2000B',
      name: '2000B - Requester Level',
      description: 'Loop containing information source/requester information',
      type: 'loop',
      required: true,
      maxUse: 1,
      status: 'mandatory',
      order: 6,
      children: [
        {
          id: 'HL_2000B',
          name: 'HL - Hierarchical Level',
          description: 'Hierarchical level for information source',
          type: 'segment',
          required: true,
          maxUse: 1,
          status: 'mandatory',
          order: 1,
          children: [
            { id: 'HL01_2000B', name: 'Hierarchical ID Number', description: 'Unique hierarchical ID', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 1, minLength: 1, maxLength: 12, dataType: 'AN' },
            { id: 'HL02_2000B', name: 'Hierarchical Parent ID Number', description: 'Parent hierarchical ID', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 2, minLength: 1, maxLength: 12, dataType: 'AN' },
            { id: 'HL03_2000B', name: 'Hierarchical Level Code', description: '21=Information Receiver', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 3, minLength: 1, maxLength: 2, dataType: 'ID' },
            { id: 'HL04_2000B', name: 'Hierarchical Child Code', description: '0=No Child, 1=Child Exists', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 4, minLength: 1, maxLength: 1, dataType: 'ID' }
          ]
        },
        {
          id: 'NM1_2000B',
          name: 'NM1 - Entity Identifier',
          description: 'Information source identification',
          type: 'segment',
          required: true,
          maxUse: 1,
          status: 'mandatory',
          order: 2,
          children: [
            { id: 'NM101_2000B', name: 'Entity Identifier Code', description: '1P=Provider', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 1, minLength: 2, maxLength: 3, dataType: 'ID' },
            { id: 'NM102_2000B', name: 'Entity Type Qualifier', description: '1=Person, 2=Non-Person', type: 'element', required: true, maxUse: 1, status: 'mandatory', order: 2, minLength: 1, maxLength: 1, dataType: 'ID' },
            { id: 'NM103_2000B', name: 'Name Last or Organization Name', description: 'Provider last name or organization', type: 'element', required: false, maxUse: 1, status: 'optional', order: 3, minLength: 1, maxLength: 60, dataType: 'AN' },
            { id: 'NM104_2000B', name: 'Name First', description: 'Provider first name', type: 'element', required: false, maxUse: 1, status: 'optional', order: 4, minLength: 1, maxLength: 35, dataType: 'AN' },
            { id: 'NM105_2000B', name: 'Name Middle', description: 'Provider middle name', type: 'element', required: false, maxUse: 1, status: 'optional', order: 5, minLength: 1, maxLength: 25, dataType: 'AN' },
            { id: 'NM108_2000B', name: 'Identification Code Qualifier', description: 'XX=NPI', type: 'element', required: false, maxUse: 1, status: 'optional', order: 8, minLength: 1, maxLength: 2, dataType: 'ID' },
            { id: 'NM109_2000B', name: 'Identification Code', description: 'Provider NPI', type: 'element', required: false, maxUse: 1, status: 'optional', order: 9, minLength: 2, maxLength: 80, dataType: 'AN' }
          ]
        }
      ]
    }
  ];

  const handleTransactionChange = (value: string) => {
    setSelectedTransaction(value);
    if (value === '278') {
      setDefaultSchema([...comprehensive278Schema]);
      setCustomSchema([...comprehensive278Schema]);
      setExpandedNodes(new Set(['ISA', 'GS', 'ST', 'BHT', 'LOOP_2000A', 'LOOP_2000B']));
    } else {
      // For other transaction types, provide basic structure
      const basicSchema = comprehensive278Schema.slice(0, 4); // ISA, GS, ST, BHT
      setDefaultSchema([...basicSchema]);
      setCustomSchema([...basicSchema]);
      setExpandedNodes(new Set(['ISA', 'GS', 'ST', 'BHT']));
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

  const toggleElementSelection = (elementId: string) => {
    const newSelected = new Set(selectedElements);
    if (newSelected.has(elementId)) {
      newSelected.delete(elementId);
    } else {
      newSelected.add(elementId);
    }
    setSelectedElements(newSelected);
  };

  const updateElementStatus = (elementId: string, status: 'mandatory' | 'optional' | 'removed') => {
    const updateElement = (elements: SchemaElement[]): SchemaElement[] => {
      return elements.map(element => {
        if (element.id === elementId) {
          return { ...element, status };
        }
        if (element.children) {
          return { ...element, children: updateElement(element.children) };
        }
        return element;
      });
    };
    setCustomSchema(updateElement(customSchema));
  };

  const removeSelectedElements = () => {
    selectedElements.forEach(elementId => {
      updateElementStatus(elementId, 'removed');
    });
    setSelectedElements(new Set());
    toast({
      title: "Elements Removed",
      description: `${selectedElements.size} element(s) marked as removed`,
    });
  };

  const bulkUpdateStatus = (status: 'mandatory' | 'optional' | 'removed') => {
    selectedElements.forEach(elementId => {
      updateElementStatus(elementId, status);
    });
    toast({
      title: "Status Updated",
      description: `${selectedElements.size} element(s) marked as ${status}`,
    });
  };

  const moveElement = (elementId: string, direction: 'up' | 'down') => {
    const moveInArray = (elements: SchemaElement[]): SchemaElement[] => {
      const index = elements.findIndex(e => e.id === elementId);
      if (index === -1) return elements;
      
      const newElements = [...elements];
      if (direction === 'up' && index > 0) {
        [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
      } else if (direction === 'down' && index < newElements.length - 1) {
        [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
      }
      return newElements;
    };

    const updateElement = (elements: SchemaElement[]): SchemaElement[] => {
      return elements.map(element => {
        if (element.children) {
          return { ...element, children: moveInArray(element.children) };
        }
        return element;
      });
    };

    setCustomSchema(prev => moveInArray(updateElement(prev)));
  };

  const generateCustomSchema = () => {
    if (!selectedTransaction || !selectedVersion) {
      toast({
        title: "Missing Selection",
        description: "Please select both transaction type and version",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' • ' + now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });

    const customSchemaData: CustomSchema = {
      transactionType: selectedTransaction,
      version: selectedVersion,
      elements: customSchema,
      generatedAt: now
    };

    // Add metadata for display
    const schemaWithMetadata = {
      ...customSchemaData,
      metadata: {
        generatedTimestamp: timestamp,
        totalElements: customSchema.length,
        mandatoryElements: customSchema.filter(e => e.status === 'mandatory').length,
        optionalElements: customSchema.filter(e => e.status === 'optional').length,
        removedElements: customSchema.filter(e => e.status === 'removed').length
      }
    };

    onSchemaGenerated(customSchemaData);
    
    toast({
      title: "Custom Schema Generated",
      description: `Schema for ${selectedTransaction} ${selectedVersion} created at ${timestamp}`,
    });
  };

  const downloadSchemaAsYAML = () => {
    const now = new Date();
    const timestamp = now.toISOString();
    
    const yamlContent = `# Custom EDI X12N Schema
# Generated: ${timestamp}
# Transaction: ${selectedTransaction} ${selectedVersion}

schema:
  transactionType: "${selectedTransaction}"
  version: "${selectedVersion}"
  generatedAt: "${timestamp}"
  
  metadata:
    totalElements: ${customSchema.length}
    mandatoryElements: ${customSchema.filter(e => e.status === 'mandatory').length}
    optionalElements: ${customSchema.filter(e => e.status === 'optional').length}
    removedElements: ${customSchema.filter(e => e.status === 'removed').length}
  
  elements:
${customSchema.map(element => `  - id: "${element.id}"
    name: "${element.name}"
    type: "${element.type}"
    status: "${element.status}"
    required: ${element.required}
    maxUse: ${element.maxUse}
    order: ${element.order}${element.children ? `
    children:
${element.children.map(child => `      - id: "${child.id}"
        name: "${child.name}"
        type: "${child.type}"
        status: "${child.status}"
        dataType: "${child.dataType || 'AN'}"
        minLength: ${child.minLength || 1}
        maxLength: ${child.maxLength || 80}`).join('\n')}` : ''}`).join('\n')}
`;

    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTransaction}_${selectedVersion}_schema.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Schema Downloaded",
      description: "Custom schema saved as YAML file",
    });
  };

  const renderSchemaElement = (element: SchemaElement, depth: number = 0, isCustomPane: boolean = false) => {
    const hasChildren = element.children && element.children.length > 0;
    const isExpanded = expandedNodes.has(element.id);
    const isSelected = selectedElements.has(element.id);
    const paddingLeft = depth * 16;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'mandatory': return 'bg-red-100 text-red-700 border-red-200';
        case 'optional': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'removed': return 'bg-gray-100 text-gray-500 border-gray-200 line-through';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'loop': return '🔁';
        case 'segment': return '📄';
        case 'element': return '🔸';
        default: return '📄';
      }
    };

    return (
      <div key={element.id} className={`${element.status === 'removed' ? 'opacity-50' : ''}`}>
        <div 
          className={`flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded ${
            isSelected ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
          }`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => isCustomPane && toggleElementSelection(element.id)}
        >
          {isCustomPane && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleElementSelection(element.id)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(element.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          
          <span className="text-sm">{getTypeIcon(element.type)}</span>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{element.name}</div>
            <div className="text-xs text-gray-500 truncate">{element.description}</div>
            {element.dataType && element.type === 'element' && (
              <div className="text-xs text-gray-400">
                {element.dataType} ({element.minLength}-{element.maxLength})
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getStatusColor(element.status)}`}>
              {element.status}
            </Badge>
            
            {isCustomPane && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateElementStatus(element.id, 'mandatory');
                  }}
                  title="Mark Mandatory"
                >
                  M
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateElementStatus(element.id, 'optional');
                  }}
                  title="Mark Optional"
                >
                  O
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateElementStatus(element.id, 'removed');
                  }}
                  title="Remove"
                >
                  R
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {element.children?.map(child => renderSchemaElement(child, depth + 1, isCustomPane))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced Schema Mapper with Sub-Section Control
          </CardTitle>
          <CardDescription className="text-center">
            Professional EDI X12N schema customization with granular loop, segment, and element control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Configuration Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">HIPAA Transaction Type</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Implementation Version</label>
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
            </div>

            {/* Dual Pane Schema Editor */}
            {defaultSchema.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Pane - Default Schema */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-lg">Default Schema Structure</CardTitle>
                    <CardDescription className="text-center">
                      Standard {selectedTransaction} {selectedVersion} elements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      <div className="space-y-1 p-2">
                        {defaultSchema.map(element => renderSchemaElement(element, 0, false))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Pane - Custom Schema Builder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-lg">Custom Schema Builder</CardTitle>
                    <CardDescription className="text-center">
                      Configure, customize, and generate your schema overlay
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Bulk Controls */}
                      {selectedElements.size > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border">
                          <span className="text-sm font-medium">
                            {selectedElements.size} selected
                          </span>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => bulkUpdateStatus('mandatory')}>
                              Mandatory
                            </Button>
                            <Button size="sm" onClick={() => bulkUpdateStatus('optional')}>
                              Optional
                            </Button>
                            <Button size="sm" variant="destructive" onClick={removeSelectedElements}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="border rounded-lg max-h-96 overflow-y-auto">
                        <div className="space-y-1 p-2">
                          {customSchema.map(element => renderSchemaElement(element, 0, true))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Generation Controls */}
            {customSchema.length > 0 && (
              <div className="flex justify-center gap-2">
                <Button 
                  onClick={generateCustomSchema}
                  disabled={!selectedTransaction || !selectedVersion}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileCode className="w-4 h-4 mr-2" />
                  Generate Custom Schema
                </Button>
                
                <Button 
                  onClick={downloadSchemaAsYAML}
                  variant="outline"
                  disabled={!selectedTransaction || !selectedVersion}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download YAML
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schema Statistics */}
      {customSchema.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-center text-green-800">Schema Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {customSchema.filter(e => e.status === 'mandatory').length}
                </div>
                <div className="text-sm text-green-600">Mandatory</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700">
                  {customSchema.filter(e => e.status === 'optional').length}
                </div>
                <div className="text-sm text-blue-600">Optional</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-700">
                  {customSchema.filter(e => e.status === 'removed').length}
                </div>
                <div className="text-sm text-gray-600">Removed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700">
                  {customSchema.length}
                </div>
                <div className="text-sm text-purple-600">Total Elements</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchemaMapper;
