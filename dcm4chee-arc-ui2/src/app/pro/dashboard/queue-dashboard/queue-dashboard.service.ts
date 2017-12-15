import { Injectable } from '@angular/core';
import {J4careHttpService} from "../../../helpers/j4care-http.service";
import {WindowRefService} from "../../../helpers/window-ref.service";
import {AppService} from "../../../app.service";

@Injectable()
export class QueueDashboardService {

  constructor(
      private $http:J4careHttpService,
      private mainservice:AppService
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
}
