export default class Canvas {

    constructor(width, height) {
        /** @type {HTMLCanvasElement} */
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext("2d");
        /** @private */
        this.width = width;
        /** @private */
        this.height = height;
    }

    getScale() {
        return this.canvas.getBoundingClientRect().width/this.width;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }

    fill(color) {
        this.resetModifiers()
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height)
    }

    resetModifiers() {
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.filter = "none";
    }

    getWidth() {
        return this.width;
    }

    setWidth(value) {
        this.width = value;
        this.canvas.width = value;
    }

    getHeight() {
        return this.height;
    }

    setHeight(value) {
        this.height = value;
        this.canvas.height = value;
    }

    getContext() {
        return this.ctx;
    }

    /**
     * @type {
     *  (function(image: CanvasImageSource, dx: number, dy: number) : void) &
     *  (function(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number) : void) &
     *  (function(image: CanvasImageSource, sx:number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) : void)
     * }
     */
    drawImage(image, ...args){
        this.ctx.drawImage(image, ...args);
    }
}
