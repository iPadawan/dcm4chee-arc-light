import {Component, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'pie-timer',
  templateUrl: './pie-timer.component.html',
  styleUrls: ['./pie-timer.component.scss']
})
export class PieTimerComponent implements OnInit {

  context:CanvasRenderingContext2D;
  @Input() size;
  @Input() timer;
  @Input() color;
  @Input() toggle;
  @Input() start;
  canvasText;
  timerRunning = false;
  interval;
  constructor() { }

    @ViewChild("myCanvas") myCanvas;

    ngAfterViewInit() {
        let canvas = this.myCanvas.nativeElement;
        this.context = canvas.getContext("2d");
    }
    draw(second){
        let ctx = this.context;
        // let secondPortion = 2/30;
        ctx.stroke();
        let secondPosition = (2/(this.timer*10) * second)-0.5;
        ctx.beginPath();
        ctx.clearRect(0,0,this.calculate(40),this.calculate(40));
        ctx.arc(this.calculate(20), this.calculate(20), this.calculate(15), -0.5 * Math.PI, secondPosition* Math.PI);
        ctx.strokeStyle = this.color;
        ctx.lineWidth=2;
        ctx.font = this.calculate(21) + "px Arial";
        ctx.fillStyle = this.color;
        if((second/10) % 1 === 0){
         this.canvasText = (second/10).toString();
        }
        if((second/10) < 10){
            ctx.fillText(this.canvasText,this.calculate(14),this.calculate(28));
        }else{
            ctx.fillText(this.canvasText,this.calculate(8),this.calculate(28));
        }
        ctx.stroke();
    }
    calculate(value){
        return (this.size * value) / 40;
    }
    drawStopedPosition(){
        let ctx = this.context;
        ctx.beginPath();
        ctx.clearRect(0,0,this.calculate(40),this.calculate(40));
        ctx.arc(this.calculate(20), this.calculate(20), this.calculate(15), 0* Math.PI, 2* Math.PI);
        ctx.strokeStyle = this.color;
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.moveTo(this.calculate(16), this.calculate(10));
        ctx.lineTo(this.calculate(16), this.calculate(30));
        ctx.lineTo(this.calculate(30), this.calculate(20));
        ctx.lineTo(this.calculate(16), this.calculate(10));
        ctx.fill();
    }
    ngOnInit() {
        this.color = this.color || '#777';
        this.size = this.size || 30;
        this.timer = this.timer || 30;
        this.start = this.start ? (this.start * 10) : 0;
        this.startInterval();
    }
    startInterval(){
        let start = this.start;
        this.canvasText = this.start;
        this.timerRunning = true;
        this.interval = setInterval(()=>{
            this.draw(start);
            start = (start+1) % (this.timer*10);
        },100);
    }
    stopInterval(){
        this.timerRunning = false;
        this.drawStopedPosition();
        clearInterval(this.interval);
    }
    toggleTimer(){
        if(this.toggle){
            if(this.timerRunning){
                this.stopInterval();
            }else{
                this.startInterval();
            }
        }
    }
}
