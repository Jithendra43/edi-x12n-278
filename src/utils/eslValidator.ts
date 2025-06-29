
import { ParsedEDI, ValidationResult } from '@/pages/Index';

export interface SNIPValidationLevel {
  level: number;
  name: string;
  description: string;
  passed: boolean;
  errors: ValidationResult[];
  warnings: ValidationResult[];
}

export const validateWithESLOverlay = async (parsedData: ParsedEDI, useCustomSchema: boolean = false): Promise<ValidationResult[]> => {
  // Simulate validation processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const results: ValidationResult[] = [];
  
  // SNIP Level 1: Syntax Validation
  results.push({
    level: 1,
    type: 'info',
    segment: 'ISA',
    message: 'Interchange syntax validation passed',
    suggestion: 'ISA segment properly formatted with 005010X217 version'
  });

  // SNIP Level 2: Structure Validation  
  if (useCustomSchema) {
    results.push({
      level: 2,
      type: 'info',
      segment: 'N3',
      message: 'Address line validation passed with custom ESL overlay',
      suggestion: 'N3 segment marked as mandatory in custom schema'
    });
    
    results.push({
      level: 2,
      type: 'info', 
      segment: 'N4',
      message: 'City/State/ZIP validation passed with custom ESL overlay',
      suggestion: 'N4 segment marked as mandatory in custom schema'
    });
  } else {
    results.push({
      level: 2,
      type: 'warning',
      segment: 'N3',
      message: 'Address information optional in default schema',
      suggestion: 'Consider using custom ESL overlay to make address mandatory'
    });
  }

  // SNIP Level 3: Semantic Validation
  results.push({
    level: 3,
    type: 'info',
    segment: 'DMG',
    message: 'Patient demographics properly linked to member ID',
    suggestion: 'Date of birth format complies with ASC X12N 005010X217'
  });

  // SNIP Level 4: Business Rules
  results.push({
    level: 4,
    type: 'warning',
    segment: 'UM*AR',
    element: 'UM02',
    message: 'Certification action code requires additional documentation',
    suggestion: 'Action code "I" (Initial) may require supporting clinical information'
  });

  // SNIP Level 5: Code Sets
  results.push({
    level: 5,
    type: 'info',
    segment: 'HI*ABK',
    element: 'HI01-02',
    message: 'ICD-10-CM diagnosis codes validated successfully',
    suggestion: 'Primary diagnosis M79606 is valid for musculoskeletal conditions'
  });

  // SNIP Level 6: Situational Requirements
  if (useCustomSchema) {
    results.push({
      level: 6,
      type: 'info',
      segment: 'DTP*435',
      message: 'Service date mandatory requirement met with custom ESL',
      suggestion: 'Date range format properly specified for authorization period'
    });
  } else {
    results.push({
      level: 6,
      type: 'warning',
      segment: 'DTP*435',
      message: 'Service date is optional in default schema',
      suggestion: 'Custom ESL overlay makes this mandatory for better processing'
    });
  }

  // SNIP Level 7: Implementation Specific
  if (useCustomSchema) {
    results.push({
      level: 7,
      type: 'info',
      segment: 'SV3',
      message: 'Optional service line removed per custom ESL overlay',
      suggestion: 'SV3 segment marked as unused in 278RQ_custom_edits_v2024.esl'
    });
    
    results.push({
      level: 7,
      type: 'info',
      segment: 'INS',
      message: 'Insurance segment unused per CMS esMD guide customization',
      suggestion: 'INS segment marked as unused in custom overlay for this implementation'
    });
  }

  return results;
};

export const generateSNIPLevelReport = (validationResults: ValidationResult[]): SNIPValidationLevel[] => {
  const levels: SNIPValidationLevel[] = [
    { level: 1, name: 'Syntax', description: 'EDI syntax and structure validation', passed: false, errors: [], warnings: [] },
    { level: 2, name: 'Structure', description: 'Segment and loop organization', passed: false, errors: [], warnings: [] },
    { level: 3, name: 'Semantics', description: 'Data element relationships', passed: false, errors: [], warnings: [] },
    { level: 4, name: 'Business Rules', description: 'Healthcare transaction rules', passed: false, errors: [], warnings: [] },
    { level: 5, name: 'Code Sets', description: 'Medical code validation', passed: false, errors: [], warnings: [] },
    { level: 6, name: 'Situational', description: 'Conditional requirements', passed: false, errors: [], warnings: [] },
    { level: 7, name: 'Implementation', description: 'Custom ESL overlay rules', passed: false, errors: [], warnings: [] }
  ];

  // Categorize validation results by SNIP level
  validationResults.forEach(result => {
    const levelIndex = result.level - 1;
    if (levelIndex >= 0 && levelIndex < levels.length) {
      if (result.type === 'error') {
        levels[levelIndex].errors.push(result);
      } else if (result.type === 'warning') {
        levels[levelIndex].warnings.push(result);
      }
    }
  });

  // Determine pass/fail status for each level
  levels.forEach(level => {
    level.passed = level.errors.length === 0;
  });

  return levels;
};

export const calculateComplianceScore = (validationResults: ValidationResult[]): number => {
  const errorCount = validationResults.filter(r => r.type === 'error').length;
  const warningCount = validationResults.filter(r => r.type === 'warning').length;
  
  // Base score starts at 100
  let score = 100;
  
  // Deduct 15 points per error, 5 points per warning
  score -= (errorCount * 15);
  score -= (warningCount * 5);
  
  // Minimum score is 0
  return Math.max(0, score);
};
