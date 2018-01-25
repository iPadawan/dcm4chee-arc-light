import { Injectable } from '@angular/core';
import {StudiesService} from "../../../studies/studies.service";
import * as _ from 'lodash';
import {forEach} from "@angular/router/src/utils/collection";
import {AppService} from "../../../app.service";
import {J4careHttpService} from "../../../helpers/j4care-http.service";
import {WindowRefService} from "../../../helpers/window-ref.service";
import {j4care} from "../../../helpers/j4care.service";

@Injectable()
export class RetrieveExportService {

  constructor(
      private studieService:StudiesService,
      private mainservice:AppService,
      private $http:J4careHttpService
  ) { }

    /*
    * Convert "{dateKey}.from" and  "{dateKey}.to" to dateKey:from-to
    * */
    convertDateFilter(filters,dateKeys){
        let $this = this;
        dateKeys.forEach((dateKey,i)=>{
            if((_.hasIn(filters,`${dateKey}.from`) && filters[`${dateKey}.from`] != '') || (_.hasIn(filters,`${dateKey}.to`) && filters[`${dateKey}.to`] != '')){
                filters[dateKey] = $this.convertToDatePareString(filters[`${dateKey}.from`],filters[`${dateKey}.to`]);
                delete filters[`${dateKey}.from`];
                delete filters[`${dateKey}.to`];
            }
        });
        return filters;
    }
    retrieve(studyDate, filters){
        filters.QueryAET = filters.QueryAET || filters.ExternalAET;
        let url = `../aets/${
                        filters.LocalAET
                    }/dimse/${
                        filters.ExternalAET
                    }/studies/query:${
                        filters.QueryAET
                    }/export/dicom:${
                        filters.DestinationAET
                    }`;
        let param = this.mainservice.param(
                            this.setStudyDateRangeToFilterObject(
                                studyDate,
                                this.cloneWithoutMainFilters(
                                    filters,
                                    false
                                )
                            )
                        );
        if(param != "" && param != undefined){
            url = `${url}?${param}`;
        }
        return this.$http.post(url,{})
            .map(res=>j4care.redirectOnAuthResponse(res))
    }
    export(studyDate, filters){
        let url = `../aets/${filters.aet}/export/${filters.exporterID}/studies`;
        let param = this.mainservice.param(
            this.setStudyDateRangeToFilterObject(
                studyDate,
                this.cloneWithoutMainFilters(
                    filters,
                    false
                )
            )
        );
        if(param != "" && param != undefined){
            url = `${url}?${param}`;
        }
        return this.$http.post(url,{})
            .map(res=>j4care.redirectOnAuthResponse(res))
    }
    setStudyDateRangeToFilterObject(studyRange,filters){
        let dateKey = "StudyDate";
        if(studyRange){
            filters[dateKey] = studyRange;
        }
        delete filters[`${dateKey}.from`];
        delete filters[`${dateKey}.to`];
        return filters;
    }
    splitDate(object){
        let endDate = [];
        let endDatePare = [];
        let m;
        const regex = /((\d{4})(\d{2})(\d{2}))(?:\d{6})?-((\d{4})(\d{2})(\d{2}))(?:\d{6})?/;
        if ((m = regex.exec(object["StudyDate"])) !== null) {
            let fromString = `${m[2]}-${m[3]}-${m[4]}`;
            let toString = `${m[6]}-${m[7]}-${m[8]}`;
            let from = new Date(fromString).getTime();
            let to = new Date(toString).getTime();
            let diff = to-from;
            let block = 86400000;
            if(diff > block){
                endDate.push(this.convertToDateString(fromString));
                let daysInDiff = diff/block;
                let dateStep = from;
                while(daysInDiff > 0){
                    endDatePare.push(this.convertToDatePareString(dateStep,dateStep+block));
                    dateStep = dateStep+block;
                    endDate.push(this.convertToDateString(new Date(dateStep)));
                    daysInDiff--;
                }
                return endDate;
            }else{
                return object["StudyDate"];
            }
        }
        return null;
    }
    convertToDateString(date){
        let addZero = (nr)=>{
            if(nr < 10){
                return `0${nr}`;
            }
            return nr;
        };
        if(date != undefined){
            let dateConverted = new Date(date);
            let dateObject =  {
                yyyy:dateConverted.getFullYear(),
                mm:addZero(dateConverted.getMonth()+1),
                dd:addZero(dateConverted.getDate())
            };
            return `${dateObject.yyyy}${(dateObject.mm)}${dateObject.dd}`;
        }
    }
    convertToDatePareString(firstDate,secondDate){
        if(firstDate === undefined && secondDate === undefined){
            return undefined;
        }
        let addZero = (nr)=>{
            if(nr < 10){
                return `0${nr}`;
            }
            return nr;
        };
        let firstDateConverted = new Date(firstDate);
        let secondDateConverted = new Date(secondDate);
        let firstDateObject =  {
            yyyy:firstDateConverted.getFullYear(),
            mm:addZero(firstDateConverted.getMonth()+1),
            dd:addZero(firstDateConverted.getDate())
        };
        let firstDateString = `${firstDateObject.yyyy}${(firstDateObject.mm)}${firstDateObject.dd}`;
        if(new Date(firstDate).getTime() == new Date(secondDate).getTime()){
            return firstDateString;
        }else{
            let secondDateObject =  {
                yyyy:secondDateConverted.getFullYear(),
                mm:addZero(secondDateConverted.getMonth()+1),
                dd:addZero(secondDateConverted.getDate())
            };
            let secondDateString = `${secondDateObject.yyyy}${(secondDateObject.mm)}${secondDateObject.dd}`;
            return `${firstDateString}-${secondDateString}`;
        }
    }
    getRetrieveFilterSchema(aet,submitText,splitBlock){

    let filterSchema:any = [
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
                    },
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
                    },
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
                    },
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
                    },

    ];
    if(splitBlock){
        return [
            ...filterSchema,
            ...[
                {
                    tag:"checkbox",
                    filterKey:"splitMode",
                    text:"Split (StudyDate) day-ways"
                },
                {
                    tag:"button",
                    text:submitText,
                    description:"Retrieve studies"
                },                {
                    tag:"dummy"
                },
                {
                    tag:"dummy"
                },
            ]
        ]
    }else{
        return [
            ...filterSchema,
            ...[
                {
                    tag:"dummy"
                },
                {
                    tag:"dummy"
                },
                {
                    tag:"button",
                    text:submitText,
                    description:"Maximal number of tasks in returned list"
                },
                {
                    tag:"dummy"
                }
            ]
        ];
    }
  }
    getExportFilterSchema(aet, exporterIds, submitText,splitBlock){

        let filterSchema:any = [
            {
                tag:"label",
                text:"Archive AE Title"
            },
            {
                tag:"select",
                options:aet,
                filterKey:"aet",
                description:"Archive AE Title to filter by"
            },
            {
                tag:"label",
                text:"Exporter ID"
            },
            {
                tag:"select",
                options:exporterIds,
                filterKey:"exporterID",
                description:"Exporter ID"
            },
            {
                tag:"checkbox",
                filterKey:"only-stgcmt",
                text:"Only storage commitment without export"
            },
            {
                tag:"checkbox",
                filterKey:"only-ian",
                text:"Only enable IAN without export"
            }
        ];
        if(splitBlock){
            return [
                ...filterSchema,
                ...[
                    {
                        tag:"dummy"
                    },
                    {
                        tag:"dummy"
                    },
                    {
                        tag:"checkbox",
                        filterKey:"splitMode",
                        text:"Split (StudyDate) day-ways"
                    },
                    {
                        tag:"button",
                        text:submitText,
                        description:"Retrieve studies"
                    },                {
                        tag:"dummy"
                    },
                    {
                        tag:"dummy"
                    }
                ]
            ]
        }else{
            return [
                ...filterSchema,
                ...[
                    {
                        tag:"dummy"
                    },
                    {
                        tag:"dummy"
                    },{
                        tag:"dummy"
                    },
                    {
                        tag:"dummy"
                    },
                    {
                        tag:"button",
                        text:submitText,
                        description:"Maximal number of tasks in returned list"
                    },
                    {
                        tag:"dummy"
                    }
                ]
            ];
        }
    }
  getFlatStudieFilterSchema(aet,submitText, countText){
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
              tag:"range-picker",
              type:"text",
              filterKey:"StudyDate",
              description:"Study date"
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
          },
          {
              tag:"input",
              type:"text",
              filterKey:"BodyPartExamined",
              placeholder:"Body Part Examined",
              title:"Body Part Examined"
          }
          ,{
              tag:"button",
              id:"count",
              text:countText,
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
    cloneWithoutMainFilters(object,convertDate){
        const ignoreKeys = [
            "LocalAET",
            "ExternalAET",
            "QueryAET",
            "DestinationAET",
            "splitMode",
            "aet",
            "exporterID"
        ];
        let newObject = _.clone(object);
        ignoreKeys.forEach(aet=>{
          delete newObject[aet];
        })
        if(convertDate){
            return this.convertDateFilter(newObject,['StudyDate','StudyReceiveDateTime']);
        }else{
            return newObject;
        }
    }
    rsUrl(params){
        let initernalAet = params.LocalAET || params.QueryAET;
        let externalAet = params.ExternalAET;
        return this.studieService.rsURL("external",null, initernalAet, externalAet);
    }
    getStudiesCount(params){
        return this.studieService.getCount(this.rsUrl(params), "studies",this.cloneWithoutMainFilters(params,true));
    }
    getStudies(params){
        return this.studieService.queryStudies(this.rsUrl(params), this.cloneWithoutMainFilters(params,true));
    }
    getExporters(){
        return this.$http.get('../export').
            map(res => j4care.redirectOnAuthResponse(res))
    }
}
