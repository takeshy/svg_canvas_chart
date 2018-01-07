export interface Options {
    maxY?:number;
    minY?:number;
    decimalPlace?:number,
    scale?:number,
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
    scale: 1,
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
    protected canvas:HTMLCanvasElement;
    protected ctx:CanvasRenderingContext2D;
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

    constructor(canvas: HTMLCanvasElement, options: Options = InitialState){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.options = { ...InitialState };
        this.setOptions(options);
    }
    setOptions(options: Options){
        this.options = { ...this.options,  ...options };
        if(this.options.width){
            this.width = this.options.width;
            this.canvas.setAttribute('width', this.width.toString());
        } else {
            this.width = parseInt(this.canvas.getAttribute("width"));
        }
        if(this.options.height){
            this.height = this.options.height;
            this.canvas.setAttribute('height', this.height.toString());
        } else {
            this.height = parseInt(this.canvas.getAttribute("height"));
        }
        if(this.options.scale && this.options.scale !== 1){
          this.canvas.setAttribute('width', (this.width * this.options.scale).toString());
          this.canvas.setAttribute('height', (this.height * this.options.scale).toString());
          this.canvas.style.width = this.width.toString();
          this.canvas.style.height = this.height.toString();
          this.ctx.scale(this.options.scale, this.options.scale);
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
        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.fillStyle = this.options.style.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.fillStyle = this.options.style.chartBackground;
        this.ctx.fillRect(this.options.style.paddingLeft,this.options.style.paddingTop, this.chartWidth, this.chartHeight);

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.options.style.frameColor;
        this.ctx.moveTo(0,0)
        this.ctx.lineTo(this.width, 0)
        this.ctx.lineTo(this.width, this.height)
        this.ctx.lineTo(0,this.height)
        this.ctx.lineTo(0,0)
        this.ctx.stroke()

        this.ctx.restore();
    }

    drawYscale(top: number, count: number){
        this.ctx.save();
        const xOffset = this.options.style.yScaleXOffset || this.width;
        const yScaleStr = (this.yMinScale + this.yGapValue * count).toLocaleString();
        if( count === 0 || (yScaleStr == "0" && (this.yGapValue === 0 && count !== 0))){
          return;
        }
        this.ctx.font = this.options.style.yScaleFont;
        this.ctx.fillStyle = this.options.style.yScaleColor;
        this.ctx.textAlign = this.options.style.yScaleAlign;
        this.ctx.fillText(yScaleStr, xOffset , top + this.options.style.yScaleYOffset);
        this.ctx.restore();
    }

    drawAxisX(){
        for (let top = this.chartBottom, count = 0;top >= this.chartTop; top -= this.yGap, count++) {
          this.ctx.beginPath();
          this.ctx.lineWidth = this.options.style.axisXWidth;
          this.ctx.strokeStyle = this.options.style.xColor;
          this.ctx.moveTo(this.chartLeft, top);
          this.ctx.lineTo(this.chartRight, top);
          this.ctx.stroke();
          this.drawYscale(top, count);
        }
        return this;
    }

    drawXScale(left: number, count:number){
        this.ctx.save();
        this.ctx.font = this.options.style.xScaleFont;
        this.ctx.textAlign = this.options.style.xScaleAlign;
        this.ctx.fillStyle = this.options.style.xScaleColor;
        this.ctx.fillText( this.data.xLabels[count], left, this.chartBottom + this.options.style.xScaleYOffset);
        this.ctx.restore();
    }

    drawAxisY(){
        for ( let left = this.xStartPos, count = 0; left <= this.width; left += this.xGap, count++ ){
            if(this.data.xLabels && this.data.xLabels[count]){
                this.ctx.beginPath();
                this.ctx.lineWidth  = this.options.style.axisYWidth;
                this.ctx.strokeStyle = this.options.style.yColor;
                this.ctx.moveTo(left, 0);
                this.ctx.lineTo(left, this.chartBottom);
                this.ctx.stroke();
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
        this.ctx.translate(0, 0);
        this.drawBackGround();
        this.drawAxisX();
        this.drawAxisY();
        return;
    }
}
