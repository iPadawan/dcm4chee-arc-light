import { Component, OnInit } from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {ActivatedRoute, Router} from "@angular/router";

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

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}
    ngOnInit() {
        this.route.params
            .subscribe((params) => {
                console.log("dashboard,params",params);
                this.goToPage(params.id);
            });
    }
    goToPage(pagename){
        this.router.navigateByUrl(`/monitoring/dashboard/${pagename}`);
        if(this.activePageEndState === "first" && pagename != 'home'){
            this.right();
        }
        if(this.activePageEndState === "second" && pagename != 'queue'){
            this.left();
        }
    }
    right(){
        this.showSecondPage = true;
        $('ul.page_block').animate({
            marginLeft:"-100%"
        }, this.duration,()=>{
            this.router.navigateByUrl(`/monitoring/dashboard/queue`);
            this.activePageEndState = "second";
            this.showFirstPage = false;
        });
    }
    left(){
        this.showFirstPage = true;
        $('ul.page_block').animate({
            marginLeft:"0"
        }, this.duration,()=>{
            this.router.navigateByUrl(`/monitoring/dashboard/home`);
            this.activePageEndState = "first";
            this.showSecondPage = false;
        });
    }
}
