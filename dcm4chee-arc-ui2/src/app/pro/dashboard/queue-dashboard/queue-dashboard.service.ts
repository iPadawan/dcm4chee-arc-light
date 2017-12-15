import { Injectable } from '@angular/core';
import {J4careHttpService} from "../../../helpers/j4care-http.service";
import {WindowRefService} from "../../../helpers/window-ref.service";
import {AppService} from "../../../app.service";
import {DevicesService} from "../../../devices/devices.service";

@Injectable()
export class QueueDashboardService {

  constructor(
      private $http:J4careHttpService,
      private mainservice:AppService,
      private devicesService:DevicesService
  ){}

  getQueueName(){
      return this.$http.get('../queue')
          .map(res => {let resjson; try{ let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/"); if(pattern.exec(res.url)){ WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";} resjson = res.json(); }catch (e){ resjson = [];} return resjson;})
  }
  getQueuesCount(queueName, filter){
    let filterParm = (filter) ? `?${this.mainservice.param(filter)}`:'';
      return this.$http.get(`../queue/${queueName}/count${filterParm}`)
          .map(res => {let resjson; try{ let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/"); if(pattern.exec(res.url)){ WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";} resjson = res.json(); }catch (e){ resjson = [];} return resjson;})
  }
  getExportsCount(filter){
    let filterParm = (filter) ? `?${this.mainservice.param(filter)}`:'';
      return this.$http.get(`../monitor/export/count${filterParm}`)
          .map(res => {let resjson; try{ let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/"); if(pattern.exec(res.url)){ WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";} resjson = res.json(); }catch (e){ resjson = [];} return resjson;})
  }
  getClusterDevices(myDevice){
      let deviceGroups ={
          tln:[
            "archive1tln",
            "archive2tln",
            "archive3tln",
            "archive4tln",
          ],
          trt:[
              "archive1trt",
              "archive2trt",
              "archive3trt",
              "archive4trt",
          ]
      };
      if(deviceGroups.tln.indexOf(myDevice) > -1){
          return deviceGroups.tln;
      }
      if(deviceGroups.trt.indexOf(myDevice) > -1){
          return deviceGroups.trt;
      }
      return [];
  }
  getDevices(){
      return this.devicesService.getDevices();
  }
  getMyDevice(){
      return this.$http.get('../devicename')
          .map(res => {let resjson; try{ let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/"); if(pattern.exec(res.url)){ WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";} resjson = res.json(); }catch (e){ resjson = [];} return resjson;})
  }
}
