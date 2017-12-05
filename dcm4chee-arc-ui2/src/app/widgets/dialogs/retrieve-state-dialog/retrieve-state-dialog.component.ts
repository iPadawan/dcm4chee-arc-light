import {Component, OnDestroy, OnInit} from '@angular/core';
import {MdDialogRef} from "@angular/material";
import {RetrieveExportService} from "../../../pro/migration/retrieve-export/retrieve-export.service";

@Component({
  selector: 'app-retrieve-state-dialog',
  templateUrl: './retrieve-state-dialog.component.html'
})
export class RetrieveStateDialogComponent implements OnInit,OnDestroy {
    studyDateSplit;
    filter;
    state = {};
    constructor(
      public dialogRef: MdDialogRef<RetrieveStateDialogComponent>,
      private retrieveService:RetrieveExportService
    ){}

    ngOnInit() {
        this.studyDateSplit.forEach((study)=>{
              this.state[study] = {
                  loader:true,
                  ticker:false,
                  count:undefined,
                  x:false
              };
        });
        this.studyDateSplit.forEach((study)=>{
          console.log("study",study);
          this.retrieveService.retrieve(study,this.filter).subscribe((res)=>{
              console.log("res",res);
            this.state[study] = {
                loader:false,
                ticker:true,
                count:res.count,
                x:false
            };
          },(err)=>{
              console.log("err",err);
              this.state[study] = {
                  loader:false,
                  ticker:false,
                  count:`Error ${err.status} ${err.statusText}`,
                  x:true
              };
          });
        });
    }
    ngOnDestroy(){
        this.studyDateSplit.forEach((study)=>{
            this.state[study] = {
                loader:true,
                ticker:false,
                count:undefined,
                x:false
            };
        });
    }
}
