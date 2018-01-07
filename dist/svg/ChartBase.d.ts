export interface Options {
    maxY?: number;
    minY?: number;
    decimalPlace?: number;
    tipTitles?: string;
    axisMaxY?: number;
    axisMinY?: number;
    direction?: "asc" | "desc";
    width?: number;
    height?: number;
    axisXLen?: number;
    axisYLen?: number;
    chartTitle?: string;
    style?: {
        paddingTop?: number;
        paddingLeft?: number;
        paddingRight?: number;
        paddingBottom?: number;
        axisXWidth?: number;
        axisYWidth?: number;
        background?: string;
        yScaleColor?: string;
        yScaleFont?: string;
        yScaleAlign?: string;
        yScaleXOffset?: number;
        yScaleYOffset?: number;
        xScaleColor?: string;
        xScaleFont?: string;
        xScaleAlign?: string;
        xScaleXOffset?: number;
        xScaleYOffset?: number;
        chartBackground?: string;
        xColor?: string;
        yColor?: string;
        frameColor?: string;
    };
}
export interface ChartData {
    xLabels: string[];
    values: any[];
}
export declare const InitialState: Options;
export default abstract class ChartBase {
    protected svg: SVGSVGElement;
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
    constructor(svg: SVGSVGElement, options?: Options);
    setOptions(options: Options): void;
    calcMinMax(values: any[]): {
        min: number;
        max: number;
    };
    setMinMax(): void;
    drawBackGround(): void;
    drawYscale(top: number, count: number): void;
    drawAxisX(): this;
    drawXScale(left: number, count: number): void;
    drawAxisY(): this;
    abstract setPaticularGraphVal(): void;
    draw(data: ChartData): void;
}
