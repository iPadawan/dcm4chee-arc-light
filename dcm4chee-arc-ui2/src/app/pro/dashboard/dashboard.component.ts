import {Component, HostListener, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Globalvar} from "../../constants/globalvar";
import {StatisticsService} from "../statistics/statistics.service";
import {colorSets} from "@swimlane/ngx-charts/release/utils";
import {DashboardService} from "./dashboard.service";
import {j4care} from "../../helpers/j4care.service";
import * as _ from 'lodash';
import {AppService} from "../../app.service";
import {DashboardDetailTableComponent} from "../../widgets/dialogs/dashboard-detail-table/dashboard-detail-table.component";
import {MdDialog, MdDialogRef} from "@angular/material";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit,OnDestroy {

/*    public barChartLabels = [];
    public pieChartColor =  Globalvar.HISTOGRAMCOLORS;
    public barChartType:string = 'line';
    public barChartLegend:boolean = true;
    public barChartData:any[] = [];*/
    //

    Object = Object;
    searchlist = '';
    counts = {
        querie:'-',
        retrieve:'-',
        errors:'-',
        wildflError:'-',
        studieStored:'-'
    };

    onSelect(event) {
        console.log(event);
/*        this.colorScheme = colorSets[0];
        if(colorSets.length > this.colorIndex + 1){
            this.colorIndex++;
            this.colorScheme = colorSets[this.colorIndex];
        }else{
            this.colorIndex = 0;
            this.colorScheme = colorSets[this.colorIndex];

        }
        console.log("this.colorSchema",this.colorScheme);*/
    }

    elasticSearchIsRunning;
    url;
    // graphData = {"labels":[1510754400000],"data":{"1.2.840.10008.5.1.4.1.1.1":{"data":[3]},"1.2.840.10008.5.1.4.1.1.2":{"data":[1]}},"ready":{"labels":["2017-11-13T14:24:25.694Z","2017-11-15T14:00:00.000Z","2017-11-20T14:24:25.695Z"],"data":[{"label":"1.2.840.10008.5.1.4.1.1.1","data":[null,3,null]},{"label":"1.2.840.10008.5.1.4.1.1.2","data":[null,1,null]}]},"chartOptions":{"scaleShowVerticalLines":false,"responsive":true,"maintainAspectRatio":false,"legend":{"position":"top"},"scales":{"xAxes":[{"type":"time","time":{"displayFormats":{"millisecond":"DD.MM.YYYY","second":"DD.MM.YYYY","minute":"DD.MM.YYYY","hour":"DD.MM.YYYY","day":"DD.MM.YYYY","week":"DD.MM.YYYY","month":"DD.MM.YYYY","quarter":"DD.MM.YYYY","year":"DD.MM.YYYY"}}}],"yAxes":[{"ticks":{"min":0},"scaleLabel":{"display":true,"labelString":"Studies"}}]}},"show":false};
    graphData = {};
    rangeDay = {
        from:undefined,
        to:undefined
    };
    aets;
    colorIndex = 0;
    auditEvents;
    auditEventsOriginal;
    auditErrorObject;
    applicationErrorObject;
    moreAudit = {
        limit: 30,
        start: 0,
        loaderActive: false
    };

    dialogRef: MdDialogRef<any>;
    constructor(
        public statisticsService:StatisticsService,
        public service:DashboardService,
        public mainservice:AppService,
        public dialog: MdDialog
    ) { }

    ngOnInit(){
        this.initCheck(10);
    }
    initCheck(retries){
        let $this = this;
        if(_.hasIn(this.mainservice,"global.authentication")){
            this.init();
        }else{
            if (retries){
                setTimeout(()=>{
                    $this.initCheck(retries-1);
                },20);
            }else{
                this.init();
            }
        }
    }
    init() {
        console.log("width",$(window).width());
        console.log("colorSets",colorSets);
        this.setTodayDate();
        this.getElasticsearchUrl(2);

    }

    showErrors(){
        if(this.counts.errors && this.counts.errors != '-' && this.counts.errors != '0'){
            if(this.auditErrorObject && this.auditErrorObject.length < 2500){
                this.showDetailTable(this.auditErrorObject,'Audit Errors');
            }else{
                this.mainservice.setMessage({
                    'title': 'Error',
                    'text': 'Too much data!',
                    'status': 'error'
                });
            }


        }
    }
    showApplicationErrors(){
        if(this.counts.wildflError && this.counts.wildflError != '-' && this.counts.wildflError != '0'){
            if(this.applicationErrorObject && this.applicationErrorObject.length < 2500){
                this.showDetailTable(this.applicationErrorObject,'Application Errors');
            }else{
                this.mainservice.setMessage({
                    'title': 'Error',
                    'text': 'Too much data!',
                    'status': 'error'
                });
            }


        }
    }
    @HostListener('window:scroll', ['$event'])
    loadMoreAuditOnScroll(event) {
        let hT = ($('.load_more').offset()) ? $('.load_more').offset().top : 0,
            hH = $('.load_more').outerHeight(),
            wH = $(window).height(),
            wS = window.pageYOffset;
        console.log("ws",wS);
        console.log("hT + hH - wH",(hT + hH - wH));
        if (wS > (hT + hH - wH)){
            this.loadMoreAudit();
        }
    }
    loadMoreAudit(){
        this.moreAudit.loaderActive = true;
        this.moreAudit.limit += 20;
        this.moreAudit.loaderActive = false;
    }
    setTodayDate(){
        let d = new Date();
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        this.rangeDay.from = d;
        this.rangeDay.to = new Date();
    }
    detailView(object){
        console.log("wholeobject",object);
        object.showDetail = !object.showDetail;
    }

    showDetailTable(data, title){
        this.dialogRef = this.dialog.open(DashboardDetailTableComponent, {
            height: 'auto',
            width: '90%'
        });
        this.dialogRef.componentInstance.tableData = data;
        this.dialogRef.componentInstance.title = title;
        this.dialogRef.afterClosed().subscribe();
    }

    getElasticsearchUrl(retries){
        let $this = this;
        this.statisticsService.getElasticsearchUrl().subscribe(
            (res)=>{
                $this.url = res.url;
                $this.checkIfElasticSearchIsRunning(2);
            },
            (err)=>{
                if (retries){
                    $this.getElasticsearchUrl(retries-1);
                }else{
                    $this.elasticSearchIsRunning = false;
                }
            }
        );
    }

    checkIfElasticSearchIsRunning(retries){
        let $this = this;
        this.statisticsService.checkIfElasticSearchIsRunning(this.url).subscribe(
            (res)=>{
                $this.elasticSearchIsRunning = true;
                // $this.updateInterval = setInterval(()=>{
                //     $this.setMin();
                //     $this.getGraphDataFromElasticsearch();
                // },$this.updateIntervalTime);
                // $this.getGraphDataFromElasticsearch();
                // $this.startAllGraphIntervals();
                $this.getCountDataFromElasticsearch();
                $this.getAets(2);
            },
            (err)=>{
                if (retries){
                    $this.checkIfElasticSearchIsRunning(retries-1);
                }else{
                    $this.elasticSearchIsRunning = false;
                }
            }
        );
    }
    getData(){
        this.getStudiesStoredCountsFromDatabase();
        // this.getGraphDataFromElasticsearch();
        this.getCountDataFromElasticsearch();
    }
    getCountDataFromElasticsearch(){
        this.getQueriesCount();
        this.getRetrieveCounts();
        this.getErrorCounts();
        this.getWildflyErrorCounts();
        this.getAuditEvents();

    }

    getQueriesCount(){
        let $this = this;
        this.statisticsService.getQueriesCounts(this.rangeDay, this.url).subscribe(
            (res)=>{
                try {
                    $this.counts.querie= res.hits.total;
                }catch (e){
                    $this.counts.querie = "-";
                }
            },
            (err)=>{
                $this.counts.querie = "-";
            });

    }
    getRetrieveCounts(){
        let $this = this;
        this.statisticsService.getRetrieveCounts(this.rangeDay, this.url).subscribe(
            (res)=>{
                try {
                    $this.counts.retrieve= res.hits.total;
                }catch (e){
                    $this.counts.retrieve = "-";
                }
            },
            (err)=>{
                $this.counts.retrieve = "-";
            });

    }
    getStudiesStoredCountsFromDatabase(){
        let $this = this;
        this.statisticsService.getStudiesStoredCountsFromDatabase(this.rangeDay, this.aets).subscribe(
            (res)=>{
                try {
                    $this.counts.studieStored = res.map(count => {return count.count}).reduce((a, b) => a + b, 0);
                }catch (e){
                    $this.counts.studieStored = "-";
                }
            },
            (err)=>{
                $this.counts.studieStored = "-";
                console.log("error",err);
            });
    }
    getErrorCounts(){
        let $this = this;
        this.statisticsService.getErrorCounts(this.rangeDay, this.url).subscribe(
            (res)=>{
                try {
                    $this.counts.errors = res.hits.total;
                    $this.auditErrorObject = res.hits.hits.map((audit)=>{
                        return {
                            AuditSourceID:(_.hasIn(audit,"_source.AuditSource.AuditSourceID"))?audit._source.AuditSource.AuditSourceID:'-',
                            EventID:(_.hasIn(audit,"_source.EventID.originalText"))?audit._source.EventID.originalText:'-',
                            ActionCode:(_.hasIn(audit,"_source.Event.EventActionCode"))?this.statisticsService.getActionCodeText(audit._source.Event.EventActionCode):'-',
                            Patient:(_.hasIn(audit,"_source.Patient.ParticipantObjectName"))?audit._source.Patient.ParticipantObjectName:'-',
                            Study:(_.hasIn(audit,"_source.Study.ParticipantObjectID"))?audit._source.Study.ParticipantObjectID:'-',
                            AccessionNumber:(_.hasIn(audit,"_source.AccessionNumber"))?audit._source.AccessionNumber:'-',
                            userId:(_.hasIn(audit,"_source.Source.UserID"))?audit._source.Source.UserID:'-',
                            requestorId:(_.hasIn(audit,"_source.Requestor.UserID"))?audit._source.Requestor.UserID:'-',
                            EventOutcomeIndicator:(_.hasIn(audit,"_source.Event.EventOutcomeIndicator"))? this.statisticsService.getEventOutcomeIndicatorText(audit._source.Event.EventOutcomeIndicator):{text:'-'},
                            Time:(_.hasIn(audit,"_source.Event.EventDateTime"))?audit._source.Event.EventDateTime:undefined,
                            wholeObject:j4care.flatten(audit._source),
                            showDetail:false
                        }
                    });
                }catch (e){
                    $this.counts.errors = "-";
                }
            },
            (err)=>{
                console.log("error",err);
                $this.counts.errors = "-";
            });
    }
    getWildflyErrorCounts(){
        let $this = this;
        this.statisticsService.getWildflyErrorCounts(this.rangeDay, this.url).subscribe(
            (res)=>{
                try {
                    $this.counts.wildflError = res.hits.total;
                    $this.applicationErrorObject = res.hits.hits.map((audit)=>{
                        return {
                            AuditSourceID:(_.hasIn(audit,"_source.AuditSource.AuditSourceID"))?audit._source.AuditSource.AuditSourceID:'-',
                            EventID:(_.hasIn(audit,"_source.EventID.originalText"))?audit._source.EventID.originalText:'-',
                            ActionCode:(_.hasIn(audit,"_source.Event.EventActionCode"))?this.statisticsService.getActionCodeText(audit._source.Event.EventActionCode):'-',
                            Patient:(_.hasIn(audit,"_source.Patient.ParticipantObjectName"))?audit._source.Patient.ParticipantObjectName:'-',
                            Study:(_.hasIn(audit,"_source.Study.ParticipantObjectID"))?audit._source.Study.ParticipantObjectID:'-',
                            AccessionNumber:(_.hasIn(audit,"_source.AccessionNumber"))?audit._source.AccessionNumber:'-',
                            userId:(_.hasIn(audit,"_source.Source.UserID"))?audit._source.Source.UserID:'-',
                            requestorId:(_.hasIn(audit,"_source.Requestor.UserID"))?audit._source.Requestor.UserID:'-',
                            EventOutcomeIndicator:(_.hasIn(audit,"_source.Event.EventOutcomeIndicator"))? this.statisticsService.getEventOutcomeIndicatorText(audit._source.Event.EventOutcomeIndicator):{text:'-'},
                            Time:(_.hasIn(audit,"_source.Event.EventDateTime"))?audit._source.Event.EventDateTime:undefined,
                            wholeObject:j4care.flatten(audit._source),
                            showDetail:false
                        }
                    });
                }catch (e){
                    $this.counts.wildflError = "-";
                }
            },
            (err)=>{
                $this.counts.wildflError = "-";
                console.log("error",err);
            });
    }
    getAuditEvents(){
        let $this = this;
        this.statisticsService.getAuditEvents(this.rangeDay, this.url).subscribe((res)=>{
            $this.auditEventsOriginal = res.hits.hits.map((audit)=>{
                return {
                    AuditSourceID:(_.hasIn(audit,"_source.AuditSource.AuditSourceID"))?audit._source.AuditSource.AuditSourceID:'-',
                    EventID:(_.hasIn(audit,"_source.EventID.originalText"))?audit._source.EventID.originalText:'-',
                    ActionCode:(_.hasIn(audit,"_source.Event.EventActionCode"))?this.statisticsService.getActionCodeText(audit._source.Event.EventActionCode):'-',
                    Patient:(_.hasIn(audit,"_source.Patient.ParticipantObjectName"))?audit._source.Patient.ParticipantObjectName:'-',
                    Study:(_.hasIn(audit,"_source.Study.ParticipantObjectID"))?audit._source.Study.ParticipantObjectID:'-',
                    AccessionNumber:(_.hasIn(audit,"_source.AccessionNumber"))?audit._source.AccessionNumber:'-',
                    userId:(_.hasIn(audit,"_source.Source.UserID"))?audit._source.Source.UserID:'-',
                    requestorId:(_.hasIn(audit,"_source.Requestor.UserID"))?audit._source.Requestor.UserID:'-',
                    EventOutcomeIndicator:(_.hasIn(audit,"_source.Event.EventOutcomeIndicator"))? this.statisticsService.getEventOutcomeIndicatorText(audit._source.Event.EventOutcomeIndicator):{text:'-'},
                    Time:(_.hasIn(audit,"_source.Event.EventDateTime"))?audit._source.Event.EventDateTime:undefined,
                    wholeObject:j4care.flatten(audit._source),
                    showDetail:false
                }
            });
            $this.auditEvents = $this.auditEventsOriginal;
        });
    }
    getAets(retries){
        let $this = this;
        $this.statisticsService.getAets().subscribe((res)=>{
            $this.aets = res;
            $this.getStudiesStoredCountsFromDatabase();
        },(err)=>{
            if(retries)
                $this.getAets(retries-1);
        });
    }

    ngOnDestroy(){
        // clearInterval(this.updateInterval);
        // this.stopAllGraphIntervals();
    }
}
