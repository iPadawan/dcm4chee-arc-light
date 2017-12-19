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
    retrievesCount = {};
    dashboardConfig;
    dashboardConfigPath = "dcmDevice.dcmuiConfig[0].dcmuiDashboardConfig[0]";
    queueConfigPath = "dcmDevice.dcmArchiveDevice.dcmQueue";
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
            this.exportsCount[status] = {};
            this.retrievesCount[status] = {};
        })
        this.getMyDeviceName();
    }
/*    getQueueName(){
      this.service.getQueueName().subscribe((res)=>{
        this.queueNames = res;
        this.queuesAccessable = true;
        this.getQueuesCount();
      },(err)=>{
        this.queuesAccessable = false;
      });
    }*/
    getQueuesCount(){
        let actions = [];
        this.cfpLoadingBar.start();
        this.statuses.forEach(status => {
            this.dashboardConfig.dcmuiQueueName.forEach(queueName =>{
                actions.push({
                    observable: this.service.getQueuesCount(queueName.dcmQueueName, (status != '*') ? {status: status} : {}),
                    status:status,
                    queueName:queueName
                });
            })
        });
        Observable.combineLatest(actions.map(action => {return action.observable;})).subscribe((responses)=>{
            responses.forEach((res,i) => {
                this.queuesCount[actions[i].status][actions[i].queueName.dcmQueueName] = res;
            });
            this.cfpLoadingBar.complete();
        },(err)=>{
            this.cfpLoadingBar.complete();
            actions.forEach((res,i) => {
                this.queuesCount[actions[i].status][actions[i].queueName.dcmQueueName] = '!';
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
    getMyDeviceName(){
        this.service.getMyDeviceName().subscribe((myDevice=>{
                try{
                    this.myDevice = myDevice.dicomDeviceName;
                    this.getMyDeviceObject(this.myDevice);
                }catch(e){
                    console.error("dicomDeviceName in myDevice response not found",e);
                }
            }),
            (err)=>{
                this.myDevice = "";
            });
    }
    getMyDeviceObject(deviceName){
        this.service.getMyDeviceObject(deviceName).subscribe((myDevice)=>{
            try{
                if(_.hasIn(myDevice,this.dashboardConfigPath)){
                    this.queuesAccessable = true;
                    this.dashboardConfig = _.get(myDevice,this.dashboardConfigPath);
                    let convertedQueueNames = [];
                    if(_.hasIn(myDevice,this.queueConfigPath)){
                        let queueNames:any[] = <any[]>_.get(myDevice,this.queueConfigPath);
                        queueNames.forEach(queus=>{
                            if(this.dashboardConfig.dcmuiQueueName.indexOf(queus.dcmQueueName) > -1){
                                convertedQueueNames.push(queus);
                            }
                        });
                    }else{
                        convertedQueueNames = this.dashboardConfig.dcmuiQueueName.map(queue =>{
                           return {
                               dcmQueueName:queue,
                               dicomDescription:queue
                           }
                        });
                    }
                    this.dashboardConfig.dcmuiQueueName = convertedQueueNames;
                    this.dashboardConfig.dicomuiDeviceName.splice(0, 0, '*');
                    this.getCounts();
                }else{
                    this.service.getQueueName().subscribe((queuNames)=>{
                        this.queuesAccessable = true;
                        this.dashboardConfig = {
                            dcmuiQueueName:queuNames.map((queu)=>{
                                return {
                                    dcmQueueName:queu.name,
                                    dicomDescription:queu.description
                                }
                            }),
                            dicomuiDeviceName:[deviceName]
                        }
                        this.dashboardConfig.dicomuiDeviceName.splice(0, 0, '*');
                        this.getCounts();
                    },(err)=>{
                        this.queuesAccessable = false;
                    });
                }
            }catch (e){
                console.error("error on geting config from device",e);
            }
        },(err)=>{
            this.httpErrorHandler.handleError(err);
        });
    }
    getCounts(){
        this.getQueuesCount();
        this.getRetrievesCount();
        this.getExportsCount();
    }
    getRetrievesCount(){
        let actions = [];
        this.cfpLoadingBar.start();
        this.statuses.forEach(status => {
            this.dashboardConfig.dicomuiDeviceName.forEach(deviceName =>{
                let filter = {
                    status: (status != '*') ? status:undefined,
                    dicomDeviceName:(deviceName != '*') ? deviceName:undefined,
                }
                actions.push({
                    observable: this.service.getRetrievesCount(filter),
                    status:status,
                    name:deviceName
                });
            })
        });
        Observable.combineLatest(actions.map(action => {return action.observable;})).subscribe((responses)=>{
            responses.forEach((res,i) => {
                this.retrievesCount[actions[i].status][actions[i].name] = res;
            });
            this.cfpLoadingBar.complete();
        },(err)=>{
            this.cfpLoadingBar.complete();
            actions.forEach((res,i) => {
                this.retrievesCount[actions[i].status][actions[i].name] = '!';
            });
            this.httpErrorHandler.handleError(err);
        });
    }
    getExportsCount(){
        let actions = [];
        this.cfpLoadingBar.start();
        this.statuses.forEach(status => {
            this.dashboardConfig.dicomuiDeviceName.forEach(deviceName =>{
                let filter = {
                    status: (status != '*') ? status:undefined,
                    dicomDeviceName:(deviceName != '*') ? deviceName:undefined,
                }
                actions.push({
                    observable: this.service.getExportsCount(filter),
                    status:status,
                    name:deviceName
                });
            })
        });
        Observable.combineLatest(actions.map(action => {return action.observable;})).subscribe((responses)=>{
            responses.forEach((res,i) => {
                this.exportsCount[actions[i].status][actions[i].name] = res;
            });
            this.cfpLoadingBar.complete();
        },(err)=>{
            this.cfpLoadingBar.complete();
            actions.forEach((res,i) => {
                this.exportsCount[actions[i].status][actions[i].name] = '!';
            });
            this.httpErrorHandler.handleError(err);
        });
    }
    refreshQueueCount(){
        this.getQueuesCount();
    }
    refreshRetrieveCount(){
        this.getRetrievesCount();
    }
    refreshExportCount(){
        this.getExportsCount();
    }
}
