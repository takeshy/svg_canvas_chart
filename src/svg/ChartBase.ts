export interface Options {
    maxY?:number;
    minY?:number;
    decimalPlace?:number,
    tipTitles?:string;
    axisMaxY?:number;
    axisMinY?:number;
    direction?: "asc" | "desc";
    width?:number;
    height?:number;
    axisXLen?: number;
    axisYLen?: number;
    chartTitle?: string;
    style?: {
        paddingTop?:number;
        paddingLeft?:number;
        paddingRight?:number;
        paddingBottom?:number;
        axisXWidth?:number;
        axisYWidth?:number;
        background?:string;
        yScaleColor?:string;
        yScaleFont?:string;
        yScaleAlign?:string;
        yScaleXOffset?:number;
        yScaleYOffset?:number;
        xScaleColor?:string;
        xScaleFont?:string;
        xScaleAlign?:string;
        xScaleXOffset?:number;
        xScaleYOffset?:number;
        chartBackground?:string;
        xColor?:string;
        yColor?:string;
        frameColor?:string;
    }
};

export interface ChartData {
    xLabels: string[];
    values: any[];
};

export const InitialState:Options = {
    maxY: 0,
    minY: 0,
    decimalPlace: 3,
    tipTitles: "",
    axisMaxY: 0,
    axisMinY: 0,
    direction: "desc",
    width: 0,
    height: 0,
    axisXLen: 10,
    axisYLen: 4,
    style:{
        paddingTop:         10,
        paddingBottom:      25,
        paddingLeft:        0,
        paddingRight:       40,
        axisXWidth:         1,
        axisYWidth:         1,
        background:         "#BBF",
        yScaleColor:        "#000",
        yScaleFont:         "100 10px 'Arial'",
        yScaleAlign:        "right",
        yScaleXOffset:      0,
        yScaleYOffset:      4,
        xScaleColor:        "#000",
        xScaleFont:         "100 10px 'Arial'",
        xScaleAlign:        "center",
        xScaleXOffset:      0,
        xScaleYOffset:      18,
        chartBackground:    "#FEFEFE",
        frameColor:         "rgba(0,0,0,0.3)",
        xColor:             "rgba(180,180,180,0.3)",
        yColor:             "rgba(180,180,180,0.3)",
    }
};
export default abstract class ChartBase {
    protected svg:SVGSVGElement;
    protected data: ChartData;
    protected options: Options;
    protected width: number;
    protected height: number;
    protected top: number;
    protected bottom: number;
    protected left: number;
    protected right: number;
    protected chartHeight: number;
    protected chartWidth: number;
    protected chartTop: number;
    protected chartBottom: number;
    protected chartLeft: number;
    protected chartRight: number;
    protected xGap: number;
    protected yGap: number;
    protected maxY: number;
    protected minY: number;
    protected yGapValue: number;
    protected yGapHeight: number;
    protected yMinScale: number;
    protected xStartPos: number;

    constructor(svg: SVGSVGElement, options: Options = InitialState){
        this.svg = svg;
        this.options = { ...InitialState };
        this.setOptions(options);
    }
    setOptions(options: Options){
        this.options = { ...this.options,  ...options };
        if(this.options.width){
            this.width = this.options.width;
            this.svg.setAttribute('width', this.width.toString());
        } else {
            this.width = parseInt(this.svg.getAttribute("width"));
        }
        if(this.options.height){
            this.height = this.options.height;
            this.svg.setAttribute('height', this.height.toString());
        } else {
            this.height = parseInt(this.svg.getAttribute("height"));
        }
        this.chartHeight = this.height - this.options.style.paddingTop - this.options.style.paddingBottom;
        this.yGap = this.chartHeight / this.options.axisXLen;
        this.chartTop = this.options.style.paddingTop;
        this.chartBottom = this.height - this.options.style.paddingBottom;
        this.chartRight = this.width - this.options.style.paddingLeft - this.options.style.paddingRight;
        this.chartLeft = this.options.style.paddingLeft;
        this.chartWidth = this.chartRight - this.chartLeft;
    }
    calcMinMax(values: any[]):{min: number, max:number}{
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        values.forEach((val)=>{
          if(val != null){
            max = max < val ? val : max;
            min = min > val ? val : min;
          }
        });
        if(min == Number.MAX_VALUE && max == Number.MIN_VALUE){
          min = 0;
          max = 0;
        }
        return {min, max};
    }
    setMinMax(){
        if(this.options.axisMaxY && this.options.axisMinY){
            this.maxY = this.options.axisMaxY;
            this.minY = this.options.axisMinY;
            return;
        }
        const m = this.calcMinMax(this.data.values)
        let modify = false;
        if(!this.maxY || m.max > this.maxY){
            modify = true;
            this.maxY = m.max;
        }
        if(!this.minY || m.min < this.minY){
            modify = true;
            this.minY = m.min;
        }
        if(modify){
            const bias =  Math.pow(10, this.options.decimalPlace)
            const diff = (this.maxY * bias) - (this.minY * bias);
            const mod = diff % this.options.axisXLen;
            if(mod || diff === 0){
                let surplus = this.options.axisXLen - mod;
                if(surplus >= (this.options.axisXLen / 2)){
                    const half = Math.floor(surplus / 2);
                    this.maxY = parseFloat(((this.maxY * bias + half) / bias).toFixed(this.options.decimalPlace));
                    surplus -= half;
                }
                this.minY = parseFloat(((this.minY * bias - surplus) / bias).toFixed(this.options.decimalPlace));
            }
        }
        this.yGapValue = (this.maxY - this.minY) / this.options.axisXLen;
        this.yGapHeight = this.maxY - this.minY == 0 ? 0 : this.chartHeight / (this.maxY - this.minY);
        this.yMinScale = this.minY;
    }
    
    drawBackGround(){
        const bg:SVGRectElement = document.createElementNS("http://www.w3.org/2000/svg","rect");
        bg.setAttribute("x", "0");
        bg.setAttribute("y", "0");
        bg.setAttribute("width", this.width.toString());
        bg.setAttribute("height", this.height.toString());
        bg.setAttribute("stroke", this.options.style.frameColor);
        bg.setAttribute("fill", this.options.style.background);
        this.svg.appendChild(bg);
        const chartBg:SVGRectElement = document.createElementNS("http://www.w3.org/2000/svg","rect");
        chartBg.setAttribute("x", this.options.style.paddingLeft.toString());
        chartBg.setAttribute("y", this.options.style.paddingTop.toString());
        chartBg.setAttribute("width", this.chartWidth.toString());
        chartBg.setAttribute("height", this.chartHeight.toString());
        chartBg.setAttribute("fill", this.options.style.chartBackground.toString());
        this.svg.appendChild(chartBg);
    }

    drawYscale(top: number, count: number){
        const xOffset = this.options.style.yScaleXOffset || this.chartWidth;
        const yScaleStr = (this.yMinScale + this.yGapValue * count).toLocaleString();
        if( count === 0 || (yScaleStr == "0" && (this.yGapValue === 0 && count !== 0))){
          return;
        }
        const text = document.createElementNS("http://www.w3.org/2000/svg","text");
        text.style.font = this.options.style.yScaleFont;
        text.setAttribute("fill", this.options.style.yScaleColor);
        text.setAttribute("x", xOffset.toString());
        text.setAttribute("y", (top + this.options.style.yScaleYOffset).toString());
        text.textContent = yScaleStr;
        this.svg.appendChild(text);
    }

    drawAxisX(){
        for (let top = this.chartBottom, count = 0;top >= this.chartTop; top -= this.yGap, count++) {
            const line:SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg","line");
            line.setAttribute("stroke", this.options.style.xColor);
            line.setAttribute("stroke-width", this.options.style.axisXWidth.toString());
            line.setAttribute("x1", this.chartLeft.toString());
            line.setAttribute("x2", this.chartRight.toString());
            line.setAttribute("y1", top.toString());
            line.setAttribute("y2", top.toString());
            this.svg.appendChild(line);
            this.drawYscale(top, count);
        }
        return this;
    }

    drawXScale(left: number, count:number){
        const text = document.createElementNS("http://www.w3.org/2000/svg","text");
        text.textContent = this.data.xLabels[count];
        text.style.font = this.options.style.xScaleFont;
        text.setAttribute("fill", this.options.style.xScaleColor);
        text.setAttribute("y", (this.chartBottom + this.options.style.xScaleYOffset).toString());
        this.svg.appendChild(text);
        text.setAttribute("x", (left - text.textLength.baseVal.value / 2).toString());
    }

    drawAxisY(){
        for ( let left = this.xStartPos, count = 0; left <= this.width; left += this.xGap, count++ ){
            if(this.data.xLabels && this.data.xLabels[count]){
                const line:SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg","line");
                line.setAttribute("stroke-width", this.options.style.axisYWidth.toString());
                line.setAttribute("stroke", this.options.style.yColor);
                line.setAttribute("x1", left.toString());
                line.setAttribute("x2", left.toString());
                line.setAttribute("y1", "0");
                line.setAttribute("y2", this.chartBottom.toString());
                this.svg.appendChild(line);
                this.drawXScale(left, count);
            }
        }
        return this;
    }

    abstract setPaticularGraphVal():void;

    draw(data: ChartData){
        this.data = data;
        this.setPaticularGraphVal();
        this.setMinMax();
        this.drawBackGround();
        this.drawAxisX();
        this.drawAxisY();
        return;
    }
}
