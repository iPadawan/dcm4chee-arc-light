import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Globalvar} from "../../constants/globalvar";
import {StatisticsService} from "../statistics/statistics.service";
import {colorSets} from "@swimlane/ngx-charts/release/utils";

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.Native
})
export class DashboardComponent implements OnInit {

    public barChartLabels = [];
    public pieChartColor =  Globalvar.HISTOGRAMCOLORS;
    public barChartType:string = 'line';
    public barChartLegend:boolean = true;
    public barChartData:any[] = [];
    //
    colorScheme;
    showXAxis = true;
    showYAxis = true;
    gradient = false;
    showLegend = true;
    showXAxisLabel = true;
    xAxisLabel = '@timestamp per 30 seconds';
    showYAxisLabel = true;
    yAxisLabel = 'Max cpu.totalUsage';
    autoScale = true;
    view: any[] = [800, 400];
    onSelect(event) {
        console.log(event);
/*        this.colorScheme = colorSets[0];
        if(colorSets.length > this.colorIndex + 1){
            this.colorIndex++;
            this.colorScheme = colorSets[this.colorIndex];
        }else{
            this.colorIndex = 0;
            this.colorScheme = colorSets[this.colorIndex];

        }
        console.log("this.colorSchema",this.colorScheme);*/
    }

    elasticSearchIsRunning;
    url;
    // histogramData = {"labels":[1510754400000],"data":{"1.2.840.10008.5.1.4.1.1.1":{"data":[3]},"1.2.840.10008.5.1.4.1.1.2":{"data":[1]}},"ready":{"labels":["2017-11-13T14:24:25.694Z","2017-11-15T14:00:00.000Z","2017-11-20T14:24:25.695Z"],"data":[{"label":"1.2.840.10008.5.1.4.1.1.1","data":[null,3,null]},{"label":"1.2.840.10008.5.1.4.1.1.2","data":[null,1,null]}]},"chartOptions":{"scaleShowVerticalLines":false,"responsive":true,"maintainAspectRatio":false,"legend":{"position":"top"},"scales":{"xAxes":[{"type":"time","time":{"displayFormats":{"millisecond":"DD.MM.YYYY","second":"DD.MM.YYYY","minute":"DD.MM.YYYY","hour":"DD.MM.YYYY","day":"DD.MM.YYYY","week":"DD.MM.YYYY","month":"DD.MM.YYYY","quarter":"DD.MM.YYYY","year":"DD.MM.YYYY"}}}],"yAxes":[{"ticks":{"min":0},"scaleLabel":{"display":true,"labelString":"Studies"}}]}},"show":false};
    histogramData = {};
    range = {
        from:undefined,
        to:undefined
    };
    colorIndex = 0;
    constructor(
        public statisticsService:StatisticsService
    ) { }

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

    ngOnInit() {
        console.log("colorSets",colorSets);
        this.colorScheme = colorSets[2];
        this.setTodayDate();
        this.getElasticsearchUrl(2);

    }

    setTodayDate(){
        let d = new Date();
        d.setMinutes(d.getMinutes() - 15);
        this.range.from = d;
        this.range.to = new Date();
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
                $this.statisticsService.getCpuUsage($this.range, $this.url).subscribe(cpu=>{
                    $this.histogramData = $this.prepareLineData(cpu);
                });
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

    prepareLineData(elasticData){
        let preparedData = [];
        let group = {};
        elasticData.aggregations[2].buckets.forEach((m,i) => {
            m[3].buckets.forEach(buckets=>{
                group[buckets.key] = group[buckets.key] || [];
                group[buckets.key].push({
                    value:buckets[1].value,
                    name:new Date(m.key)
                });
            });
        });
        for(let groupLabel in group){
            preparedData.push({
                name:groupLabel,
                series:group[groupLabel]
            })
        }
        return preparedData;
    }
}
