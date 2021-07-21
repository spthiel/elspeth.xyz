import * as Assets from "./Assets.js";
import Canvas from "./Canvas.js";
import settings from "./configs.js";
import {sourceAtop, sourceMultiply} from "./DrawUtils.js";
import * as DrawUtils from "./DrawUtils.js";
import Component from "./Component.js";

export default class Plates {

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = new Canvas(width, height);
        this.ctx = this.canvas.getContext();
        this.color = {}
        this.color = new Canvas(width, height);
        /**
         * @private
         * @type {Array<Component>}
         */
        this.components = [];

        /**
         * @private
         * @type {{x: number, y: number, rotation: number, shape: Shape}[]}
         */
        this.shapes = [];
    }

    /**
     *
     * @param {Component} component
     */
    addComponent(component) {
        this.components.push(component);
    }

    adjustXY(x,y) {
        const scale = this.canvas.getScale();
        console.log(x, y, scale);
        return [x / scale, y / scale]
    }

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} rotation;
     * @param {Shape} shape
     */
    addShape(x, y, rotation, shape) {
        [x,y] = this.adjustXY(x, y);
        this.shapes.push({x: x, y: y, rotation: rotation%4, shape: shape});
    }

    getName() {
        return this.constructor.name;
    }

    async repaint() {
        this.canvas.resetModifiers();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.paintShapes();
        this.paintBorder();
        this.paintComponents();
        await this.paint();
        this.ctx.globalCompositeOperation = "copy";
        this.ctx.drawImage(sourceMultiply(this.color.canvas, this.canvas.canvas, this.width, this.height), 0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = "source-over";
        this.paintBackground();
    }

    paintShapes() {
        this.ctx.filter = "grayscale(100%)";

        for (const {x, y, rotation, shape} of this.shapes) {

            this.ctx.fillStyle = settings.global.inner;
            shape.drawInner(this.ctx, x, y, rotation);
            this.ctx.fillStyle = settings.global.outer;
            shape.drawOuter(this.ctx, x, y, rotation);

        }
        // this.ctx.drawImage(sourceAtop(settings.global.inner, inner, this.width, this.height), 0, 0, this.width, this.height);
        // this.ctx.drawImage(sourceAtop(settings.global.outer, outer, this.width, this.height), 0, 0, this.width, this.height);
        this.ctx.filter = "none";
    }

    paintComponents() {
        this.components.forEach(component => component.draw(this.ctx))
    }

    paintBorder() {

        this.canvas.resetModifiers();
        this.ctx.fillStyle = "white";
        this.ctx.shadowBlur = 3;
        this.ctx.shadowColor = "white";
        this.ctx.beginPath();

        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.width, 0);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.lineTo(0, 0);

        DrawUtils.roundedRectanglePath(this.ctx, 3, 3, this.width-6, this.height-6, 20);

        this.ctx.closePath();
        let repeats = 4;
        for(let i=0;i<repeats;i++) {
            // increase the size of blur
            this.ctx.shadowBlur += 0.25;
            this.ctx.fill("evenodd");
        }
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "rgba(0, 0, 0, 0)";

    }

    repaintColor() {

        if (settings.global.gradient.enabled) {

            const direction = settings.global.gradient.direction;
            let x0 = direction > 0 && direction < 5;
            let y0 = direction >> 2;
            let x1 = direction < 2 ||direction > 5;
            let y1 = direction < 3 || direction > 6;

            x0 *= this.color.getWidth();
            x1 *= this.color.getWidth();
            y0 *= this.color.getHeight();
            y1 *= this.color.getHeight();

            const gradient = this.color.ctx.createLinearGradient(x0, y0, x1, y1);
            if (settings.global.gradient.rainbow) {

                for (let i = 0; i <= 3600; i++) {
                    gradient.addColorStop(i/3600., "hsl(" + i/10. + ", 100%, 50%)");
                }

            } else {
                const points = settings.global.gradient.points;
                for (const key in points) {
                    // noinspection JSUnfilteredForInLoop
                    const k = points[key];
                    gradient.addColorStop(k.value/100., k.color);
                }
            }

            this.color.ctx.fillStyle = gradient;
            this.color.ctx.fillRect(0, 0, this.color.getWidth(), this.color.getHeight());
        } else {
            this.color.fill(settings.global.main)
        }
    }

    paintBackground() {
        this.ctx.globalCompositeOperation = "destination-over";
        if (settings.global.background.backgroundDim > 0) {
            this.ctx.fillStyle = "black";
            this.ctx.globalAlpha = settings.global.background.backgroundDim / 100;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.globalAlpha = 1;
        }
        if (settings.global.background.backgroundImage) {
            const background = settings.global.background.backgroundImage;
            let height = background.height;
            let width = background.width;
            let scale = Math.min(width/this.width, height/this.height);
            width /= scale;
            height /= scale;
            const overflowX = width-this.width;
            const overflowY = height-this.height;

            this.ctx.drawImage(background, -overflowX * settings.global.background.x/100, -overflowY * settings.global.background.y/100, width, height);
        }

        this.ctx.fillStyle = settings.global.background.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = "source-over";
    }

    rotateShapeAt(x, y) {
        [x,y] = this.adjustXY(x, y);
        for (let i = 0; i < this.shapes.length; i++){
            let {x: sx, y: sy, shape} = this.shapes[i];
            if(shape.isContained(sx, sy, x, y)) {
                this.shapes[i].rotation = (this.shapes[i].rotation+1)%4;
                return;
            }
        }
    }

    deleteShapeAt(x, y) {
        [x,y] = this.adjustXY(x, y);
        for (let i = 0; i < this.shapes.length; i++){
            let {x: sx, y: sy, shape} = this.shapes[i];
            if(shape.isContained(sx, sy, x, y)) {
                this.shapes.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    getShapeAt(x, y) {
        [x,y] = this.adjustXY(x, y);
        for (let i = 0; i < this.shapes.length; i++){
            let {x: sx, y: sy, shape} = this.shapes[i];
            if(shape.isContained(sx, sy, x, y)) {
                return i;
            }
        }
        return null;
    }

    moveShape(index, dx, dy) {
        [dx,dy] = this.adjustXY(dx, dy);
        this.shapes[index].x += dx;
        this.shapes[index].y += dy;
    }

    download() {
        const link = document.createElement('a');
        link.download = this.getName() + ".png";
        link.href = this.canvas.canvas.toDataURL("image/png")
        link.click();
    }

    async paint() {
        /* Implement custom painting here */
    }

}
