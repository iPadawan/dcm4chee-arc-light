import { Component, OnInit } from '@angular/core';
import {RetrieveExportService} from "./retrieve-export.service";
import {AeListService} from "../../../ae-list/ae-list.service";
import {AppService} from "../../../app.service";
import * as _ from 'lodash';
import {ActivatedRoute} from "@angular/router";
import {WindowRefService} from "../../../helpers/window-ref.service";
import {J4careHttpService} from "../../../helpers/j4care-http.service";
import {j4care} from "../../../helpers/j4care.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {HttpErrorHandler} from "../../../helpers/http-error-handler";
import {StudiesService} from "../../../studies/studies.service";
import {ConfirmComponent} from "../../../widgets/dialogs/confirm/confirm.component";
import {MdDialog, MdDialogRef} from "@angular/material";
import {RetrieveStateDialogComponent} from "../../../widgets/dialogs/retrieve-state-dialog/retrieve-state-dialog.component";

@Component({
  selector: 'app-retrieve-export',
  templateUrl: './retrieve-export.component.html',
  styleUrls: ['./retrieve-export.component.css']
})
export class RetrieveExportComponent implements OnInit {
    filterSchema;
    studyFilterSchema;
    filterObject = {};
    aes;
    mode;
    headerTitle;
    submitText;
    showFilter = false;
    count;
    attributeFilters: any = {};
    patients = [];
    dicomObject;
    countText = "QUERY COUNT";
    dialogRef: MdDialogRef<any>;
    exporterIds;
    constructor(
        private httpErrorHandler:HttpErrorHandler,
        private cfpLoadingBar: SlimLoadingBarService,
        private route: ActivatedRoute,
        private service:RetrieveExportService,
        private aeListService:AeListService,
        private studiesService:StudiesService,
        private mainservice: AppService,
        private $http:J4careHttpService,
        public dialog: MdDialog
    ) { }

    ngOnInit(){
        this.initCheck(10);
    }
    confirm(confirmparameters){
        // this.config.viewContainerRef = this.viewContainerRef;
        this.dialogRef = this.dialog.open(ConfirmComponent, {
            height: 'auto',
            width: '500px'
        });
        this.dialogRef.componentInstance.parameters = confirmparameters;
        return this.dialogRef.afterClosed();
    };
    initCheck(retries){
        let $this = this;
        if(_.hasIn(this.mainservice,"global.authentication") || (_.hasIn(this.mainservice,"global.notSecure") && this.mainservice.global.notSecure)){
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
        this.route.params
            .subscribe((params) => {
                this.mode = params.mode;
                switch(this.mode){
                case "retrieve":
                    this.headerTitle = "Retrieve studies";
                    this.submitText = "RETRIEVE";
                    break;
                case "export":
                    this.headerTitle = "Export studies";
                    this.submitText = "EXPORT";
                    break;
                }
                this.dicomObject = [];
                this.countText = "QUERY COUNT";
                this.setMainFilters(2);
                this.initAttributeFilter('Patient', 1);
            });
    }
    setStudyFilterSchema(){
        let $this = this;
        this.studyFilterSchema = j4care.prepareFlatFilterObject(this.service.getFlatStudieFilterSchema(this.aes,this.submitText,this.countText).filter(obj=>{
            if($this.mode === "retrieve"){
                return obj["mode"] != "export";
            }else{
                return obj["mode"] != "retrieve";
            }
        }));
    }
    setMainFilters(retries){
        let aeService;
        if(this.mode === 'export'){
            aeService = this.aeListService.getAets();
        }else{
            aeService = this.aeListService.getAes();
        }
        aeService.subscribe((aes)=>{
            this.aes = (<any[]>j4care.extendAetObjectWithAlias(aes)).map(ae => {
              return {
                  value:ae.dicomAETitle,
                  text:ae.dicomAETitle
              }
            });
            this.filterObject['LocalAET'] = this.aes[0].value;
            if(this.mode === 'export'){
                let getExporters = (exporterRetries)=>{
                    this.service.getExporters().subscribe((exporterIds)=>{
                        this.exporterIds = exporterIds.map(exporter=>{
                            return {
                                value:exporter.id,
                                text:exporter.id
                            }
                        });
                        this.filterSchema = j4care.prepareFlatFilterObject(this.service.getExportFilterSchema(this.aes,this.exporterIds,this.submitText, false),2);
                    },(err)=>{
                        if(exporterRetries)
                            getExporters(exporterRetries-1);
                    })
                };
                getExporters(3);
            }else
                this.filterSchema = j4care.prepareFlatFilterObject(this.service.getRetrieveFilterSchema(this.aes,this.submitText, false),2);
            this.setStudyFilterSchema();
        },(err)=>{
              if (retries)
                  this.setMainFilters(retries - 1);
        });
    }
    onChange(object){
        if(this.mode === 'export'){
            // let dummyObject = {};
            if(_.hasIn(object,['StudyDate']) && object['StudyDate'].indexOf('-') > -1){
/*                dummyObject['StudyDate.from'] = object['StudyDate.from'];
                dummyObject['StudyDate.to'] = object['StudyDate.to'];
                this.service.convertDateFilter(dummyObject,["StudyDate"]);*/
                // this.showSplitBlock = true;
                this.filterSchema = j4care.prepareFlatFilterObject(this.service.getExportFilterSchema(this.aes,this.exporterIds,this.submitText, true),2);
            }else{
                this.filterSchema = j4care.prepareFlatFilterObject(this.service.getExportFilterSchema(this.aes,this.exporterIds,this.submitText, false),2);
            }
        }else{
            if(_.hasIn(object,"ExternalAET") && !_.hasIn(object,"QueryAET")){
                object['QueryAET'] = object['ExternalAET'];
                this.filterObject['QueryAET'] = this.filterObject['ExternalAET'];

                // this.studyFilterSchema = [];
                this.setStudyFilterSchema();
            }
  // /**/          let dummyObject = {};
            if(_.hasIn(object,['StudyDate']) && object['StudyDate'].indexOf('-') > -1){
/*                dummyObject['StudyDate.from'] = object['StudyDate.from'];
                dummyObject['StudyDate.to'] = object['StudyDate.to'];
                this.service.convertDateFilter(dummyObject,["StudyDate"]);*/
                // this.showSplitBlock = true;
                this.filterSchema = j4care.prepareFlatFilterObject(this.service.getRetrieveFilterSchema(this.aes,this.submitText, true),2);
            }else{
                this.filterSchema = j4care.prepareFlatFilterObject(this.service.getRetrieveFilterSchema(this.aes,this.submitText, false),2);
            }
        }
    }

    executeStudiesFunction(object){
        switch (object.id){
            case 'count':
                this.getStudiesCount(object.model);
                break;
            case 'querie':
                this.getStudies(object.model);
                break;
        }
    }
    onSubmit(object){
        console.log("onsubmit object",object);
        let title = "Retrieve splited process";
        if(this.mode === "export"){
            title = "Export splited process";
        }
        if(_.hasIn(object,"id")){
            // this.service.convertDateFilter(object.model,'StudyDate');
            if(this.mode === 'retrieve' && _.hasIn(object.model,"LocalAET") && _.hasIn(object.model,"ExternalAET")){
                // if(_.hasIn(object.model,"aet")){
                    this.executeStudiesFunction(object);
                // }else
                //     this.mainservice.setMessage({
                //         'title': 'Error',
                //         'text': "AETitle is missing",
                //         'status': 'error'
                //     });
            }else{
                if(this.mode === 'export' && _.hasIn(object.model,"aet")) {
                    this.executeStudiesFunction(object);
                }else{
                    if(this.mode === 'export'){
                        this.mainservice.setMessage({
                            'title': 'Error',
                            'text': "AETitle is missing",
                            'status': 'error'
                        });
                    }else
                        this.mainservice.setMessage({
                        'title': 'Error',
                        'text': "Calling AETitle or External AETitle missing!",
                        'status': 'error'
                        });
                }
            }
        }else{
            if((_.hasIn(object,"LocalAET") && _.hasIn(object,"ExternalAET") && _.hasIn(object,"DestinationAET"))||this.mode === 'export'){
                let studyDateSplit = [];
                if(_.hasIn(object,"splitMode")){
                    studyDateSplit = this.service.splitDate(object);
                }else{
                    studyDateSplit.push(object['StudyDate']);
                }
                if(studyDateSplit.length > 1){
                    this.dialogRef = this.dialog.open(RetrieveStateDialogComponent, {
                        height: 'auto',
                        width: '700px'
                    });
                    this.dialogRef.componentInstance.studyDateSplit = studyDateSplit;
                    this.dialogRef.componentInstance.filter = object;
                    this.dialogRef.componentInstance.title = title;
                    this.dialogRef.componentInstance.mode = this.mode;
                    this.dialogRef.afterClosed().subscribe((ok)=>{
                    });
                }else{
                    // this.studiesService.
                    if(studyDateSplit.length === 0 || (studyDateSplit.length === 1 && !studyDateSplit[0])){
                        this.confirm({
                            content: `You are about to ${(this.mode==='export')?'export':'retrieve'} studies without specifying a StudyDate range, are you sure you want to continue?`
                        }).subscribe(result => {
                            if(result){
                                if(this.mode === 'export')
                                    this.service.export(studyDateSplit[0],object).subscribe((res)=>{
                                        console.log("retreive result");
                                        this.mainservice.setMessage({
                                            'title': 'Info',
                                            'text': `Export executed successfully!<br>${res.count} studies added in the queue`,
                                            'status': 'info'
                                        });
                                    },(err)=>{
                                        this.httpErrorHandler.handleError(err);
                                    });
                                else
                                    this.service.retrieve(studyDateSplit[0],object).subscribe((res)=>{
                                        console.log("retreive result");
                                        this.mainservice.setMessage({
                                            'title': 'Info',
                                            'text': `Retrieve executed successfully!<br>${res.count} studies added in the queue`,
                                            'status': 'info'
                                        });
                                    },(err)=>{
                                        this.httpErrorHandler.handleError(err);
                                    });
                            }
                        });
                    }else{
                        if(this.mode === 'export')
                            this.service.export(studyDateSplit[0],object).subscribe((res)=>{
                                console.log("retreive result");
                                this.mainservice.setMessage({
                                    'title': 'Info',
                                    'text': `Export executed successfully!<br>${res.count} studies added in the queue`,
                                    'status': 'info'
                                });
                            },(err)=>{
                                this.httpErrorHandler.handleError(err);
                            });
                        else
                            this.service.retrieve(studyDateSplit[0],object).subscribe((res)=>{
                                console.log("retreive result");
                                this.mainservice.setMessage({
                                    'title': 'Info',
                                    'text': `Retrieve executed successfully!<br>${res.count} studies added in the queue`,
                                    'status': 'info'
                                });
                            },(err)=>{
                                this.httpErrorHandler.handleError(err);
                            });
                    }
                }
            }else{
                this.mainservice.setMessage({
                    'title': 'Error',
                    'text': "Calling AETitle,External AETitle or destination AETitle is missing!",
                    'status': 'error'
                });
            }
        }
    }

    getStudiesCount(params){
        this.cfpLoadingBar.start();
        this.service.getStudiesCount(params,this.mode).subscribe((count)=>{
            try{
                console.log("count",count);
                this.countText = `Count:${count.count}`;
            }catch(e){
                this.countText = `Count:0`;
                console.error(e);
            }
            this.setStudyFilterSchema();
            this.cfpLoadingBar.complete();
        },(err)=>{
            this.cfpLoadingBar.complete();
            this.setStudyFilterSchema();
            this.httpErrorHandler.handleError(err);
        });
    }
    extractAttrs(attrs, tags, extracted) {
        for (let tag in attrs){
            if (_.indexOf(tags, tag) > -1){
                extracted[tag] = attrs[tag];
            }
        }
    }
    getStudies(params){
        let $this = this;
        $this.cfpLoadingBar.start();
        this.service.getStudies(params,this.mode).subscribe((res)=>{
            console.log("studies",res);
            if(!res || res.length === 0){
                this.mainservice.setMessage({
                    'title': 'Info',
                    'text': "No studies found!",
                    'status': 'info'
                });
                $this.dicomObject = [];
                $this.countText = `Count:0`;
                $this.setStudyFilterSchema();
            }else{
                $this.dicomObject = res;
                $this.countText = `Count:${res.length }`;
                $this.setStudyFilterSchema();
            }
            $this.cfpLoadingBar.complete();
        },(err)=>{
            $this.cfpLoadingBar.complete();
            $this.setStudyFilterSchema();
            $this.httpErrorHandler.handleError(err);
        });
    }

    initAttributeFilter(entity, retries) {
        let $this = this;
        this.$http.get('../attribute-filter/' + entity)
            .map(res => {let resjson; try{
                let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                if(pattern.exec(res.url)){
                    WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                }
                resjson = res.json(); }catch (e){resjson = {}; } return resjson; })
            .subscribe(
                function (res) {
                    if (entity === 'Patient' && res.dcmTag){
                        let privateAttr = [parseInt('77770010', 16), parseInt('77771010', 16), parseInt('77771011', 16)];
                        res.dcmTag.push(...privateAttr);
                    }
                    $this.attributeFilters[entity] = res;
                    console.log('this.attributeFilters', $this.attributeFilters);
                    // $this.mainservice.setGlobal({attributeFilters:$this.attributeFilters});
                },
                function (res) {
                    if (retries)
                        $this.initAttributeFilter(entity, retries - 1);
                });
    };
}
