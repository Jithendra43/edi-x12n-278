
export const generateFileName = (originalName: string, format: string, isFixed: boolean = false) => {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  
  const fileNames = {
    edi: {
      original: `278_Request_Original_005010X217.edi`,
      transformed: `278_Request_CustomESL_005010X217.edi`,
      fixed: `278_Request_Fixed_005010X217_${timestamp}.edi`
    },
    json: {
      original: `278_Request_Original_005010X217.json`,
      transformed: `278_Request_CustomESL_005010X217.json`,
      fixed: `278_Request_Fixed_005010X217_${timestamp}.json`
    },
    xml: {
      original: `278_Request_Original_005010X217.xml`,
      transformed: `278_Request_CustomESL_005010X217.xml`,
      fixed: `278_Request_Fixed_005010X217_${timestamp}.xml`
    },
    fhir: {
      original: `278_Request_Original_005010X217_FHIR.json`,
      transformed: `278_Request_CustomESL_005010X217_FHIR.json`,
      fixed: `278_Request_Fixed_005010X217_FHIR_${timestamp}.json`
    },
    schema: `278RQ_custom_edits_v2024.esl`
  };

  if (format === 'esl') {
    return fileNames.schema;
  }

  const formatFiles = fileNames[format as keyof typeof fileNames];
  if (typeof formatFiles === 'object') {
    if (isFixed) return formatFiles.fixed;
    return formatFiles.transformed;
  }

  return `${baseName}_${format}.${format}`;
};

export const getImplementationGuideInfo = () => ({
  version: '005010X217',
  guide: 'CMS esMD X12N 278 Companion Guide AR2024.10.0',
  standard: 'ASC X12N 005010X217',
  timestamp: new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) + ' • ' + new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  })
});
