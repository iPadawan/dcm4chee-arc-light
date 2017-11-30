import { Injectable } from '@angular/core';
import {StudiesService} from "../../../studies/studies.service";
import * as _ from 'lodash';

@Injectable()
export class RetrieveExportService {

  constructor(
      private studieService:StudiesService
  ) { }

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
                        tag:"checkbox",
                        filterKey:"incomplete",
                        text:"Only incomplete studies"
                    },
                    secondChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"ReferringPhysicianName",
                        placeholder:"Referring physician"
                    }
                },
                {
                    firstChild:{
                        tag:"modality",
                        type:"text",
                        filterKey:"ModalitiesInStudy",
                        placeholder:"Modality",
                    },
                    secondChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"InstitutionName",
                        placeholder:"Institution Name"
                    }
                },
                {
                    firstChild:{
                        tag:"p-calendar",
                        type:"string",
                        filterKey:"studyDate.from",
                        placeholder:"Start date from"
                    },
                    secondChild:{
                        tag:"p-calendar",
                        type:"string",
                        filterKey:"studyDate.to",
                        placeholder:"Start date to"
                    }
                }
            ]
        },
        {
            filter_block:[
                {
                    firstChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"SendingApplicationEntityTitleOfSeries",
                        placeholder:"Sending Application Entity Title of Series",
                        title:"Sending Application Entity Title of Series"
                    },
                    secondChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"InstitutionalDepartmentName",
                        placeholder:"Institutional Department Name"
                    }
                },{
                    firstChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"StationName",
                        placeholder:"Station",
                        title:"Station Name"
                    },
                    secondChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"SOPClassesInStudy",
                        placeholder:"SOP classes in study",
                        title:"SOP classes in study"
                    }
                },{
                    firstChild:{
                        tag:"checkbox",
                        filterKey:"retrievefailed",
                        text:"Only failed to be retrieved"
                    },
                    secondChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"SeriesDescription",
                        placeholder:"Series Description",
                        title:"Series Description"
                    }
                }
            ]
        },
        {
            filter_block:[
                {
                    firstChild:{
                        tag:"checkbox",
                        filterKey:"expired",
                        text:"Only expired studies"
                    },
                    secondChild:{
                        tag:"checkbox",
                        filterKey:"incomplete",
                        text:"Only incomplete studies"
                    }
                },{
                    firstChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"StudyID",
                        placeholder:"Study ID",
                        title:"Study ID"
                    },
                    secondChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"StudyInstanceUID",
                        placeholder:"Study Instance UID",
                        title:"Study Instance UID"
                    }
                },{
                    firstChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"StudyDescription",
                        placeholder:"Study Description",
                        title:"Study Description"
                    },
                    secondChild:{
                        tag:"input",
                        type:"text",
                        filterKey:"BodyPartExamined",
                        placeholder:"Body Part Examined",
                        title:"Body Part Examined"
                    }
                }
            ]
        },
        {
            filter_block:[
                {
                    firstChild:{
                        tag:"p-calendar",
                        type:"string",
                        filterKey:"StudyReceiveDateTime.from",
                        placeholder:"Study created from"
                    },
                    secondChild:{
                        tag:"p-calendar",
                        type:"string",
                        filterKey:"StudyReceiveDateTime.to",
                        placeholder:"Study created to"
                    }
                },{
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
                        id:"count",
                        text:'QUERIE COUNT',
                        description:"QUERIE ONLY THE COUNT"
                    },
                    secondChild:{
                        tag:"button",
                        id:"querie",
                        text:'QUERIE STUDIES',
                        description:"QUERIE STUDIES"
                    }
                }
            ]
        }
    ];
  }
    cloneWithoutAet(object){
      const aetsKey = [
          "LocalAET",
          "ExternalAET",
          "QueryAET",
          "DestinationAET"
      ];
      let newObject = _.clone(object);
      aetsKey.forEach(aet=>{
          delete newObject[aet];
      })
      return newObject;
    }
    rsUrl(params){
        let initernalAet = params.LocalAET || params.QueryAET;
        let externalAet = params.ExternalAET;
        return this.studieService.rsURL("external",null, initernalAet, externalAet);
    }
    getStudiesCount(params){
        return this.studieService.getCount(this.rsUrl(params), "studies",this.cloneWithoutAet(params));
    }
    getStudies(params){
        return this.studieService.queryStudies(this.rsUrl(params), this.cloneWithoutAet(params));
    }
}
