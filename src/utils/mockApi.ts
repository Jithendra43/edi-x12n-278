
import { EDIFile, ParsedEDI, ValidationResult } from '@/pages/Index';
import { validateWithESLOverlay } from './eslValidator';

export const mockParseEDI = async (file: EDIFile): Promise<ParsedEDI> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const content = file.content;
  
  // Extract real control numbers from the sample EDI
  const isaMatch = content.match(/ISA\*.*?\*.*?\*.*?\*.*?\*.*?\*.*?\*.*?\*.*?\*.*?\*.*?\*.*?\*.*?\*(\d+)\*/);
  const gsMatch = content.match(/GS\*.*?\*.*?\*.*?\*.*?\*.*?\*(\d+)\*/);
  const stMatch = content.match(/ST\*278\*(\d+)\*/);
  
  const parsedData: ParsedEDI = {
    envelope: {
      interchangeHeader: 'ISA - Interchange Control Header',
      functionalGroupHeader: 'GS - Functional Group Header', 
      transactionSetHeader: 'ST - Transaction Set Header'
    },
    loops: [
      { 
        id: '2000A', 
        name: 'UMO Level - Utilization Management Organization', 
        segments: ['HL*1', 'NM1*X3'] 
      },
      { 
        id: '2000B', 
        name: 'Provider Level - Information Source', 
        segments: ['HL*2', 'NM1*1P', 'N3', 'N4', 'PER*IC'] 
      },
      { 
        id: '2000C', 
        name: 'Patient Level - Subscriber', 
        segments: ['HL*3', 'NM1*IL', 'DMG'] 
      },
      { 
        id: '2000E', 
        name: 'Service Level - Event', 
        segments: ['HL*4', 'UM*AR', 'DTP*435', 'HI'] 
      },
      { 
        id: '2000F', 
        name: 'Service Line Level', 
        segments: ['HL*5', 'SV3', 'PWK'] 
      }
    ],
    segments: [
      { id: 'ISA', name: 'Interchange Control Header', elements: 16 },
      { id: 'GS', name: 'Functional Group Header', elements: 8 },
      { id: 'ST', name: 'Transaction Set Header (278)', elements: 3 },
      { id: 'BHT', name: 'Beginning of Hierarchical Transaction', elements: 6 },
      { id: 'HL', name: 'Hierarchical Level (Multiple)', elements: 4 },
      { id: 'NM1', name: 'Entity Identifier (Multiple)', elements: 9 },
      { id: 'N3', name: 'Address Information', elements: 2 },
      { id: 'N4', name: 'Geographic Location', elements: 4 },
      { id: 'PER', name: 'Administrative Contact', elements: 5 },
      { id: 'DMG', name: 'Demographic Information', elements: 3 },
      { id: 'UM', name: 'Health Care Services Review', elements: 9 },
      { id: 'DTP', name: 'Date/Time Period', elements: 3 },
      { id: 'HI', name: 'Health Care Diagnosis Code', elements: 2 },
      { id: 'SV1', name: 'Professional Service', elements: 7 },
      { id: 'SV3', name: 'Dental Service', elements: 7 },
      { id: 'PWK', name: 'Paperwork', elements: 4 },
      { id: 'SE', name: 'Transaction Set Trailer', elements: 2 },
      { id: 'GE', name: 'Functional Group Trailer', elements: 2 },
      { id: 'IEA', name: 'Interchange Control Trailer', elements: 2 }
    ],
    transactionCount: 1,
    controlNumbers: {
      isa: isaMatch ? isaMatch[1] : '000000905',
      gs: gsMatch ? gsMatch[1] : '1', 
      st: stMatch ? stMatch[1] : '0001'
    }
  };
  
  return parsedData;
};

export const mockValidateEDI = async (parsedData: ParsedEDI, useCustomSchema: boolean = false): Promise<ValidationResult[]> => {
  return await validateWithESLOverlay(parsedData, useCustomSchema);
};
