import { Component, OnInit } from '@angular/core';
import {QueueDashboardService} from "./queue-dashboard.service";
import {AppService} from "../../../app.service";
import * as _ from 'lodash';
import {Observable} from "rxjs/Observable";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {HttpErrorHandler} from "../../../helpers/http-error-handler";

@Component({
  selector: 'queue-dashboard',
  templateUrl: './queue-dashboard.component.html',
  styleUrls: ['./queue-dashboard.component.scss']
})
export class QueueDashboardComponent implements OnInit {

    queuesAccessable = false;
    queueNames;
    queuesCount = {};
    exportsCount = {};
    statuses = [
        "*",
        "SCHEDULED",
        "IN PROCESS",
        "COMPLETED",
        "WARNING",
        "FAILED",
        "CANCELED"
    ];
    devices: any;
    myDevice:string;

    constructor(
        private service:QueueDashboardService,
        private mainservice:AppService,
        public cfpLoadingBar: SlimLoadingBarService,
        public httpErrorHandler:HttpErrorHandler
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
        this.statuses.forEach(status=>{
            this.queuesCount[status] = {};
        })
        this.getQueueName();
    }
    getQueueName(){
      this.service.getQueueName().subscribe((res)=>{
        this.queueNames = res;
        this.queuesAccessable = true;
        this.getQueuesCount();
      },(err)=>{
        this.queuesAccessable = false;
      });
    }
    getQueuesCount(){
        let actions = [];
        this.cfpLoadingBar.start();
        this.statuses.forEach(status => {
            this.queueNames.forEach(queueName =>{
                actions.push({
                    observable: this.service.getQueuesCount(queueName.name, (status != '*') ? {status: status} : {}),
                    status:status,
                    queueName:queueName
                });
            })
        });
        Observable.combineLatest(actions.map(action => {return action.observable;})).subscribe((responses)=>{
            responses.forEach((res,i) => {
                this.queuesCount[actions[i].status][actions[i].queueName.name] = res;
            });
            this.cfpLoadingBar.complete();
            console.log("queuesCount",this.queuesCount);
        },(err)=>{
            this.cfpLoadingBar.complete();
            actions.forEach((res,i) => {
                this.queuesCount[actions[i].status][actions[i].queueName.name] = '!';
            });
            this.httpErrorHandler.handleError(err);
        });
    }
    getDevices(){
        this.service.getDevices().filter(device => device.hasArcDevExt).subscribe((devices)=>{
            this.devices = devices;
        },(err)=>{
            this.devices = [];
        });
    }
    getMyDevice(){
        this.service.getMyDevice().subscribe((myDevice=>{
                try{
                    this.myDevice = myDevice.dicomDeviceName;
                    this.getExportsCount();
                }catch(e){
                    console.error("dicomDeviceName in myDevice response not found",e);
                }
            }),
            (err)=>{
                this.myDevice = "";
            });
    }
    getExportsCount(){
        let actions = [];
        this.cfpLoadingBar.start();
        //TODO
    }
    refreshQueueCount(){
        this.getQueuesCount();
    }
}
