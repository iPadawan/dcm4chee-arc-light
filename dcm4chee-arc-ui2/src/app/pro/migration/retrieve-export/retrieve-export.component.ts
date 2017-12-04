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
    countText = "QUERIE COUNT";
    constructor(
        private httpErrorHandler:HttpErrorHandler,
        private cfpLoadingBar: SlimLoadingBarService,
        private route: ActivatedRoute,
        private service:RetrieveExportService,
        private aeListService:AeListService,
        private studiesService:StudiesService,
        private mainservice: AppService,
        private $http:J4careHttpService
    ) { }

    ngOnInit(){
        this.initCheck(10);
    }
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
                this.getAes(2);
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
    getAes(retries){
        this.aeListService.getAes().subscribe((aes)=>{
            this.aes = (<any[]>aes).map(ae => {
              return {
                  value:ae.dicomAETitle,
                  text:ae.dicomAETitle
              }
            });
            this.filterSchema = j4care.prepareFlatFilterObject(this.service.getRetrieveFilterSchema(this.aes,this.submitText, false),2);
            // this.studyFilterSchema = this.service.getStudieFilterSchema(this.aes,this.submitText);
            this.setStudyFilterSchema();
        },(err)=>{
              if (retries)
                  this.getAes(retries - 1);
        });
    }
    onChange(object){
        console.log("in retrieve object",object);
        let dummyObject = {};
        if(_.hasIn(object,['StudyDate.from']) && _.hasIn(object,['StudyDate.to']) && (new Date(object['StudyDate.from']).getTime() != new Date(object['StudyDate.to']).getTime())){
            dummyObject['StudyDate.from'] = object['StudyDate.from'];
            dummyObject['StudyDate.to'] = object['StudyDate.to'];
            this.service.convertDateFilter(dummyObject,["StudyDate"]);
            // this.showSplitBlock = true;
            this.filterSchema = j4care.prepareFlatFilterObject(this.service.getRetrieveFilterSchema(this.aes,this.submitText, true),2);
        }
    }

    onSubmit(object){
        console.log("onsubmit object",object);
        if(_.hasIn(object,"id")){
            // this.service.convertDateFilter(object.model,'StudyDate');
            switch (object.id){
                case 'count':
                    this.getStudiesCount(object.model);
                break;
                case 'querie':
                    this.getStudies(object.model);
                break;
            }
        }else{
            let studyDateSplit = [];
            if(_.hasIn(object,"splitMode")){
                studyDateSplit = this.service.splitDate(object);
            }else{
                studyDateSplit.push(this.service.convertToDatePareString(object['StudyDate.from'], object['StudyDate.to']));
            }
            console.log("studydateSplit",studyDateSplit);
            if(studyDateSplit.length > 1){
                //TODO
            }else{
                // this.studiesService.
                this.service.retrieve(studyDateSplit[0],object).subscribe((res)=>{
                    console.log("retreive result");
                },(err)=>{
                    this.httpErrorHandler.handleError(err);
                });
            }
        }
    }

    getStudiesCount(params){
        this.service.getStudiesCount(params).subscribe((count)=>{
            console.log("count",count);
            // this.count = count.count;
            this.countText = `Count:${count.count}`;
            this.setStudyFilterSchema();
        },(err)=>{
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
        this.service.getStudies(params).subscribe((res)=>{
            console.log("studies",res);
            this.dicomObject = res;
            $this.cfpLoadingBar.complete();
        },(err)=>{
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
