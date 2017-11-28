import { Component, OnInit } from '@angular/core';
import {RetrieveExportService} from "./retrieve-export.service";
import {AeListService} from "../../../ae-list/ae-list.service";
import {AppService} from "../../../app.service";
import * as _ from 'lodash';
import {ActivatedRoute} from "@angular/router";

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
    constructor(
        private route: ActivatedRoute,
        private service:RetrieveExportService,
        private aeListService:AeListService,
        private mainservice: AppService,
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
          this.studyFilterSchema = this.service.getStudieFilterSchema(this.aes,this.submitText);
        },(err)=>{
              if (retries)
                  this.getAes(retries - 1);
        });
    }

}
