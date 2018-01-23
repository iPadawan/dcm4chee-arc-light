import { Component, OnInit } from '@angular/core';
import {AppService} from "../../../app.service";
import {DashboardService} from "../dashboard.service";
import {colorSets} from "@swimlane/ngx-charts/release/utils";
import {StatisticsService} from "../../statistics/statistics.service";
import * as _ from 'lodash';

@Component({
  selector: 'hardware-dashboard',
  templateUrl: './hardware-dashboard.component.html'
})
export class HardwareDashboardComponent implements OnInit {
    colorScheme;
    showXAxis = true;
    showYAxis = true;
    gradient = true;
    showLegend = true;
    showXAxisLabel = true;
    showYAxisLabel = true;
    rangeMin = {
        from:undefined,
        to:undefined
    };
    elasticSearchIsRunning;
    url;
    xAxisLabel = {
        cpu:'@timestamp per 30 seconds',
        memoryRss:'@timestamp per 30 seconds',
        memoryUsage:'@timestamp per 30 seconds',
        transmittedPackets:'@timestamp per 30 seconds',
        writesPerSecond:'@timestamp per 30 seconds',
        readsPerSecond:'@timestamp per 30 seconds'
    };
    yAxisLabel = {
        cpu:'Max CPU total usage',
        memoryRss:'RSS memory consumption (B)',
        memoryUsage:'Memory consumption (B)',
        transmittedPackets:'Packets transmitted per second',
        writesPerSecond:'Average written B/s',
        readsPerSecond:'Average read B/s'
    };
    graphData = {};
    autoScale = true;
    view: any[] = [800, 250];
    graphWidth = '49.5%';
    public barChartOptions:any = {
        scaleShowVerticalLines: false,
        responsive: true,
        maintainAspectRatio: false,
        legend:{
            position:'right'
        },
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    displayFormats: {
                        'millisecond': 'DD.MM.YYYY',
                        'second': 'DD.MM.YYYY',
                        'minute': 'DD.MM.YYYY',
                        'hour': 'DD.MM.YYYY',
                        'day': 'DD.MM.YYYY',
                        'week': 'DD.MM.YYYY',
                        'month': 'DD.MM.YYYY',
                        'quarter': 'DD.MM.YYYY',
                        'year': 'DD.MM.YYYY',
                    }
                }
            }],
            yAxes: [{
                ticks: {
                    min: 0
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Queries'
                }
            }]
        }
    };
    updateIntervalTime= 30000;
    updateInterval = {
        'cpu':undefined,
        'memoryRss':undefined,
        'memoryUsage':undefined,
        'transmittedPackets':undefined,
        'writesPerSecond':undefined,
        'readsPerSecond':undefined
    };
    firstIntervalInit = {
        'cpu':false,
        'memoryRss':false,
        'memoryUsage':false,
        'transmittedPackets':false,
        'writesPerSecond':false,
        'readsPerSecond':false
    };
    constructor(
      public service:DashboardService,
      public mainservice:AppService,
      public statisticsService:StatisticsService,
  ) { }

    ngOnInit(){
        this.initCheck(10);
    }
    initCheck(retries){
        let $this = this;
        if(_.hasIn(this.mainservice,"global.authentication")){
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
    init() {
        console.log("width",$(window).width());
        console.log("colorSets",colorSets);
        this.setGraphWidth();
        this.colorScheme = colorSets[2];
        this.setMin();
        this.getElasticsearchUrl(2);

    }
    toggleTimer(mode){
        if(!this.updateInterval[mode]){
            this.startInterval[mode]();
        }else{
            clearInterval(this.updateInterval[mode]);
            this.updateInterval[mode] = undefined;
        }
    }
    startInterval = {
        cpu:()=>{
            // this.getCpuUsage();
            if(!this.updateInterval['cpu']){
                this.updateInterval['cpu'] = setInterval(()=>{
                    this.getCpuUsage();
                },this.updateIntervalTime);
            }
        },
        memoryRss:()=>{
            // this.getMemoryRssUsage();
            if(!this.updateInterval['memoryRss']){
                this.updateInterval['memoryRss'] = setInterval(()=>{
                    this.getMemoryRssUsage();
                },this.updateIntervalTime);
            }
        },
        memoryUsage:()=>{
            // this.getMemoryUsage();
            if(!this.updateInterval['memoryUsage']){
                this.updateInterval['memoryUsage'] = setInterval(()=>{
                    this.getMemoryUsage();
                },this.updateIntervalTime);
            }
        },
        transmittedPackets:()=>{
            // this.getNetworkTransmittedPackets();
            if(!this.updateInterval['transmittedPackets']){
                this.updateInterval['transmittedPackets'] = setInterval(()=>{
                    this.getNetworkTransmittedPackets();
                },this.updateIntervalTime);
            }
        },
        writesPerSecond:()=>{
            // this.getWritesPerSecond();
            if(!this.updateInterval['writesPerSecond']){
                this.updateInterval['writesPerSecond'] = setInterval(()=>{
                    this.getWritesPerSecond();
                },this.updateIntervalTime);
            }
        },
        readsPerSecond:()=>{
            // this.getReadsPerSecond();
            if(!this.updateInterval['readsPerSecond']){
                this.updateInterval['readsPerSecond'] = setInterval(()=>{
                    this.getReadsPerSecond();
                },this.updateIntervalTime);
            }
        }
    };
    startAllGraphIntervals(){
        for(let interval in this.startInterval){
            this.startInterval[interval]();
        }
    }
    stopAllGraphIntervals(){
        for(let interval in this.startInterval){
            clearInterval(this.updateInterval[interval]);
        }
    }
    setMin(){
        let d = new Date();
        d.setMinutes(d.getMinutes() - 15);
        this.rangeMin.from = d;
        this.rangeMin.to = new Date();
    }
    setGraphWidth(){
        let width = $(window).width();
        if(width < 1750){
            if(width < 1250){
                this.graphWidth = "100%";
                this.view[0] = (width)-150;
            }else{
                this.view[0] = (width/2)-150;
            }
        }

    }
    getElasticsearchUrl(retries){
        let $this = this;
        this.statisticsService.getElasticsearchUrl().subscribe(
            (res)=>{
                $this.url = res.url;
                $this.checkIfElasticSearchIsRunning(2);
            },
            (err)=>{
                if (retries){
                    $this.getElasticsearchUrl(retries-1);
                }else{
                    $this.elasticSearchIsRunning = false;
                }
            }
        );
    }
    checkIfElasticSearchIsRunning(retries){
        let $this = this;
        this.statisticsService.checkIfElasticSearchIsRunning(this.url).subscribe(
            (res)=>{
                $this.elasticSearchIsRunning = true;
                // $this.updateInterval = setInterval(()=>{
                //     $this.setMin();
                //     $this.getGraphDataFromElasticsearch();
                // },$this.updateIntervalTime);
                $this.getGraphDataFromElasticsearch();
                // $this.startAllGraphIntervals();
            },
            (err)=>{
                if (retries){
                    $this.checkIfElasticSearchIsRunning(retries-1);
                }else{
                    $this.elasticSearchIsRunning = false;
                }
            }
        );
    }
    getGraphDataFromElasticsearch(){
        this.getCpuUsage();
        this.getMemoryRssUsage();
        this.getMemoryUsage();
        this.getNetworkTransmittedPackets();
        this.getReadsPerSecond();
        this.getWritesPerSecond();

    }
    getCpuUsage(){
        this.statisticsService.getCpuUsage(this.rangeMin, this.url).subscribe(cpu=>{
            if(this.graphData['cpu']){
                this.graphData['cpu'] = [];
                this.graphData['cpu'] = [...this.service.prepareGraphData(cpu)];
            }else{
                this.graphData['cpu'] = this.service.prepareGraphData(cpu);
            }
            this.startInterval["cpu"]();
            this.firstIntervalInit["cpu"] = true;
        });
    }
    getMemoryRssUsage(){
        this.statisticsService.getMemoryRssUsage(this.rangeMin, this.url).subscribe(memoryRss=>{
            if(this.graphData['memoryRss']){
                this.graphData['memoryRss'] = [];
                this.graphData['memoryRss'] = [...this.service.prepareGraphData(memoryRss)];
            }else{
                this.graphData['memoryRss'] = this.service.prepareGraphData(memoryRss);
            }
            this.startInterval["memoryRss"]();
            this.firstIntervalInit["memoryRss"] = true;
        });
    }
    getMemoryUsage(){
        this.statisticsService.getMemoryUsage(this.rangeMin, this.url).subscribe(memoryUsage=>{
            if(this.graphData['memoryUsage']){
                this.graphData['memoryUsage'] = [];
                this.graphData['memoryUsage'] = [...this.service.prepareGraphData(memoryUsage)];
            }else{
                this.graphData['memoryUsage'] = this.service.prepareGraphData(memoryUsage);
            }
            this.startInterval["memoryUsage"]();
            this.firstIntervalInit["memoryUsage"] = true;
        });
    }
    getNetworkTransmittedPackets(){
        this.statisticsService.getNetworkTransmittedPackets(this.rangeMin, this.url).subscribe(transmittedPackets=>{
            if(this.graphData['transmittedPackets']){
                this.graphData['transmittedPackets'] = [];
                this.graphData['transmittedPackets'] = [...this.service.prepareGraphData(transmittedPackets)];
            }else{
                this.graphData['transmittedPackets'] = this.service.prepareGraphData(transmittedPackets);
            }
            this.startInterval["transmittedPackets"]();
            this.firstIntervalInit["transmittedPackets"] = true;
        });
    }
    getWritesPerSecond(){
        this.statisticsService.getWritesPerSecond(this.rangeMin, this.url).subscribe(writesPerSecond=>{
            if(this.graphData['writesPerSecond']){
                this.graphData['writesPerSecond'] = [];
                this.graphData['writesPerSecond'] = [...this.service.prepareGraphData(writesPerSecond)];
            }else{
                this.graphData['writesPerSecond'] = this.service.prepareGraphData(writesPerSecond);
            }
            this.startInterval["writesPerSecond"]();
            this.firstIntervalInit["writesPerSecond"] = true;
        });
    }
    getReadsPerSecond(){
        this.statisticsService.getReadsPerSecond(this.rangeMin, this.url).subscribe(readsPerSecond=>{
            if(this.graphData['readsPerSecond']){
                this.graphData['readsPerSecond'] = [];
                this.graphData['readsPerSecond'] = [...this.service.prepareGraphData(readsPerSecond)];
            }else{
                this.graphData['readsPerSecond'] = this.service.prepareGraphData(readsPerSecond);
            }
            this.startInterval["readsPerSecond"]();
            this.firstIntervalInit["readsPerSecond"] = true;
        });
    }
    ngOnDestroy(){
        // clearInterval(this.updateInterval);
        this.stopAllGraphIntervals();
    }
}
