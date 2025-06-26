
import { EDIFile, ParsedEDI, ValidationResult } from '@/pages/Index';

// Mock EDI parsing function
export const mockParseEDI = async (file: EDIFile): Promise<ParsedEDI> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Extract control numbers from the EDI content
  const content = file.content;
  const isaMatch = content.match(/ISA\*.*?\*(\d+)\*/);
  const gsMatch = content.match(/GS\*.*?\*(\d+)\*/);
  const stMatch = content.match(/ST\*278\*(\d+)\*/);
  
  const parsedData: ParsedEDI = {
    envelope: {
      interchangeHeader: 'ISA',
      functionalGroupHeader: 'GS',
      transactionSetHeader: 'ST'
    },
    loops: [
      { id: '2000A', name: 'UMO Level', segments: ['HL', 'NM1'] },
      { id: '2000B', name: 'Requester Level', segments: ['HL', 'NM1'] },
      { id: '2000C', name: 'Patient Level', segments: ['HL', 'NM1', 'DMG'] },
      { id: '2000E', name: 'Service Level', segments: ['HL', 'UM', 'DTP'] }
    ],
    segments: [
      { id: 'ISA', name: 'Interchange Control Header', elements: 16 },
      { id: 'GS', name: 'Functional Group Header', elements: 8 },
      { id: 'ST', name: 'Transaction Set Header', elements: 3 },
      { id: 'BHT', name: 'Beginning of Hierarchical Transaction', elements: 6 },
      { id: 'HL', name: 'Hierarchical Level', elements: 4 },
      { id: 'NM1', name: 'Entity Identifier', elements: 9 },
      { id: 'UM', name: 'Health Care Services Review Information', elements: 9 },
      { id: 'SE', name: 'Transaction Set Trailer', elements: 2 }
    ],
    transactionCount: 1,
    controlNumbers: {
      isa: isaMatch ? isaMatch[1] : '000000001',
      gs: gsMatch ? gsMatch[1] : '1',
      st: stMatch ? stMatch[1] : '0001'
    }
  };
  
  return parsedData;
};

// Mock EDI validation function
export const mockValidateEDI = async (parsedData: ParsedEDI): Promise<ValidationResult[]> => {
  // Simulate validation processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const validationResults: ValidationResult[] = [
    {
      level: 1,
      type: 'error',
      segment: 'NM1*IL',
      element: 'NM109',
      message: 'Missing required patient identifier in NM109 element',
      suggestion: 'Add patient member ID or SSN in NM109 element'
    },
    {
      level: 2,
      type: 'warning',
      segment: 'HL*3',
      message: 'Patient hierarchical level should reference parent level',
      suggestion: 'Verify HL02 contains correct parent reference'
    },
    {
      level: 3,
      type: 'error',
      segment: 'DTP*472',
      element: 'DTP03',
      message: 'Invalid date format in service period',
      suggestion: 'Use CCYYMMDD format or date range CCYYMMDD-CCYYMMDD'
    },
    {
      level: 4,
      type: 'warning',
      segment: 'UM*HS',
      element: 'UM02',
      message: 'Service type code may not be appropriate for request type',
      suggestion: 'Verify certification action code matches request intent'
    },
    {
      level: 5,
      type: 'error',
      segment: 'HI*ABK',
      element: 'HI01-02',
      message: 'Invalid diagnosis code format',
      suggestion: 'Ensure diagnosis follows ICD-10-CM format'
    },
    {
      level: 6,
      type: 'info',
      segment: 'NM1*1P',
      message: 'Provider NPI validation passed',
      suggestion: 'Consider adding provider taxonomy code for better processing'
    },
    {
      level: 7,
      type: 'warning',
      segment: 'BHT*0007',
      element: 'BHT06',
      message: 'Transaction handling code should match payer requirements',
      suggestion: 'Check companion guide for specific transaction handling codes'
    }
  ];
  
  return validationResults;
};

// Mock file storage for history
export const saveToHistory = (file: EDIFile, results: any) => {
  const historyItem = {
    id: Math.random().toString(36).substr(2, 9),
    filename: file.name,
    uploadedAt: new Date(),
    status: 'completed' as const,
    results: results
  };
  
  // In a real application, this would save to a database or local storage
  console.log('Saved to history:', historyItem);
  return historyItem;
};

// Mock export functions
export const exportToFormat = async (data: ParsedEDI, format: 'json' | 'xml' | 'fhir') => {
  // Simulate export processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'xml':
      return `<?xml version="1.0"?><EDIData>${JSON.stringify(data)}</EDIData>`;
    case 'fhir':
      return JSON.stringify({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [{ resource: data }]
      }, null, 2);
    default:
      return JSON.stringify(data);
  }
};
