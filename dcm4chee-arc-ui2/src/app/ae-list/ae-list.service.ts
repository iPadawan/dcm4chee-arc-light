import { Injectable } from '@angular/core';
import {Http} from "@angular/http";
import {WindowRefService} from "../helpers/window-ref.service";
import {DevicesService} from "../devices/devices.service";
import {J4careHttpService} from "../helpers/j4care-http.service";
import {j4care} from "../helpers/j4care.service";

@Injectable()
export class AeListService {

    constructor(
      private $http:J4careHttpService,
      private devicesService:DevicesService
    ) { }

    getAes(){
      return this.$http.get(
          '../aes'
      ).map(res => j4care.redirectOnAuthResponse(res))
    }
    getAets(){
       return this.$http.get(
            '../aets'
        ).map(res => j4care.redirectOnAuthResponse(res))

    }
    getDevices(){
        return this.devicesService.getDevices();
    }
}
