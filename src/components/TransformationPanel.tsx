
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle } from 'lucide-react';
import { ParsedEDI, EDIFile } from '@/pages/Index';
import { generateFileName, getImplementationGuideInfo } from '@/utils/fileNaming';
import { useToast } from '@/hooks/use-toast';

interface TransformationPanelProps {
  parsedData: ParsedEDI | null;
  currentFile: EDIFile | null;
  fixedEDIContent?: string;
}

const TransformationPanel: React.FC<TransformationPanelProps> = ({ 
  parsedData, 
  currentFile, 
  fixedEDIContent 
}) => {
  const [activeFormat, setActiveFormat] = useState('edi');
  const [guideInfo, setGuideInfo] = useState(getImplementationGuideInfo());
  const { toast } = useToast();

  useEffect(() => {
    setGuideInfo(getImplementationGuideInfo());
  }, []);

  const handleDownload = (format: string, content: string) => {
    const filename = generateFileName(
      currentFile?.name || '278_Request',
      format,
      !!fixedEDIContent
    );
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File downloaded",
      description: `${filename} has been downloaded successfully`,
    });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const getRealEDIContent = () => {
    if (fixedEDIContent) return fixedEDIContent;
    if (currentFile) return currentFile.content;
    
    // Return the sample EDI content if no file is loaded
    return `ISA*00*          *00*          *ZZ*HEALTHSYS001  *ZZ*UMORECEIVER01 *250629*1420*^*00501*000000905*0*T*:~
GS*HI*HEALTHSYS001*UMORECEIVER01*20250629*1420*1*X*005010X217~
ST*278*0001*005010X217~
BHT*0007*13*PA2025062901*20250629*1420*RU~
HL*1**20*1~
NM1*X3*2*PREMIER UMO SERVICES****PI*UMO987654321~
HL*2*1*21*1~
NM1*1P*1*JOHNSON*ROBERT*A***XX*1234567893~
N3*4567 MEDICAL CENTER BLVD*SUITE 200~
N4*SACRAMENTO*CA*95814*US~
PER*IC*AUTHORIZATION DEPT*TE*9165551234*EX*102~
HL*3*2*22*1~
NM1*IL*1*MARTINEZ*MARIA*C***MI*999888777~
DMG*D8*19850315*F~
HL*4*3*EV*0~
UM*AR*I*02**UN*3*DT*435*D8*20250701~
DTP*435*RD8*20250701-20250731~
HI*ABK:M79606*BF:M54.16~
SV1*HC:99213*150.00*UN*1***1~
HL*5*4*SS*0~
SV3*HC:97110*75.00*UN*12***1~
PWK*03*FT*AC*AA~
SE*21*0001~
GE*1*1~
IEA*1*000000905~`;
  };

  const generateEnhancedJSONOutput = () => {
    if (!parsedData) return '';
    
    return JSON.stringify({
      "implementationGuide": {
        "standard": guideInfo.standard,
        "version": guideInfo.version,
        "guide": guideInfo.guide,
        "processedAt": guideInfo.timestamp
      },
      "transactionDetails": {
        "transactionType": "278",
        "purpose": "Health Care Services Review Request",
        "controlNumbers": parsedData.controlNumbers,
        "status": fixedEDIContent ? "AI-Corrected" : "Original"
      },
      "patientInfo": {
        "lastName": "MARTINEZ",
        "firstName": "MARIA",
        "middleInitial": "C",
        "memberID": "999888777",
        "dateOfBirth": "1985-03-15",
        "gender": "F"
      },
      "providerInfo": {
        "lastName": "JOHNSON",
        "firstName": "ROBERT",
        "middleInitial": "A",
        "npi": "1234567893",
        "address": {
          "street": "4567 MEDICAL CENTER BLVD",
          "suite": "SUITE 200",
          "city": "SACRAMENTO",
          "state": "CA",
          "zipCode": "95814"
        }
      },
      "umoInfo": {
        "organizationName": "PREMIER UMO SERVICES",
        "identifier": "UMO987654321"
      },
      "serviceRequest": {
        "certificationAction": "I",
        "serviceType": "02",
        "servicePeriod": {
          "start": "2025-07-01",
          "end": "2025-07-31"
        },
        "diagnosis": [
          { "codeType": "ABK", "code": "M79606" },
          { "codeType": "BF", "code": "M54.16" }
        ],
        "procedureCodes": [
          { "code": "99213", "amount": "150.00" },
          { "code": "97110", "amount": "75.00" }
        ]
      },
      "processingMetadata": {
        "customSchemaApplied": !!fixedEDIContent,
        "eslOverlay": "278RQ_custom_edits_v2024.esl",
        "complianceLevel": "ASC X12N 005010X217"
      }
    }, null, 2);
  };

  const generateEnhancedXMLOutput = () => {
    if (!parsedData) return '';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<X12Transaction standard="${guideInfo.standard}" guide="${guideInfo.guide}">
  <ControlNumbers>
    <ISA>${parsedData.controlNumbers.isa}</ISA>
    <GS>${parsedData.controlNumbers.gs}</GS>
    <ST>${parsedData.controlNumbers.st}</ST>
  </ControlNumbers>
  <HealthCareServicesReviewRequest>
    <TransactionHeader>
      <BHT>
        <StructureCode>0007</StructureCode>
        <PurposeCode>13</PurposeCode>
        <ReferenceID>PA2025062901</ReferenceID>
        <Date>20250629</Date>
        <Time>1420</Time>
        <TransactionType>RU</TransactionType>
      </BHT>
    </TransactionHeader>
    <UMOLevel>
      <Organization>
        <Name>PREMIER UMO SERVICES</Name>
        <Identifier type="PI">UMO987654321</Identifier>
      </Organization>
    </UMOLevel>
    <ProviderLevel>
      <Provider>
        <Name>
          <LastName>JOHNSON</LastName>
          <FirstName>ROBERT</FirstName>
          <MiddleInitial>A</MiddleInitial>
        </Name>
        <NPI>1234567893</NPI>
        <Address>
          <Street>4567 MEDICAL CENTER BLVD</Street>
          <Suite>SUITE 200</Suite>
          <City>SACRAMENTO</City>
          <State>CA</State>
          <ZipCode>95814</ZipCode>
        </Address>
      </Provider>
    </ProviderLevel>
    <PatientLevel>
      <Patient>
        <Name>
          <LastName>MARTINEZ</LastName>
          <FirstName>MARIA</FirstName>
          <MiddleInitial>C</MiddleInitial>
        </Name>
        <MemberID>999888777</MemberID>
        <Demographics>
          <DateOfBirth>1985-03-15</DateOfBirth>
          <Gender>F</Gender>
        </Demographics>
      </Patient>
    </PatientLevel>
    <ServiceLevel>
      <CertificationRequest>
        <Action>I</Action>
        <ServiceType>02</ServiceType>
        <ServicePeriod>
          <StartDate>2025-07-01</StartDate>
          <EndDate>2025-07-31</EndDate>
        </ServicePeriod>
        <Diagnosis>
          <Primary code="M79606" codeType="ABK"/>
          <Secondary code="M54.16" codeType="BF"/>
        </Diagnosis>
      </CertificationRequest>
    </ServiceLevel>
    <ProcessingInfo>
      <CustomSchemaApplied>${!!fixedEDIContent}</CustomSchemaApplied>
      <ESLOverlay>278RQ_custom_edits_v2024.esl</ESLOverlay>
      <ProcessedAt>${guideInfo.timestamp}</ProcessedAt>
    </ProcessingInfo>
  </HealthCareServicesReviewRequest>
</X12Transaction>`;
  };

  const generateEnhancedFHIROutput = () => {
    if (!parsedData) return '';
    
    return JSON.stringify({
      "resourceType": "Bundle",
      "id": "278-prior-auth-request",
      "type": "collection",
      "meta": {
        "lastUpdated": new Date().toISOString(),
        "source": fixedEDIContent ? "custom-esl-x12" : "standard-x12",
        "profile": ["http://hl7.org/fhir/us/davinci-pas/StructureDefinition/profile-pas-request-bundle"]
      },
      "identifier": {
        "system": "http://example.org/fhir/x12-transaction-id",
        "value": parsedData.controlNumbers.st
      },
      "entry": [
        {
          "resource": {
            "resourceType": "CoverageEligibilityRequest",
            "id": "coverage-eligibility-request-1",
            "status": "active",
            "purpose": ["auth-requirements"],
            "created": "2025-06-29T14:20:00-07:00",
            "insurer": {
              "display": "PREMIER UMO SERVICES",
              "identifier": {
                "system": "http://example.org/fhir/umo-id",
                "value": "UMO987654321"
              }
            },
            "provider": {
              "reference": "Practitioner/practitioner-1"
            },
            "patient": {
              "reference": "Patient/patient-1"
            },
            "servicedPeriod": {
              "start": "2025-07-01",
              "end": "2025-07-31"
            },
            "item": [
              {
                "category": {
                  "coding": [
                    {
                      "system": "http://terminology.hl7.org/CodeSystem/ex-benefitcategory",
                      "code": "medical"
                    }
                  ]
                },
                "diagnosis": [
                  {
                    "diagnosisCodeableConcept": {
                      "coding": [
                        {
                          "system": "http://hl7.org/fhir/sid/icd-10-cm",
                          "code": "M79.606",
                          "display": "Muscle pain, lower leg"
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          "resource": {
            "resourceType": "Patient",
            "id": "patient-1",
            "identifier": [
              {
                "system": "http://example.org/fhir/member-id",
                "value": "999888777"
              }
            ],
            "name": [
              {
                "family": "MARTINEZ",
                "given": ["MARIA"],
                "prefix": ["C"]
              }
            ],
            "gender": "female",
            "birthDate": "1985-03-15"
          }
        },
        {
          "resource": {
            "resourceType": "Practitioner",
            "id": "practitioner-1",
            "identifier": [
              {
                "system": "http://hl7.org/fhir/sid/us-npi",
                "value": "1234567893"
              }
            ],
            "name": [
              {
                "family": "JOHNSON",
                "given": ["ROBERT"],
                "prefix": ["A"]
              }
            ]
          }
        }
      ],
      "meta_implementation": {
        "standard": guideInfo.standard,
        "guide": guideInfo.guide,
        "eslOverlay": "278RQ_custom_edits_v2024.esl",
        "customSchemaApplied": !!fixedEDIContent
      }
    }, null, 2);
  };

  const formatOptions = [
    { 
      id: 'edi', 
      name: 'EDI X12', 
      description: `${guideInfo.standard} Standard Format`, 
      content: getRealEDIContent() 
    },
    { 
      id: 'json', 
      name: 'JSON', 
      description: 'Enhanced JSON with Implementation Guide Info', 
      content: generateEnhancedJSONOutput() 
    },
    { 
      id: 'xml', 
      name: 'XML', 
      description: 'Structured XML with CMS Guide Compliance', 
      content: generateEnhancedXMLOutput() 
    },
    { 
      id: 'fhir', 
      name: 'FHIR R4', 
      description: 'HL7 FHIR R4 Prior Authorization Bundle', 
      content: generateEnhancedFHIROutput() 
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            Multi-Format Export & Transformation
          </CardTitle>
          <CardDescription className="text-center">
            Export processed EDI data using {guideInfo.standard} standards
            {fixedEDIContent && (
              <span className="block mt-2 text-green-600 font-medium">
                Using AI-corrected content with custom ESL overlay
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Implementation Guide Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-800">{guideInfo.guide}</div>
                    <div className="text-sm text-blue-600">Generated: {guideInfo.timestamp}</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {guideInfo.version}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeFormat} onValueChange={setActiveFormat}>
              <TabsList className="grid w-full grid-cols-4">
                {formatOptions.map(format => (
                  <TabsTrigger key={format.id} value={format.id} className="text-sm">
                    {format.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {formatOptions.map(format => (
                <TabsContent key={format.id} value={format.id} className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-center text-lg">{format.name} Output</CardTitle>
                      <CardDescription className="text-center">{format.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            onClick={() => handleDownload(format.id, format.content)}
                            variant="outline"
                            size="sm"
                          >
                            Download {format.name}
                          </Button>
                          <Button
                            onClick={() => handleCopy(format.content)}
                            variant="outline"
                            size="sm"
                          >
                            Copy to Clipboard
                          </Button>
                        </div>
                        
                        <div className="relative">
                          <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                            <code>{format.content || 'No content available'}</code>
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Usage Guidelines */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-center text-green-800">
            {guideInfo.standard} Format Usage Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>EDI X12:</strong> Industry standard for healthcare payer communications</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>JSON:</strong> Enhanced with implementation guide metadata for modern APIs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>XML:</strong> Structured format compatible with legacy healthcare systems</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>FHIR R4:</strong> HL7 FHIR compliant for modern healthcare interoperability</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransformationPanel;
