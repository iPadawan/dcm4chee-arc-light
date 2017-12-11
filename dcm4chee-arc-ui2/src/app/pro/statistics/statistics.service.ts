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
import * as _ from 'lodash';

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
    setRangeToParamsCPU(params,convertedRange, errorText){
        try{
            params.query.bool.must.push({
                "range": {
                    "@timestamp": {
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
    getCpuUsage(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.CPU_PARAMETERS;
        this.setRangeToParamsCPU(params,convertedRange,"Setting time range failed on  Docker Stats - CPU");
        return this.queryGet(params, url);
    }
    getMemoryRssUsage(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.MEMORY_RSS_PARAMETERS;
        this.setRangeToParamsCPU(params,convertedRange,"Setting time range failed on  Docker Stats - Memory RSS");
        return this.queryGet(params, url);
    }
    getMemoryUsage(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.MEMORY_USAGE_PARAMETERS;
        this.setRangeToParamsCPU(params,convertedRange,"Setting time range failed on  Docker Stats - Memory Usage");
        return this.queryGet(params, url);
    }
    getNetworkTransmittedPackets(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.NETWORK_TRANSMITTED_PACKETS_PARAMETERS;
        this.setRangeToParamsCPU(params,convertedRange,"Setting time range failed on  Docker Stats - Network Transmitted packets");
        return this.queryGet(params, url);
    }
    getWritesPerSecond(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.WRITE_PER_SECOND_PARAMETERS;
        this.setRangeToParamsCPU(params,convertedRange,"Setting time range failed on  Docker Stats - Writes p. second");
        return this.queryGet(params, url);
    }
    getReadsPerSecond(range, url){
        let convertedRange = this.getRangeConverted(range);
        let params = Globalvar.READ_PER_SECOND_PARAMETERS;
        this.setRangeToParamsCPU(params,convertedRange,"Setting time range failed on  Docker Stats - Writes p. second");
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
            "StudyReceiveDateTime":this.getStudyDateFromRange(range),
        }
        if(typeof aet === "string")
            return this.studiesService.getCount(this.studiesService.rsURL('internal',aet,"",""),"studies",param);
        else
            return Observable.forkJoin(
                this.getMainAets(aet).map(aetElement => {
                    return this.studiesService.getCount(this.studiesService.rsURL('internal',aetElement.dicomAETitle,"",""),"studies",param);
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
    isRangeSmallerThan24H(range){
        if((new Date(range.to).getTime()) - (new Date(range.from).getTime()) < 86400005)
            return true;
        else
            return false;
    }
    prepareHistogramData(response, range, barChartOptions:any,mode){
        let histogramData:any = {};
        histogramData = {
            labels:[],
            data:{},
            ready:{
                labels:[],
                data:[]
            },
            chartOptions:_.cloneDeep(barChartOptions)
        }
        if(this.isRangeSmallerThan24H(range)){
                histogramData.chartOptions['scales'].xAxes[0].time.displayFormats = {
                    'millisecond': 'HH:mm:ss',
                    'second': 'HH:mm:ss',
                    'minute': 'HH:mm:ss',
                    'hour': 'HH:mm:ss',
                    'day': 'HH:mm:ss',
                    'week': 'HH:mm:ss',
                    'month': 'HH:mm:ss',
                    'quarter': 'HH:mm:ss',
                    'year': 'HH:mm:ss',
                }
        }else{histogramData.chartOptions['scales'].xAxes[0].time.displayFormats = {
                'millisecond': 'DD.MM.YYYY',
                'second': 'DD.MM.YYYY',
                'minute': 'DD.MM.YYYY',
                'hour': 'DD.MM.YYYY',
                'day': 'DD.MM.YYYY',
                'week': 'DD.MM.YYYY',
                'month': 'DD.MM.YYYY',
                'quarter': 'DD.MM.YYYY',
                'year': 'DD.MM.YYYY',
            }
        }
        if(_.hasIn(response,"aggregations.2.buckets") && _.size(response.aggregations[2].buckets) > 0){
            _.forEach(response.aggregations["2"].buckets,(m,i)=>{
                histogramData.labels.push(m.key);
                _.forEach(m[3].buckets,(bucket,bIndex)=>{
                    histogramData.data[bucket.key] = histogramData.data[bucket.key] ? histogramData.data[bucket.key] : {};
                    histogramData.data[bucket.key].data = histogramData.data[bucket.key].data || [];
                    if(histogramData.data[bucket.key].data.length < histogramData.labels.length){
                        for (let arr = 0; arr < histogramData.labels.length;arr++){
                            if(!histogramData.data[bucket.key].data[arr]){
                                histogramData.data[bucket.key].data.push(null);
                            }
                        }
                    }
                    if(mode === 'cpu'){
                        histogramData.data[bucket.key].data[histogramData.labels.length-1] = bucket[1].value;
                    }else{
                        histogramData.data[bucket.key].data[histogramData.labels.length-1] = bucket.doc_count;
                    }
                });
            });
            histogramData.ready.labels = [range.from, ...histogramData.labels.map(time => { return new Date(time);}), range.to];
            _.forEach(histogramData.data,(d,j)=>{
                histogramData.ready.data.push({
                    label:j,
                    data:[null,...d.data,null]
                });
            });
            if(Object.keys(histogramData.data).length < 11){
                histogramData.chartOptions.legend.position = 'top';
            }else{
                if(Object.keys(histogramData.data).length < 30){
                    histogramData.chartOptions.legend.position = 'right';
                }else{
                    histogramData = {
                        labels:[],
                        data:{},
                        ready:{
                            labels:[],
                            data:[]
                        },
                        noDataText:"Too much data!",
                    }
                }
            }
        }else{
            histogramData = {
                labels:[],
                data:{},
                ready:{
                    labels:[],
                    data:[]
                },
                noDataText:"No data found!",
            }
        }
        return Observable.of(histogramData);
    }
    getActionCodeText(code){
        let returnValue;
        switch (code){
            case 'C':
                returnValue = "Create (C)";
                break;
            case 'R':
                returnValue = "Read (R)";
                break;
            case 'U':
                returnValue = "Update (U)";
                break;
            case 'D':
                returnValue = "Delete (D)";
                break;
            case 'E':
                returnValue = "Execute (E)";
                break;
            default:
                returnValue = "-";
        }
        return returnValue;
    }

    getEventOutcomeIndicatorText(code){
        let returnValue;
        switch (code){
            case '0':
                returnValue = {
                    text:"Nominal Success (0)",
                    state:""
                }
                break;
            case '4':
                returnValue = {
                    text:"Minor failure (4)",
                    state:"error"
                }
                break;
            case '8':
                returnValue = {
                    text:"Serious failure (8)",
                    state:"error"
                }
                break;
            case '12':
                returnValue = {
                    text:"Major failure (12)",
                    state:"error"
                }
                break;
            default:
                returnValue = {
                    text:"-",
                    state:""
                }
        }
        return returnValue;
    }
}
