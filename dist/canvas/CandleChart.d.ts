import { Options as SuperOptions } from "./ChartBase";
import { ChartData as SuperChartData } from "./ChartBase";
import ChartBase from "./ChartBase";
export interface Options extends SuperOptions {
    candleStyle?: {
        upColor?: string;
        downColor?: string;
        evenColor?: string;
        upBarColor?: string;
        downBarColor?: string;
        margin?: number;
        lineWidth?: number;
    };
}
export interface ChartData extends SuperChartData {
    values: number[][];
}
export default class CandleChart extends ChartBase {
    protected options: Options;
    constructor(canvas: HTMLCanvasElement, options?: Options);
    calcMinMax(values: number[][]): {
        min: number;
        max: number;
    };
    setPaticularGraphVal(): void;
    draw(data: ChartData): void;
}
