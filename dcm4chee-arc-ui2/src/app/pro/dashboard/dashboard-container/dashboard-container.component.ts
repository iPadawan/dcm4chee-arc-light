import { Component, OnInit } from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'dashboard-container',
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.scss']
})
export class DashboardContainerComponent implements OnInit {

    showFirstPage = true;
    showSecondPage = false;
    activePageEndState = "first";
    duration= 500;

    constructor() {}
    ngOnInit() {
    }
    right(){
        this.showSecondPage = true;
        $('ul.page_block').animate({
            marginLeft:"-100%"
        }, this.duration,()=>{
            this.activePageEndState = "second";
            this.showFirstPage = false;
        });
    }
    left(){
        this.showFirstPage = true;
        $('ul.page_block').animate({
            marginLeft:"0"
        }, this.duration,()=>{
            this.activePageEndState = "first";
            this.showSecondPage = false;
        });
    }
}
