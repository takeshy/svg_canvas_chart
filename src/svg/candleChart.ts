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
    constructor(svg: SVGSVGElement, options: Options = InitialState){
        super(svg, options);
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
        let x = this.chartLeft;
        for(let i = 0; i < this.data.values.length; i++ ){
            const d = this.data.values[i];
            if(d){
                const o = d[0];
                const h = d[1];
                const l = d[2];
                const c = d[3];
                let style, bar;
                if(c > o) {
                    style = this.options.candleStyle.upColor;
                    bar = this.options.candleStyle.upBarColor;
                }else if(c == o){
                    style = this.options.candleStyle.evenColor;
                    bar = this.options.candleStyle.evenColor;
                } else {
                    style = this.options.candleStyle.downColor;
                    bar = this.options.candleStyle.downBarColor;
                }
                const sx = x + Math.ceil(this.xGap / 2);
                const sy = this.chartBottom - (h - this.minY) * this.yGapHeight;
                const sh = (h - l) * this.yGapHeight || 1;

                const line:SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg","line");
                line.setAttribute("stroke", style);
                line.setAttribute("stroke-width", this.options.candleStyle.lineWidth.toString());
                line.setAttribute("x1", (sx - (this.options.candleStyle.lineWidth / 2)).toString());
                line.setAttribute("x2", (sx - (this.options.candleStyle.lineWidth / 2)).toString());
                line.setAttribute("y1", sy.toString());
                line.setAttribute("y2", (sy + sh).toString());
                this.svg.appendChild(line);

                const cy = this.chartBottom - (Math.max(o,c) - this.minY) * this.yGapHeight;
                const ch = Math.abs(o - c) * this.yGapHeight || 1;
                const rect:SVGRectElement = document.createElementNS("http://www.w3.org/2000/svg","rect");
                rect.setAttribute("x", (x + (this.options.candleStyle.margin)).toString());
                rect.setAttribute("y", cy.toString());
                rect.setAttribute("width", (this.xGap - (2 * this.options.candleStyle.margin)).toString());
                rect.setAttribute("height", ch.toString());
                rect.setAttribute("fill", bar);
                this.svg.appendChild(rect);
            }
            x += this.xGap;
        }
    }
}
