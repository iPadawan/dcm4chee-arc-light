import { Component, OnInit } from '@angular/core';
import {RetrieveExportService} from "./retrieve-export.service";
import {AeListService} from "../../../ae-list/ae-list.service";
import {AppService} from "../../../app.service";
import * as _ from 'lodash';
import {ActivatedRoute} from "@angular/router";
import {WindowRefService} from "../../../helpers/window-ref.service";
import {J4careHttpService} from "../../../helpers/j4care-http.service";
import {j4care} from "../../../helpers/j4care.service";

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
    constructor(
        private route: ActivatedRoute,
        private service:RetrieveExportService,
        private aeListService:AeListService,
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

    getAes(retries){
        this.aeListService.getAes().subscribe((aes)=>{
          this.aes = (<any[]>aes).map(ae => {
              return {
                  value:ae.dicomAETitle,
                  text:ae.dicomAETitle
              }
          });
          this.filterSchema = this.service.getRetrieveFilterSchema(this.aes,this.submitText);
          // this.studyFilterSchema = this.service.getStudieFilterSchema(this.aes,this.submitText);
          let $this = this;
          this.studyFilterSchema = j4care.prepareFlatFilterObject(this.service.getFlatStudieFilterSchema(this.aes,this.submitText).filter(obj=>{
              if($this.mode === "retrieve"){
                  return obj["mode"] != "export";
              }else{
                  return obj["mode"] != "retrieve";
              }
          }));
        },(err)=>{
              if (retries)
                  this.getAes(retries - 1);
        });
    }

    onSubmit(object){
        console.log("onsubmit object",object);
        if(_.hasIn(object,"id")){
            this.service.convertDateFilter(object.model,'StudyDate');
            switch (object.id){
                case 'count':
                    this.getStudiesCount(object.model);
                break;
                case 'querie':
                    this.getStudies(object.model);
                break;
            }
        }else{

        }
    }

    getStudiesCount(params){
        this.service.getStudiesCount(params).subscribe((count)=>{
            console.log("count",count);
            this.count = count.count;
        },(err)=>{

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
        let offset = 0;
        let $this = this;
        this.service.getStudies(params).subscribe((res)=>{
            console.log("studies",res);
            this.dicomObject = res;
            //Add number of patient related studies manuelly hex(00201200) => dec(2101760)
            let index = 0;
            while ($this.attributeFilters.Patient.dcmTag[index] && ($this.attributeFilters.Patient.dcmTag[index] < 2101760)) {
                index++;
            }
            $this.attributeFilters.Patient.dcmTag.splice(index, 0, 2101760);

            let pat, study, patAttrs, tags = $this.attributeFilters.Patient.dcmTag;
            console.log('res', res);
            res.forEach(function (studyAttrs, index) {
                patAttrs = {};
                $this.extractAttrs(studyAttrs, tags, patAttrs);
                if (!(pat && _.isEqual(pat.attrs, patAttrs))) { //angular.equals replaced with Rx.helpers.defaultComparer
                    pat = {
                        attrs: patAttrs,
                        studies: [],
                        showAttributes: false
                    };
                    // $this.$apply(function () {
                    $this.patients.push(pat);
                    // });
                }
                study = {
                    patient: pat,
                    offset: offset + index,
                    moreSeries: false,
                    attrs: studyAttrs,
                    series: null,
                    showAttributes: false,
                    fromAllStudies: false,
                    selected: false
                };
                pat.studies.push(study);
                //                   $this.studies.push(study); //sollte weg kommen
            });
            console.log("this pateint",this.patients);
/*            if ($this.moreStudies = (res.length > $this.limit)) {
                pat.studies.pop();
                if (pat.studies.length === 0) {
                    $this.patients.pop();
                }
                // this.studies.pop();
            }*/
            // console.log('patients=', $this.patients[0]);
            // $this.mainservice.setMessage({
            //     "title": "Info",
            //     "text": "Test",
            //     "status": "info"
            // });
            // sessionStorage.setItem("patients", $this.patients);
            // $this.mainservice.setGlobal({patients:this.patients,moreStudies:$this.moreStudies});
            // $this.mainservice.setGlobal({studyThis:$this});
/*            console.log('global set', $this.mainservice.global);
            $this.cfpLoadingBar.complete();*/
        },(err)=>{

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
