import { Injectable } from '@angular/core';

@Injectable()
export class RetrieveExportService {

  constructor() { }

  getRetrieveFilterSchema(aet,submitText){
    return [
        {
            filter_block:[
                {
                    firstChild:{
                        tag:"label",
                        text:"Calling AETitle"
                    },
                    secondChild:{
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"LocalAET",
                        description:"Archive AE Title to filter by"
                    }
                },
                {
                    firstChild:{
                        tag:"label",
                        text:"External AETitle"
                    },
                    secondChild:{
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"ExternalAET",
                        description:"Archive AE Title to filter by"
                    }
                }
            ]
        },
        {
            filter_block:[
                {
                    firstChild:{
                        tag:"label",
                        text:"Query AETitle"
                    },
                    secondChild:{
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"QueryAET",
                        description:"Archive AE Title to filter by"
                    }
                },
                {
                    firstChild:{
                        tag:"label",
                        text:"Destination AETitle"
                    },
                    secondChild:{
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"DestinationAET",
                        description:"Archive AE Title to filter by"
                    }
                }
            ]
        },
        {
            filter_block:[
                {
                    firstChild:{
                        tag:"dummy"
                    },
                    secondChild:{
                        tag:"dummy"
                    }
                },
                {
                    firstChild:{
                        tag:"button",
                        text:submitText,
                        description:"Maximal number of tasks in returned list"
                    },
                    secondChild:{
                        tag:"dummy"
                    }
                }
            ]
        }
    ];
  }
  getStudieFilterSchema(aet,submitText){
    return [
        {
            filter_block:[
                {
                    firstChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"PatientName",
                        placeholder:"Patient name"
                    },
                    secondChild:{
                        tag:"checkbox",
                        filterKey:"fuzzymatching",
                        text:"Fuzzy Matching"
                    }
                },
                {
                    firstChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"PatientID",
                        placeholder:"Patient ID"
                    },
                    secondChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"IssuerOfPatientID",
                        placeholder:"Issuer of patient"
                    }
                },
                {
                    firstChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"AccessionNumber",
                        placeholder:"Accession number"
                    },
                    secondChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"IssuerOfAccessionNumberSequence.LocalNamespaceEntityID",
                        placeholder:"Issuer of accession number"
                    }
                }
            ]
        },
        {
            filter_block:[
                {
                    firstChild:{
                        tag:"label",
                        text:"Query AETitle"
                    },
                    secondChild:{
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"QueryAET",
                        description:"Archive AE Title to filter by"
                    }
                },
                {
                    firstChild:{
                        tag:"label",
                        text:"Destination AETitle"
                    },
                    secondChild:{
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"DestinationAET",
                        description:"Archive AE Title to filter by"
                    }
                }
            ]
        },
        {
            filter_block:[
                {
                    firstChild:{
                        tag:"dummy"
                    },
                    secondChild:{
                        tag:"dummy"
                    }
                },
                {
                    firstChild:{
                        tag:"button",
                        text:submitText,
                        description:"Maximal number of tasks in returned list"
                    },
                    secondChild:{
                        tag:"dummy"
                    }
                }
            ]
        }
    ];
  }
}
