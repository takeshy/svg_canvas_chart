import SVGCandleChart from "./svg/CandleChart";
import CanvasCandleChart from "./canvas/CandleChart";
import { OHLCData } from "./ohlcData.js";

let firstLength:number;
let beforeX: number;;
let beforeY: number;
let chart;
let ratio = 1;
const originalQuantity = 20;
let index = OHLCData.values.length - originalQuantity;
let settings = {
    quantity: 0,
    scale: 0,
    width: 0,
    height: 0,
};

function adjust(idx){
    return Math.max(Math.min(idx, OHLCData.values.length - settings.quantity), 0);
}

function drawChart(){
    index = adjust(index);
    const data = {
        xLabels: OHLCData.xLabels.slice(index, index + settings.quantity).map((d,i)=> !(i % 10) ? d : null),
        values: OHLCData.values.slice(index, index + settings.quantity)
    }
    const type = Array.prototype.slice.call(document.getElementsByName("type")).filter((elem: HTMLInputElement)=> elem.checked)[0].value;
    const time = new Date().getTime();
    const area = <HTMLElement>document.getElementById("chart_area");
    if(type === "svg"){
        let svg = <SVGSVGElement><any>document.getElementById("candle_svg");
        if(svg){
            while (svg.firstChild) {
                svg.removeChild(svg.firstChild);
            }
        } else {
            area.innerHTML = "<svg id='candle_svg'></svg>";
            svg = <SVGSVGElement><any>document.getElementById("candle_svg");
        }
        chart = new SVGCandleChart(svg, { width: settings.width, height: settings.height });
        chart.draw(data);
    } else {
        let canvas = <HTMLCanvasElement>document.getElementById("candle_canvas");
        if(!canvas){
            area.innerHTML = "<canvas id='candle_canvas'></canvas>";
            canvas = <HTMLCanvasElement>document.getElementById("candle_canvas");
        }
        chart = new CanvasCandleChart(canvas, { width: settings.width, height: settings.height, scale: settings.scale });
        chart.draw(data);
    }
    document.getElementById("elapse_time").innerHTML = `${new Date().getTime() - time}milliseconds`;
}

function pinch(e){
    const t1 = e.targetTouches[0];
    const t2 = e.targetTouches[1];
    const length = Math.sqrt(Math.pow(t2.pageX - t1.pageX, 2) + Math.pow(t2.pageY - t1.pageY, 2))
    if(firstLength){
        settings.quantity = Math.max(settings.quantity + Math.round((firstLength - length) / 100), 1);
        (<HTMLInputElement>document.getElementById("quantity")).value = settings.quantity.toString();
        drawChart();
    }else{
        firstLength = length;
    }
}

function tStart({clientX, clientY}:{clientX:number, clientY:number}){
    beforeX = clientX;
    beforeY = clientY;
}

function tMove({clientX, clientY}:{clientX:number, clientY:number}){
    if(!beforeX){
        return false;
    }
    const diffX = clientX - beforeX;
    const diffY = clientY - beforeY;
    if(Math.abs(diffX) <= Math.abs(diffY)){
        return false;
    }
    if(diffX > 0){
        index -= Math.floor(diffX / 4);
    } else {
        index -= Math.ceil(diffX / 4);
    }
    beforeX = clientX;
    beforeY = clientY;
    drawChart();
    return true;
}

function tEnd(){
    beforeX = 0;
    beforeY = 0;
}

function updateSetting(e){
    const target = (<HTMLInputElement>e.target);
    settings[target.id] = parseInt((<HTMLInputElement>target).value);
    reflect();
}
function reflect(){
    const area = document.getElementById("scroll_area");
    area.style.width = settings.width.toString();
    area.style.height = settings.height.toString();
    drawChart();
}

window.addEventListener('load', () => {
    settings.width = window.innerWidth;
    (<HTMLInputElement>document.getElementById("width")).value = settings.width.toString();
    settings.height = window.innerHeight;
    (<HTMLInputElement>document.getElementById("height")).value = settings.height.toString();
    settings.scale = window.devicePixelRatio;
    (<HTMLInputElement>document.getElementById("scale")).value = settings.scale.toString();
    document.getElementById("devicePixelRatio").innerHTML = settings.scale.toString();
    settings.quantity = Math.floor(settings.width / 15);
    (<HTMLInputElement>document.getElementById("quantity")).value = settings.quantity.toString();
    [].forEach.call(document.querySelectorAll("input"), (elem)=> elem.addEventListener("change",(e)=> updateSetting(e)));
    document.getElementById("scroll_area").addEventListener("touchstart",(e)=>{
        firstLength = 0;
        tStart({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY});
    });
    document.getElementById("scroll_area").addEventListener("mousedown",(e)=>{
        tStart({ clientX: e.clientX, clientY: e.clientY});
    });
    document.getElementById("scroll_area").addEventListener("touchend",(e)=>{
        tEnd();
    });
    document.getElementById("scroll_area").addEventListener("mouseup",(e)=>{
        tEnd();
    });
    document.getElementById("scroll_area").addEventListener("touchmove",(e)=>{
        if(e.targetTouches && e.targetTouches.length === 2){ 
            e.preventDefault();
            e.stopPropagation();
            pinch(e);
            return; 
        }
        const result = tMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY});
        if(result){
            e.preventDefault();
            e.stopPropagation();
        }
    });
    document.getElementById("scroll_area").addEventListener("mousemove",(e)=>{
        const result = tMove({ clientX: e.clientX, clientY: e.clientY});
        if(result){
            e.preventDefault();
            e.stopPropagation();
        }
    });
    reflect();
});
