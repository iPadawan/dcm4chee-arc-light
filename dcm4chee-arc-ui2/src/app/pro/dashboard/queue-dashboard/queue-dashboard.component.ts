import { Component, OnInit } from '@angular/core';
import {QueueDashboardService} from "./queue-dashboard.service";
import {AppService} from "../../../app.service";
import * as _ from 'lodash';

@Component({
  selector: 'queue-dashboard',
  templateUrl: './queue-dashboard.component.html',
  styleUrls: ['./queue-dashboard.component.scss']
})
export class QueueDashboardComponent implements OnInit {

    queuesAccessable = false;
    queueTypes;
    statuses = [
        "ALL",
        "SCHEDULED",
        "IN PROCESS",
        "COMPLETED",
        "WARNING",
        "FAILED",
        "CANCELED"
    ];

    constructor(
        private service:QueueDashboardService,
        private mainservice:AppService
    ) {}

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
    init(){
      this.getQueueTypes();
    }
    getQueueTypes(){
      this.service.getQueueTypes().subscribe((res)=>{
        this.queueTypes = res;
        this.queuesAccessable = true;
      },(err)=>{
        this.queuesAccessable = false;
      });
    }
}
