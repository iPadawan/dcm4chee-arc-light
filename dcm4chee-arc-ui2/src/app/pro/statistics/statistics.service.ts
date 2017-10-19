import { Injectable } from '@angular/core';
import {Http} from "@angular/http";
import {WindowRefService} from "../../helpers/window-ref.service";
import Global = NodeJS.Global;
import {Globalvar} from "../../constants/globalvar";
import {AeListService} from "../../ae-list/ae-list.service";
import {J4careHttpService} from "../../helpers/j4care-http.service";
import {StudiesService} from "../../studies/studies.service";
import {Observable} from "rxjs/Observable";
import {DatePipe} from "@angular/common";

@Injectable()
export class StatisticsService {

    constructor(
        private $http:J4careHttpService,
        private nativeHttp:Http,
        private aeListService:AeListService,
        private studiesService:StudiesService
    ) { }

    queryGet(params, url){
        return this.nativeHttp.get(`${url}/_search?source=`+JSON.stringify(params))
            .map(res => {
                let resjson;
                try{
                    let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                    if(pattern.exec(res.url)){
                        WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                    }
                    resjson = res.json();
                }catch (e){
                    resjson = [];
                }
                return resjson;
            });
    };
    getElasticsearchUrl(){
        return this.$http.get("../elasticsearch")
            .map(res => {
                let resjson;
                try{
                    let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                    if(pattern.exec(res.url)){
                        WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                    }
                    resjson = res.json();
                }catch (e){
                    resjson = [];
                }
                return resjson;
            });
    }
    setRangeToParams(params,convertedRange, errorText){
        try{
            params.query.bool.must.push({
                "range": {
                    "Event.EventDateTime": {
                        "gte": convertedRange.from,
                        "lte": convertedRange.to,
                        "format": "epoch_millis"
                    }
                }
            });
        }catch(e){
            console.error(errorText,e);
        }
    }
    getRangeConverted(range){
        try{
            return {
                from:new Date(range.from).getTime(),
                to :new Date(range.to).getTime()
            };
        }catch (e){
            return{
                from :(new Date().getTime() - 86400000),
                to : new Date().getTime()
            }
        }
    }
    checkIfElasticSearchIsRunning(url){
        return this.nativeHttp.get(`${url}/?pretty`)
            .map(res => {
                let resjson;
                try{
                    let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                    if(pattern.exec(res.url)){
                        WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                    }
                    resjson = res.json();
                }catch (e){
                    resjson = [];
                }
                return resjson;
            });
    }
    getAets(){
        return this.aeListService.getAets();
    }
    getQueriesUserID(range, url, aets){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.QUERIESUSERID_PARAMETERS(
            aets.map((aet)=>{
                return `Destination.UserID:${aet.dicomAETitle}`;
            }).join(" OR ")
        );
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Queries UserID ");
        return this.queryGet(params, url);
    }
    getRetrievUserID(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.RETRIEVESUSERID_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Retrieves UserID ");
        return this.queryGet(params, url);
    }
    getStudiesStoredSopClass(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.STUDIESSTOREDSOPCLASS_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Studies Stored / SOPClass ");
        return this.queryGet(params, url);
    }
    getStudiesStoredUserID(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.STUDIESSTOREDUSERID_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Studies Stored / UserID ");
        return this.queryGet(params, url);
    }
    getStudiesStoredReceivingAET(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.STUDIESSTOREDRECIVINGAET_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Studies Stored / Receiving AET UserID ");
        return this.queryGet(params, url);
    }
    getStudiesStoredCounts(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.STUDIESSTOREDCOUNTS_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Stored Counts ");
        return this.queryGet(params, url);
    }
    getStudiesStoredCountsFromDatabase(range, aet){
        let param = {
            "StudyDate":this.getStudyDateFromRange(range),
            "count":true
        }
        if(typeof aet === "string")
            return this.studiesService.queryStudies(this.studiesService.rsURL('internal',aet,"",""),param);
        else
            return Observable.forkJoin(
                this.getMainAets(aet).map(aetElement => {
                    return this.studiesService.queryStudies(this.studiesService.rsURL('internal',aetElement.dicomAETitle,"",""),param)
                })
            );
    }
    getRetrieveCounts(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.RETRIEVCOUNTS_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Retrieve Counts ");
        return this.queryGet(params, url);
    }
    getErrorCounts(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.ERRORSCOUNTS_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Error Counts ");
        return this.queryGet(params, url);
    }
    getWildflyErrorCounts(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.WILDFLYERRORCOUNTS_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Application Error Counts ");
        return this.queryGet(params, url);
    }
    getQueriesCounts(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.QUERIESCOUNTS_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Queries Counts ");
        return this.queryGet(params, url);
    }
    getAuditEvents(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.AUDITEVENTS_PARAMETERS;
        this.setRangeToParams(params,convertedRange,"Setting time range failed on Audit Event ");
        return this.queryGet(params, url);
    }
    getStudyDateFromRange(range){
        var datePipe = new DatePipe('us-US');
        if(range.from === range.to){
            return datePipe.transform(range.from, 'yyyyMMdd');
        }else{
            return `${datePipe.transform(range.from, 'yyyyMMdd')}-${datePipe.transform(range.to, 'yyyyMMdd')}`;
        }
    }
    getMainAets(aets){
        return aets.filter(aet => {
            return aet.dcmAcceptedUserRole.indexOf('user') > -1;
        });
    }
}
