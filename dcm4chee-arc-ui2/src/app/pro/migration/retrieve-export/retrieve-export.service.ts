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
            [
                [
                    {
                        tag:"label",
                        text:"Calling AETitle"
                    },
                    {
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"LocalAET",
                        description:"Archive AE Title to filter by"
                    }
                ],
                [
                    {
                        tag:"label",
                        text:"External AETitle"
                    },
                    {
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"ExternalAET",
                        description:"Archive AE Title to filter by"
                    }
                ]
            ],[
                [
                    {
                        tag:"label",
                        text:"Query AETitle"
                    },
                    {
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"QueryAET",
                        description:"Archive AE Title to filter by"
                    }
                ],
                [
                    {
                        tag:"label",
                        text:"Destination AETitle"
                    },
                    {
                        tag:"select",
                        options:aet,
                        showStar:true,
                        filterKey:"DestinationAET",
                        description:"Archive AE Title to filter by"
                    }
                ]
            ],[
                [
                    {
                        tag:"dummy"
                    },
                    {
                        tag:"dummy"
                    }
                ],
                [
                    {
                        tag:"button",
                        text:submitText,
                        description:"Maximal number of tasks in returned list"
                    },
                    {
                        tag:"dummy"
                    }
                ]
            ]
    ];
  }
  getFlatStudieFilterSchema(aet,submitText){
      return [
          {
              tag:"input",
              type:"text",
              filterKey:"PatientName",
              placeholder:"Patient name"
          },
          {
              tag:"checkbox",
              filterKey:"fuzzymatching",
              text:"Fuzzy Matching"
          },{
              tag:"input",
              type:"text",
              filterKey:"PatientID",
              placeholder:"Patient ID"
          },
          {
              tag:"input",
              type:"text",
              filterKey:"IssuerOfPatientID",
              placeholder:"Issuer of patient"
          }, {
              tag:"input",
              type:"text",
              filterKey:"AccessionNumber",
              placeholder:"Accession number"
          },
          {
              tag:"input",
              type:"text",
              filterKey:"IssuerOfAccessionNumberSequence.LocalNamespaceEntityID",
              placeholder:"Issuer of accession number"
          },
          {
              tag:"input",
              type:"text",
              filterKey:"ReferringPhysicianName",
              placeholder:"Referring physician"
          }
          ,{
              tag:"modality",
              type:"text",
              filterKey:"ModalitiesInStudy",
              placeholder:"Modality",
          }
          ,{
              tag:"p-calendar",
              type:"string",
              filterKey:"studyDate.from",
              placeholder:"Start date from"
          },
          {
              tag:"p-calendar",
              type:"string",
              filterKey:"studyDate.to",
              placeholder:"Start date to"
          }
          ,{
              tag:"input",
              type:"text",
              filterKey:"SendingApplicationEntityTitleOfSeries",
              placeholder:"Sending Application Entity Title of Series",
              title:"Sending Application Entity Title of Series",
              mode:"export"
          },
          {
              tag:"input",
              type:"text",
              filterKey:"InstitutionName",
              placeholder:"Institution Name"
          },
          {
              tag:"input",
              type:"text",
              filterKey:"InstitutionalDepartmentName",
              placeholder:"Institutional Department Name"
          }
          ,{
              tag:"input",
              type:"text",
              filterKey:"StationName",
              placeholder:"Station",
              title:"Station Name"
          },
          {
              tag:"input",
              type:"text",
              filterKey:"SOPClassesInStudy",
              placeholder:"SOP classes in study",
              title:"SOP classes in study"
          }
          ,{
              tag:"input",
              type:"text",
              filterKey:"StudyID",
              placeholder:"Study ID",
              title:"Study ID"
          },
          {
              tag:"input",
              type:"text",
              filterKey:"SeriesDescription",
              placeholder:"Series Description",
              title:"Series Description"
          },
          {
              tag:"input",
              type:"text",
              filterKey:"StudyInstanceUID",
              placeholder:"Study Instance UID",
              title:"Study Instance UID"
          }
          ,{
              tag:"checkbox",
              filterKey:"expired",
              text:"Only expired studies",
              mode:"export"
          },
          {
              tag:"checkbox",
              filterKey:"incomplete",
              text:"Only incomplete studies",
              mode:"export"
          }
          ,{
              tag:"checkbox",
              filterKey:"retrievefailed",
              text:"Only failed to be retrieved",
              mode:"export"
          }
          ,{
              tag:"input",
              type:"text",
              filterKey:"StudyDescription",
              placeholder:"Study Description",
              title:"Study Description"
          }
          ,{
              tag:"p-calendar",
              type:"string",
              filterKey:"StudyReceiveDateTime.from",
              placeholder:"Study created from"
          },
          {
              tag:"p-calendar",
              type:"string",
              filterKey:"StudyReceiveDateTime.to",
              placeholder:"Study created to"
          },
          {
              tag:"input",
              type:"text",
              filterKey:"BodyPartExamined",
              placeholder:"Body Part Examined",
              title:"Body Part Examined"
          }
          ,{
              tag:"dummy",
          }
          ,{
              tag:"button",
              id:"count",
              text:'QUERIE COUNT',
              description:"QUERIE ONLY THE COUNT"
          },
          {
              tag:"button",
              id:"querie",
              text:'QUERIE STUDIES',
              description:"QUERIE STUDIES"
          }

      ]
  }
/*  getStudieFilterSchema(aet,submitText){
    return [
            [
                [
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"PatientName",
                        placeholder:"Patient name"
                    },
                    {
                        tag:"checkbox",
                        filterKey:"fuzzymatching",
                        text:"Fuzzy Matching"
                    }
                ],
                [
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"PatientID",
                        placeholder:"Patient ID"
                    },
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"IssuerOfPatientID",
                        placeholder:"Issuer of patient"
                    }
                ],
                [
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"AccessionNumber",
                        placeholder:"Accession number"
                    },
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"IssuerOfAccessionNumberSequence.LocalNamespaceEntityID",
                        placeholder:"Issuer of accession number"
                    }
                ]
            ]
            ,[
                [
                    {
                        tag:"checkbox",
                        filterKey:"incomplete",
                        text:"Only incomplete studies"
                    },
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"ReferringPhysicianName",
                        placeholder:"Referring physician"
                    }
                ],
                [
                    {
                        tag:"modality",
                        type:"text",
                        filterKey:"ModalitiesInStudy",
                        placeholder:"Modality",
                    },
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"InstitutionName",
                        placeholder:"Institution Name"
                    }
                ],
                [
                    {
                        tag:"p-calendar",
                        type:"string",
                        filterKey:"studyDate.from",
                        placeholder:"Start date from"
                    },
                    {
                        tag:"p-calendar",
                        type:"string",
                        filterKey:"studyDate.to",
                        placeholder:"Start date to"
                    }
                ]
            ],[
                [
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"SendingApplicationEntityTitleOfSeries",
                        placeholder:"Sending Application Entity Title of Series",
                        title:"Sending Application Entity Title of Series"
                    },
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"InstitutionalDepartmentName",
                        placeholder:"Institutional Department Name"
                    }
                ],[
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"StationName",
                        placeholder:"Station",
                        title:"Station Name"
                    },
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"SOPClassesInStudy",
                        placeholder:"SOP classes in study",
                        title:"SOP classes in study"
                    }
                ],[
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"StudyID",
                        placeholder:"Study ID",
                        title:"Study ID"
                    },
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"SeriesDescription",
                        placeholder:"Series Description",
                        title:"Series Description"
                    }
                ]
            ],[
                [
                    {
                        tag:"checkbox",
                        filterKey:"expired",
                        text:"Only expired studies"
                    },
                    {
                        tag:"checkbox",
                        filterKey:"incomplete",
                        text:"Only incomplete studies"
                    }
                ],[
                    {
                        tag:"checkbox",
                        filterKey:"retrievefailed",
                        text:"Only failed to be retrieved"
                    },
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"StudyInstanceUID",
                        placeholder:"Study Instance UID",
                        title:"Study Instance UID"
                    }
                ],[
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"StudyDescription",
                        placeholder:"Study Description",
                        title:"Study Description"
                    },
                    {
                        tag:"input",
                        type:"text",
                        filterKey:"BodyPartExamined",
                        placeholder:"Body Part Examined",
                        title:"Body Part Examined"
                    }
                ]
            ],[
                [
                    {
                        tag:"p-calendar",
                        type:"string",
                        filterKey:"StudyReceiveDateTime.from",
                        placeholder:"Study created from"
                    },
                    {
                        tag:"p-calendar",
                        type:"string",
                        filterKey:"StudyReceiveDateTime.to",
                        placeholder:"Study created to"
                    }
                ],[
                    {
                        tag:"dummy"
                    },
                    {
                        tag:"dummy"
                    }
                ],
                [
                    {
                        tag:"button",
                        id:"count",
                        text:'QUERIE COUNT',
                        description:"QUERIE ONLY THE COUNT"
                    },
                    {
                        tag:"button",
                        id:"querie",
                        text:'QUERIE STUDIES',
                        description:"QUERIE STUDIES"
                    }
                ]
            ]
    ];
  }*/
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
