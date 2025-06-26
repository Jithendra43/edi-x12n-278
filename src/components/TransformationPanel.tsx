
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload } from 'lucide-react';
import { ParsedEDI, EDIFile } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface TransformationPanelProps {
  parsedData: ParsedEDI | null;
  currentFile: EDIFile | null;
}

const TransformationPanel: React.FC<TransformationPanelProps> = ({ parsedData, currentFile }) => {
  const [activeFormat, setActiveFormat] = useState('edi');
  const [isTransforming, setIsTransforming] = useState(false);
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

  const mockEDIOutput = currentFile ? `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *${new Date().toISOString().slice(0, 6)}*${new Date().toTimeString().slice(0, 4)}*^*00501*000000001*0*P*:~
GS*HI*SENDER*RECEIVER*${new Date().toISOString().slice(0, 8)}*${new Date().toTimeString().slice(0, 4)}*1*X*005010X217~
ST*278*0001*005010X217~
BHT*0007*13*REQ12345*${new Date().toISOString().slice(0, 8)}*${new Date().toTimeString().slice(0, 4)}*RP~
HL*1**20*1~
NM1*X3*2*UMO ORGANIZATION*****PI*1234567890~
HL*2*1*21*1~
NM1*1P*2*PROVIDER ORGANIZATION*****XX*1234567890~
HL*3*2*22*1~
TRN*1*REQ12345*1234567890~
NM1*IL*1*DOE*JOHN*A***MI*123456789~
DMG*D8*19800115*M~
HL*4*3*19*0~
NM1*SJ*1*FACILITY*TEST*****XX*9876543210~
UM*HS*I*******Y*A~
DTP*472*RD8*20240101-20240131~
HI*ABK:V7389~
SE*14*0001~
GE*1*1~
IEA*1*000000001~` : '';

  const mockJSONOutput = parsedData ? JSON.stringify({
    "transactionType": "278",
    "version": "005010X217",
    "controlNumbers": parsedData.controlNumbers,
    "requestDetails": {
      "patientInfo": {
        "lastName": "DOE",
        "firstName": "JOHN",
        "middleInitial": "A",
        "memberID": "123456789",
        "dateOfBirth": "1980-01-15",
        "gender": "M"
      },
      "providerInfo": {
        "organizationName": "PROVIDER ORGANIZATION",
        "npi": "1234567890"
      },
      "serviceInfo": {
        "serviceType": "Health Services",
        "certificationAction": "I",
        "serviceDate": {
          "start": "2024-01-01",
          "end": "2024-01-31"
        },
        "diagnosis": [
          {
            "codeType": "ABK",
            "code": "V7389"
          }
        ]
      }
    }
  }, null, 2) : '';

  const mockXMLOutput = parsedData ? `<?xml version="1.0" encoding="UTF-8"?>
<X12Transaction version="005010X217" type="278">
  <ControlNumbers>
    <ISA>${parsedData.controlNumbers.isa}</ISA>
    <GS>${parsedData.controlNumbers.gs}</GS>
    <ST>${parsedData.controlNumbers.st}</ST>
  </ControlNumbers>
  <PriorAuthorizationRequest>
    <Patient>
      <Name>
        <LastName>DOE</LastName>
        <FirstName>JOHN</FirstName>
        <MiddleInitial>A</MiddleInitial>
      </Name>
      <MemberID>123456789</MemberID>
      <DateOfBirth>1980-01-15</DateOfBirth>
      <Gender>M</Gender>
    </Patient>
    <Provider>
      <OrganizationName>PROVIDER ORGANIZATION</OrganizationName>
      <NPI>1234567890</NPI>
    </Provider>
    <ServiceRequest>
      <ServiceType>Health Services</ServiceType>
      <CertificationAction>I</CertificationAction>
      <ServicePeriod>
        <StartDate>2024-01-01</StartDate>
        <EndDate>2024-01-31</EndDate>
      </ServicePeriod>
      <Diagnosis>
        <Code type="ABK">V7389</Code>
      </Diagnosis>
    </ServiceRequest>
  </PriorAuthorizationRequest>
</X12Transaction>` : '';

  const mockFHIROutput = parsedData ? JSON.stringify({
    "resourceType": "Bundle",
    "id": "prior-auth-request",
    "type": "collection",
    "entry": [
      {
        "resource": {
          "resourceType": "CoverageEligibilityRequest",
          "id": "prior-auth-278",
          "status": "active",
          "purpose": ["auth-requirements"],
          "patient": {
            "reference": "Patient/patient-123"
          },
          "created": new Date().toISOString(),
          "insurer": {
            "display": "UMO ORGANIZATION"
          },
          "provider": {
            "reference": "Organization/provider-123"
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
                        "code": "V7389"
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
          "id": "patient-123",
          "name": [
            {
              "family": "DOE",
              "given": ["JOHN"],
              "prefix": ["A"]
            }
          ],
          "gender": "male",
          "birthDate": "1980-01-15",
          "identifier": [
            {
              "system": "http://example.org/member-id",
              "value": "123456789"
            }
          ]
        }
      }
    ]
  }, null, 2) : '';

  const formatOptions = [
    { id: 'edi', name: 'EDI X12', description: 'Standard EDI format', content: mockEDIOutput },
    { id: 'json', name: 'JSON', description: 'JavaScript Object Notation', content: mockJSONOutput },
    { id: 'xml', name: 'XML', description: 'Extensible Markup Language', content: mockXMLOutput },
    { id: 'fhir', name: 'FHIR', description: 'HL7 FHIR R4 format', content: mockFHIROutput }
  ];

  const currentFormat = formatOptions.find(f => f.id === activeFormat);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Multi-Format Export & Transformation
          </CardTitle>
          <CardDescription>
            Export your processed EDI data in multiple formats for downstream systems
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
                        <CardTitle className="text-lg">{format.name} Output</CardTitle>
                        <CardDescription>{format.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleDownload(
                                format.id,
                                format.content,
                                `${currentFile.name.replace(/\.[^/.]+$/, "")}.${format.id === 'fhir' ? 'json' : format.id}`
                              )}
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
          )}
        </CardContent>
      </Card>

      {/* Format Comparison */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Format Usage Guidelines</CardTitle>
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
            <span><strong>FHIR:</strong> Best for interoperability with modern healthcare systems</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransformationPanel;
