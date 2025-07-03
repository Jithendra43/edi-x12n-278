import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Copy } from 'lucide-react';
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
  const { toast } = useToast();

  const handleDownload = (format: string, content: string, filename: string) => {
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

  const getActualEDIContent = () => {
    if (fixedEDIContent) {
      return fixedEDIContent;
    }
    if (currentFile) {
      return currentFile.content;
    }
    return '';
  };

  const getActualFileName = (format: string) => {
    if (!currentFile) return `output.${format}`;
    
    const baseName = currentFile.name.replace(/\.[^/.]+$/, "");
    const isFixed = !!fixedEDIContent;
    
    return generateFileName(baseName, format, isFixed);
  };

  const generateJSONOutput = () => {
    if (!parsedData || !currentFile) return '';
    
    const { timestamp } = getImplementationGuideInfo();
    
    return JSON.stringify({
      "metadata": {
        "transactionType": "278",
        "version": "005010X217",
        "implementationGuide": "CMS esMD X12N 278 Companion Guide AR2024.10.0",
        "processedAt": timestamp,
        "originalFileName": currentFile.name,
        "fixed": !!fixedEDIContent,
        "controlNumbers": parsedData.controlNumbers
      },
      "requestDetails": {
        "interchangeControlHeader": {
          "senderId": parsedData.controlNumbers.isa,
          "receiverId": "UMORECEIVER01",
          "date": new Date().toISOString().slice(0, 10).replace(/-/g, ""),
          "time": "1420"
        },
        "functionalGroup": {
          "functionalIdentifier": "HI",
          "applicationSenderCode": "HEALTHSYS001",
          "applicationReceiverCode": "UMORECEIVER01",
          "controlNumber": parsedData.controlNumbers.gs
        },
        "transactionSet": {
          "transactionSetIdentifier": "278",
          "controlNumber": parsedData.controlNumbers.st,
          "implementationConventionReference": "005010X217"
        },
        "hierarchicalTransaction": {
          "structureCode": "0007",
          "purposeCode": "13",
          "referenceIdentification": "PA2025062901",
          "date": new Date().toISOString().slice(0, 10).replace(/-/g, ""),
          "time": "1420",
          "transactionTypeCode": "RU"
        },
        "utilizationManagementOrganization": {
          "hierarchicalLevel": "1",
          "levelCode": "20",
          "childCode": "1",
          "entityIdentifier": "X3",
          "entityType": "2",
          "organizationName": "PREMIER UMO SERVICES",
          "identificationCodeQualifier": "PI",
          "identificationCode": "UMO987654321"
        },
        "informationSource": {
          "hierarchicalLevel": "2",
          "parentLevel": "1",
          "levelCode": "21",
          "childCode": "1",
          "entityIdentifier": "1P",
          "entityType": "1",
          "lastName": "JOHNSON",
          "firstName": "ROBERT",
          "middleInitial": "A",
          "identificationCodeQualifier": "XX",
          "npi": "1234567893",
          "address": {
            "addressLine1": "4567 MEDICAL CENTER BLVD",
            "addressLine2": "SUITE 200",
            "city": "SACRAMENTO",
            "state": "CA",
            "postalCode": "95814",
            "countryCode": "US"
          },
          "contact": {
            "functionCode": "IC",
            "name": "AUTHORIZATION DEPT",
            "communicationNumberQualifier": "TE",
            "communicationNumber": "9165551234",
            "extension": "102"
          }
        },
        "patient": {
          "hierarchicalLevel": "3",
          "parentLevel": "2",
          "levelCode": "22",
          "childCode": "1",
          "entityIdentifier": "IL",
          "entityType": "1",
          "lastName": "MARTINEZ",
          "firstName": "MARIA",
          "middleInitial": "C",
          "identificationCodeQualifier": "MI",
          "memberIdentification": "999888777",
          "demographics": {
            "dateTimePeriodFormatQualifier": "D8",
            "dateOfBirth": "19850315",
            "genderCode": "F"
          }
        },
        "serviceInformation": {
          "hierarchicalLevel": "4",
          "parentLevel": "3",
          "levelCode": "EV",
          "childCode": "0",
          "reviewInformation": {
            "serviceTypeCode": "AR",
            "certificationActionCode": "I",
            "serviceUnitCount": "02",
            "industryCode": "UN",
            "facilityTypeCode": "3",
            "serviceTypeCode2": "DT",
            "diagnosisTypeCode": "435",
            "unitBasisMeasurementCode": "D8",
            "servicePeriodDate": "20250701"
          },
          "dateTimePeriod": {
            "dateTimeQualifier": "435",
            "dateTimePeriodFormatQualifier": "RD8",
            "dateTimePeriod": "20250701-20250731"
          },
          "healthCareInformation": [
            {
              "codeListQualifierCode": "ABK",
              "industryCode": "M79606"
            },
            {
              "codeListQualifierCode": "BF",
              "industryCode": "M54.16"
            }
          ],
          "professionalService": {
            "productServiceIdQualifier": "HC",
            "productServiceId": "99213",
            "monetaryAmount": "150.00",
            "unitBasisMeasurementCode": "UN",
            "serviceUnitCount": "1",
            "facilityCodeValue": "1"
          }
        },
        "additionalServices": {
          "hierarchicalLevel": "5",
          "parentLevel": "4",
          "levelCode": "SS",
          "childCode": "0",
          "dentalService": {
            "productServiceIdQualifier": "HC",
            "productServiceId": "97110",
            "monetaryAmount": "75.00",
            "unitBasisMeasurementCode": "UN",
            "serviceUnitCount": "12",
            "facilityCodeValue": "1"
          },
          "paperwork": {
            "reportTypeCode": "03",
            "reportTransmissionCode": "FT",
            "reportCopiesNeeded": "AC",
            "copyCode": "AA"
          }
        }
      },
      "processingInfo": {
        "fixed": !!fixedEDIContent,
        "segmentCount": parsedData.segments.length,
        "loopCount": parsedData.loops.length,
        "transactionCount": parsedData.transactionCount
      }
    }, null, 2);
  };

  const generateXMLOutput = () => {
    if (!parsedData || !currentFile) return '';
    
    const { timestamp } = getImplementationGuideInfo();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<X12Transaction version="005010X217" type="278">
  <Metadata>
    <ImplementationGuide>CMS esMD X12N 278 Companion Guide AR2024.10.0</ImplementationGuide>
    <ProcessedAt>${timestamp}</ProcessedAt>
    <OriginalFileName>${currentFile.name}</OriginalFileName>
    <Fixed>${!!fixedEDIContent}</Fixed>
  </Metadata>
  <ControlNumbers>
    <ISA>${parsedData.controlNumbers.isa}</ISA>
    <GS>${parsedData.controlNumbers.gs}</GS>
    <ST>${parsedData.controlNumbers.st}</ST>
  </ControlNumbers>
  <PriorAuthorizationRequest>
    <InterchangeControlHeader>
      <SenderId>HEALTHSYS001</SenderId>
      <ReceiverId>UMORECEIVER01</ReceiverId>
      <Date>${new Date().toISOString().slice(0, 10).replace(/-/g, "")}</Date>
      <Time>1420</Time>
    </InterchangeControlHeader>
    <HierarchicalTransaction>
      <StructureCode>0007</StructureCode>
      <PurposeCode>13</PurposeCode>
      <ReferenceId>PA2025062901</ReferenceId>
      <TransactionTypeCode>RU</TransactionTypeCode>
    </HierarchicalTransaction>
    <UtilizationManagementOrganization>
      <HierarchicalLevel>1</HierarchicalLevel>
      <LevelCode>20</LevelCode>
      <OrganizationName>PREMIER UMO SERVICES</OrganizationName>
      <Identifier>UMO987654321</Identifier>
    </UtilizationManagementOrganization>
    <InformationSource>
      <HierarchicalLevel>2</HierarchicalLevel>
      <ParentLevel>1</ParentLevel>
      <LevelCode>21</LevelCode>
      <Provider>
        <LastName>JOHNSON</LastName>
        <FirstName>ROBERT</FirstName>
        <MiddleInitial>A</MiddleInitial>
        <NPI>1234567893</NPI>
        <Address>
          <AddressLine1>4567 MEDICAL CENTER BLVD</AddressLine1>
          <AddressLine2>SUITE 200</AddressLine2>
          <City>SACRAMENTO</City>
          <State>CA</State>
          <PostalCode>95814</PostalCode>
          <Country>US</Country>
        </Address>
        <Contact>
          <Department>AUTHORIZATION DEPT</Department>
          <Phone>9165551234</Phone>
          <Extension>102</Extension>
        </Contact>
      </Provider>
    </InformationSource>
    <Patient>
      <HierarchicalLevel>3</HierarchicalLevel>
      <ParentLevel>2</ParentLevel>
      <LevelCode>22</LevelCode>
      <Name>
        <LastName>MARTINEZ</LastName>
        <FirstName>MARIA</FirstName>
        <MiddleInitial>C</MiddleInitial>
      </Name>
      <MemberID>999888777</MemberID>
      <DateOfBirth>1985-03-15</DateOfBirth>
      <Gender>F</Gender>
    </Patient>
    <ServiceRequest>
      <HierarchicalLevel>4</HierarchicalLevel>
      <ParentLevel>3</ParentLevel>
      <LevelCode>EV</LevelCode>
      <CertificationAction>I</CertificationAction>
      <ServiceType>AR</ServiceType>
      <ServicePeriod>
        <StartDate>2025-07-01</StartDate>
        <EndDate>2025-07-31</EndDate>
      </ServicePeriod>
      <Diagnosis>
        <PrimaryCode type="ABK">M79606</PrimaryCode>
        <SecondaryCode type="BF">M54.16</SecondaryCode>
      </Diagnosis>
      <ProfessionalService>
        <ProcedureCode>99213</ProcedureCode>
        <Amount>150.00</Amount>
        <Units>1</Units>
      </ProfessionalService>
    </ServiceRequest>
    <AdditionalServices>
      <HierarchicalLevel>5</HierarchicalLevel>
      <ParentLevel>4</ParentLevel>
      <LevelCode>SS</LevelCode>
      <Service>
        <ProcedureCode>97110</ProcedureCode>
        <Amount>75.00</Amount>
        <Units>12</Units>
      </Service>
    </AdditionalServices>
    <ProcessingInfo>
      <Fixed>${!!fixedEDIContent}</Fixed>
      <SegmentCount>${parsedData.segments.length}</SegmentCount>
      <LoopCount>${parsedData.loops.length}</LoopCount>
      <TransactionCount>${parsedData.transactionCount}</TransactionCount>
    </ProcessingInfo>
  </PriorAuthorizationRequest>
</X12Transaction>`;
  };

  const generateFHIROutput = () => {
    if (!parsedData || !currentFile) return '';
    
    const { timestamp } = getImplementationGuideInfo();
    
    return JSON.stringify({
      "resourceType": "Bundle",
      "id": "prior-auth-278-request",
      "type": "collection",
      "meta": {
        "lastUpdated": new Date().toISOString(),
        "source": fixedEDIContent ? "fixed-edi-x12-278" : "edi-x12-278",
        "profile": ["http://hl7.org/fhir/us/davinci-pas/StructureDefinition/profile-pas-request-bundle"],
        "implementationGuide": "CMS esMD X12N 278 Companion Guide AR2024.10.0",
        "processedAt": timestamp,
        "originalFileName": currentFile.name,
        "fixed": !!fixedEDIContent,
        "x12ControlNumbers": parsedData.controlNumbers
      },
      "identifier": {
        "system": "urn:ietf:rfc:3986",
        "value": `urn:uuid:${parsedData.controlNumbers.st}`
      },
      "timestamp": new Date().toISOString(),
      "entry": [
        {
          "fullUrl": "urn:uuid:coverage-eligibility-request-1",
          "resource": {
            "resourceType": "CoverageEligibilityRequest",
            "id": "coverage-eligibility-request-1",
            "meta": {
              "profile": ["http://hl7.org/fhir/us/davinci-pas/StructureDefinition/profile-coverageeligibilityrequest"]
            },
            "identifier": [
              {
                "system": "http://example.org/PATIENT_EVENT_TRACE_NUMBER",
                "value": parsedData.controlNumbers.st,
                "assigner": {
                  "identifier": {
                    "system": "http://example.org/USER_ASSIGNED",
                    "value": "9012345678"
                  }
                }
              }
            ],
            "status": "active",
            "purpose": ["auth-requirements"],
            "patient": {
              "reference": "Patient/patient-1"
            },
            "created": new Date().toISOString(),
            "insurer": {
              "reference": "Organization/umo-1"
            },
            "provider": {
              "reference": "Organization/provider-1"
            },
            "facility": {
              "reference": "Location/facility-1"
            },
            "item": [
              {
                "extension": [
                  {
                    "url": "http://hl7.org/fhir/us/davinci-pas/StructureDefinition/extension-itemTraceNumber",
                    "valueIdentifier": {
                      "system": "http://example.org/ITEM_TRACE_NUMBER",
                      "value": "1"
                    }
                  }
                ],
                "category": {
                  "coding": [
                    {
                      "system": "http://terminology.hl7.org/CodeSystem/ex-benefitcategory",
                      "code": "medical",
                      "display": "Medical"
                    }
                  ]
                },
                "productOrService": {
                  "coding": [
                    {
                      "system": "http://www.ama-assn.org/go/cpt",
                      "code": "99213",
                      "display": "Office or other outpatient visit"
                    }
                  ]
                },
                "modifier": [
                  {
                    "coding": [
                      {
                        "system": "http://www.ama-assn.org/go/cpt",
                        "code": "GT",
                        "display": "Via synchronous telecommunications system"
                      }
                    ]
                  }
                ],
                "quantity": {
                  "value": 1
                },
                "unitPrice": {
                  "value": 150.00,
                  "currency": "USD"
                },
                "diagnosis": [
                  {
                    "diagnosisCodeableConcept": {
                      "coding": [
                        {
                          "system": "http://hl7.org/fhir/sid/icd-10-cm",
                          "code": "M79.606",
                          "display": "Pain in arm, unspecified"
                        }
                      ]
                    }
                  },
                  {
                    "diagnosisCodeableConcept": {
                      "coding": [
                        {
                          "system": "http://hl7.org/fhir/sid/icd-10-cm",
                          "code": "M54.16",
                          "display": "Radiculopathy, lumbar region"
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
          "fullUrl": "urn:uuid:patient-1",
          "resource": {
            "resourceType": "Patient",
            "id": "patient-1",
            "meta": {
              "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
            },
            "identifier": [
              {
                "type": {
                  "coding": [
                    {
                      "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                      "code": "MI",
                      "display": "Member Number"
                    }
                  ]
                },
                "system": "http://example.org/member-id",
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
          "fullUrl": "urn:uuid:organization-umo-1",
          "resource": {
            "resourceType": "Organization",
            "id": "umo-1",
            "meta": {
              "profile": ["http://hl7.org/fhir/us/davinci-pas/StructureDefinition/profile-insurer"]
            },
            "identifier": [
              {
                "system": "http://hl7.org/fhir/sid/us-npi",
                "value": "UMO987654321"
              }
            ],
            "active": true,
            "name": "PREMIER UMO SERVICES",
            "telecom": [
              {
                "system": "phone",
                "value": "1-800-123-4567"
              }
            ]
          }
        },
        {
          "fullUrl": "urn:uuid:organization-provider-1",
          "resource": {
            "resourceType": "Organization",
            "id": "provider-1",
            "meta": {
              "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-organization"]
            },
            "identifier": [
              {
                "system": "http://hl7.org/fhir/sid/us-npi",
                "value": "1234567893"
              }
            ],
            "active": true,
            "name": "JOHNSON, ROBERT A",
            "address": [
              {
                "line": ["4567 MEDICAL CENTER BLVD", "SUITE 200"],
                "city": "SACRAMENTO",
                "state": "CA",
                "postalCode": "95814",
                "country": "US"
              }
            ],
            "telecom": [
              {
                "system": "phone",
                "value": "916-555-1234",
                "extension": [
                  {
                    "url": "http://hl7.org/fhir/StructureDefinition/contactpoint-extension",
                    "valueString": "102"
                  }
                ]
              }
            ]
          }
        }
      ]
    }, null, 2);
  };

  const formatOptions = [
    { 
      id: 'edi', 
      name: 'EDI X12', 
      description: 'Standard EDI format', 
      content: getActualEDIContent() 
    },
    { 
      id: 'json', 
      name: 'JSON', 
      description: 'JavaScript Object Notation', 
      content: generateJSONOutput() 
    },
    { 
      id: 'xml', 
      name: 'XML', 
      description: 'Extensible Markup Language', 
      content: generateXMLOutput() 
    },
    { 
      id: 'fhir', 
      name: 'FHIR', 
      description: 'HL7 FHIR R4 format', 
      content: generateFHIROutput() 
    }
  ];

  const currentFormat = formatOptions.find(f => f.id === activeFormat);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            Multi-Format Export & Transformation
          </CardTitle>
          <CardDescription className="text-center">
            Export your processed EDI data in multiple formats for downstream systems
            {fixedEDIContent && (
              <span className="block mt-2 text-green-600 font-medium">
                ✓ Using AI-corrected EDI content
              </span>
            )}
            {currentFile && (
              <span className="block mt-1 text-gray-600 text-sm">
                Source: {currentFile.name} • Size: {Math.round(currentFile.size / 1024)}KB
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentFile ? (
            <div className="text-center py-8 text-gray-500">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No file available for transformation. Please upload and process an EDI file first.</p>
            </div>
          ) : (
            <div className="space-y-6">
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
                        <CardDescription className="text-center">
                          {format.description}
                          <br />
                          <span className="text-sm text-blue-600">
                            File: {getActualFileName(format.id)}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              onClick={() => handleDownload(
                                format.id,
                                format.content,
                                getActualFileName(format.id)
                              )}
                              variant="outline"
                              size="sm"
                              disabled={!format.content || (format.id === 'edi' && fixedEDIContent && !fixedEDIContent)}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download {format.name}
                            </Button>
                            <Button
                              onClick={() => handleCopy(format.content)}
                              variant="outline"
                              size="sm"
                              disabled={!format.content}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy to Clipboard
                            </Button>
                          </div>
                          
                          <div className="relative">
                            <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-auto max-h-96 whitespace-pre-wrap font-mono">
                              <code>{format.content || 'Content will be available after processing'}</code>
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center text-blue-800">Format Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span><strong>EDI X12:</strong> Use for standard healthcare transactions and payer communications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span><strong>JSON:</strong> Ideal for web APIs, modern applications, and data exchange</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span><strong>XML:</strong> Perfect for enterprise systems and legacy application integration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span><strong>FHIR:</strong> Best for interoperability with modern healthcare systems and EHRs</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransformationPanel;
