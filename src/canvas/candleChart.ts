import { Options as SuperOptions } from "./ChartBase";
import { ChartData as SuperChartData } from "./ChartBase";
import { InitialState as SuperInitialState } from "./ChartBase";
import ChartBase from "./ChartBase";
export interface Options extends SuperOptions{
    candleStyle?: {
        upColor?:string;
        downColor?:string;
        evenColor?:string;
        upBarColor?:string;
        downBarColor?:string;
        margin?:number;
        lineWidth?:number;
    }
};

export interface ChartData extends SuperChartData{
    values: number[][];
};

const InitialState:Options = {
    ...SuperInitialState,
    candleStyle:{
        upColor:            "#444",
        downColor:          "#444",
        evenColor:          "#444",
        upBarColor:         "red",
        downBarColor:       "blue",
        margin:       2,
        lineWidth:    1,
    }
};
export default class CandleChart extends ChartBase{
    protected options: Options;
    constructor(canvas: HTMLCanvasElement, options: Options = InitialState){
        super(canvas, options);
        this.options = { ...InitialState, ...this.options };
    }
    calcMinMax(values: number[][]):{min: number, max:number}{
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        values.forEach((val)=>{
          if(val != null){
            max = max < val[1] ? val[1] : max;
            min = min > val[2] ? val[2] : min;
          }
        });
        if(min == Number.MAX_VALUE && max == Number.MIN_VALUE){
          min = 0;
          max = 0;
        }
        return {min, max};
    }


    setPaticularGraphVal(){
        this.xGap = this.chartWidth / this.data.xLabels.length;
        this.xStartPos = this.chartLeft + ( this.xGap / 2);
    }

    draw(data: ChartData){
        super.draw(data);
        this.ctx.save();
        let x = this.chartLeft;
        for(let i = 0; i < this.data.values.length; i++ ){
            const d = this.data.values[i];
            if(d){
                const open = d[0];
                const high = d[1];
                const low = d[2];
                const close = d[3];
                let style, bar;
                if(close > open) {
                    style = this.options.candleStyle.upColor;
                    bar = this.options.candleStyle.upBarColor;
                }else if(close == open){
                    style = this.options.candleStyle.evenColor;
                    bar = this.options.candleStyle.evenColor;
                } else {
                    style = this.options.candleStyle.downColor;
                    bar = this.options.candleStyle.downBarColor;
                }
                this.ctx.beginPath();
                const sx = x + Math.ceil(this.xGap / 2);
                const sy = this.chartBottom - (high - this.minY) * this.yGapHeight;
                const sh = (high - low) * this.yGapHeight || 1;
                this.ctx.strokeStyle = style;
                this.ctx.lineWidth  = this.options.candleStyle.lineWidth;
                this.ctx.moveTo(sx - (this.options.candleStyle.lineWidth / 2), sy);
                this.ctx.lineTo(sx - (this.options.candleStyle.lineWidth / 2), sy + sh);
                this.ctx.stroke();
                const cy = this.chartBottom - (Math.max(open,close) - this.minY) * this.yGapHeight;
                const ch = Math.abs(open - close) * this.yGapHeight || 1;
                this.ctx.fillStyle = bar;
                this.ctx.fillRect(x + this.options.candleStyle.margin, cy, this.xGap - (2 * this.options.candleStyle.margin), ch);
            }
            x += this.xGap;
        }
        this.ctx.restore();
        return;
    }
}
