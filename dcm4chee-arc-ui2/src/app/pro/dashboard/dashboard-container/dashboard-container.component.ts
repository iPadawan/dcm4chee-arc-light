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
    visiblePage = {
        "first":true,
        "second":false,
        "third":false
    };
    getPage = {
        next:(currentPage)=>{
            if(currentPage === 'first')
                return 'second'
            if(currentPage === 'second')
                return 'third'
            return undefined;
        },
        prev:(currentPage)=>{
            if(currentPage === 'second')
                return 'first'
            if(currentPage === 'third')
                return 'second'
            return undefined;
        },
    };
    pageMap = new Map([
        ['first','home'],
        ['second','hardware'],
        ['third','queue']
    ]);
    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}
    ngOnInit() {
        this.route.params
            .subscribe((params) => {
                this.goToPage(params.id);
            });
    }
    goToPage(pagename){
        // this.router.navigateByUrl(`/monitoring/dashboard/${pagename}`);
/*        if(this.activePageEndState === "first" && pagename != 'home'){
            if(pagename === 'hardware')
                this.next();
        }
        if(this.activePageEndState === "second" && pagename != 'hardware'){
            // this.left();
            if(pagename === 'home')
                this.prev();
            if(pagename === 'queue')
                this.next();
        }
        if(this.activePageEndState === "third" && pagename != 'queue'){
            // this.left();
            if(pagename === 'hardware')
                this.prev();
        }*/
        if(pagename === 'home' && this.activePageEndState != 'first'){
            if(this.activePageEndState === 'second')
                this.prev();
            if(this.activePageEndState === 'third'){
                this.prev(true);
            }

        }

        if(pagename === 'hardware' && this.activePageEndState != 'second'){
            if(this.activePageEndState === 'first')
                this.next();
            if(this.activePageEndState === 'third')
                this.prev();
        }
        if(pagename === 'queue' && this.activePageEndState != 'third'){
            if(this.activePageEndState === 'second')
                this.next();
            if(this.activePageEndState === 'first'){
                this.next(true);
            }
        }
    }
    next(double?){
        if(this.activePageEndState != 'third') {
            if(double && this.activePageEndState === 'first'){
                let next = 'third';
                this.visiblePage['second'] = true;
                this.visiblePage['third'] = true;
                $('ul.page_block').animate({
                    marginLeft: "-200%"
                }, this.duration, () => {
                    this.router.navigateByUrl(`/monitoring/dashboard/${this.pageMap.get('third')}`);
                    this.visiblePage['first'] = false;
                    this.visiblePage['second'] = false;
                    this.activePageEndState = next;
                });
            }else{
                let next = this.getPage.next(this.activePageEndState);
                let margin = "-100%";
                if(this.activePageEndState === 'second')
                    margin = "-200%";
                this.visiblePage[next] = true;
                $('ul.page_block').animate({
                    marginLeft: margin
                }, this.duration, () => {
                    this.router.navigateByUrl(`/monitoring/dashboard/${this.pageMap.get(next)}`);
                    this.visiblePage[this.activePageEndState] = false;
                    this.activePageEndState = next;
                });
            }
        }
    }
    prev(double?){
        if(this.activePageEndState != 'first'){
            if(double && this.activePageEndState === 'third'){
                let prev = 'first';
                this.visiblePage['second'] = true;
                this.visiblePage['first'] = true;
                $('ul.page_block').animate({
                    marginLeft: '0'
                }, this.duration, () => {
                    this.router.navigateByUrl(`/monitoring/dashboard/${this.pageMap.get('first')}`);
                    this.visiblePage['third'] = false;
                    this.visiblePage['second'] = false;
                    this.activePageEndState = prev;
                });
            }else{
                let prev = this.getPage.prev(this.activePageEndState);
                let margin = '0';
                if(this.activePageEndState === 'third')
                    margin = "-100%";
                this.visiblePage[prev] = true;
                $('ul.page_block').animate({
                    marginLeft:margin
                }, this.duration,()=>{
                    this.router.navigateByUrl(`/monitoring/dashboard/${this.pageMap.get(prev)}`);
                    this.visiblePage[this.activePageEndState] = false;
                    this.activePageEndState = prev;
                });
            }
        }
    }
}
