/**
 * @class Shape
 */
import settings from "./configs.js";

class Shape {

    constructor() {

        /**
         * @private
         * @type {{x: number, y: number}[]}
         */
        this.innerPixel = [];

        /**
         * @private
         * @type {{x: number, y: number}[]}
         */
        this.outerPixel = [];

        /**
         * @private
         * @type {number}
         */
        this.width = 0;
        /**
         * @private
         * @type {number}
         */
        this.height = 0;

        /**
         * @private
         * @constant
         * @type {number}
         */
        this.scale = 4;
    }

    /**
     *
     * @param {number} x X position of the pixel > 0
     * @param {number} y
     * @param {boolean} outer
     * @return {Shape}
     */
    addPixel(x, y, outer = false) {
        console.assert(x >= 0 && y >= 0, "X and Y aren't greater 0");
        if (outer) {
            this.outerPixel.push({x: x, y: y});
        } else {
            this.innerPixel.push({x: x, y: y});
        }
        this.width = Math.max(x+1, this.width);
        this.height = Math.max(y+1, this.height);
        return this;
    }

    getWidth() {
        return this.width * this.scale;
    }

    getHeight() {
        return this.height * this.scale;
    }

    isContained(dx, dy, x, y) {
        let ax = x-dx;
        let ay = y-dy;
        return ax >= 0 && ay >= 0 && ax <= this.width * this.scale && ay <= this.height * this.scale;
    }

    drawInner(ctx, x, y, rotation) {
        this.draw(ctx, x, y, rotation, "innerPixel");
    }

    drawOuter(ctx, x, y, rotation) {

        if (settings.global.hitboxes) {
            ctx.strokeStyle = "white";
            ctx.strokeWidth = 1;
            ctx.strokeRect(x, y, this.width * this.scale, this.height * this.scale);
            ctx.strokeWidth = 0;
            ctx.strokeStyle = "rgba(0,0,0,0)";
        }

        this.draw(ctx, x, y, rotation,"outerPixel");
    }

    draw(ctx, x, y, rotation, pixels) {

        const toDraw = this[pixels];

        for (let {x: px, y: py} of toDraw) {
            for (let r = 0; r < rotation; r++) {
                let offset = r%2 === 1 ? this.height : this.width;
                offset--;
                let store = px;
                px = offset-py;
                py = store;
            }

            ctx.fillRect(x + px*this.scale, y + py*this.scale, this.scale, this.scale);
        }
    }

    offsetCenter(x, y) {
        return {x: x - this.width*2, y: y - this.height*2};
    }

}

/**
 * @type Object<string, Shape>
 */
const shapes = {
    SQUARE: new Shape()
        .addPixel(0, 0)
        .addPixel(1, 1)
        .addPixel(1, 0, true)
        .addPixel(0, 1, true),

    CROSS_SMALL: new Shape()
        .addPixel(0, 0)
        .addPixel(2, 0)
        .addPixel(1, 1)
        .addPixel(0, 2)
        .addPixel(2, 2),

    CROSS_LARGE: new Shape()
        .addPixel(0, 0)
        .addPixel(4, 0)
        .addPixel(2, 2)
        .addPixel(0, 4)
        .addPixel(4, 4)
        .addPixel(1, 1, true)
        .addPixel(1, 3, true)
        .addPixel(3, 1, true)
        .addPixel(3, 3, true),

    CIRCLE_SMALL: new Shape()
        .addPixel(1, 0)
        .addPixel(3, 1)
        .addPixel(0, 2)
        .addPixel(1, 3)
        .addPixel(2, 0, true)
        .addPixel(0, 1, true)
        .addPixel(3, 2, true)
        .addPixel(2, 3, true),

    CIRCLE_LARGE: new Shape()
        .addPixel(1, 0)
        .addPixel(4, 0)
        .addPixel(0, 1)
        .addPixel(5, 1)
        .addPixel(0, 4)
        .addPixel(5, 4)
        .addPixel(1, 5)
        .addPixel(4, 5)
        .addPixel(2, 0, true)
        .addPixel(3, 0, true)
        .addPixel(0, 2, true)
        .addPixel(5, 2, true)
        .addPixel(0, 3, true)
        .addPixel(5, 3, true)
        .addPixel(2, 5, true)
        .addPixel(3, 5, true)
        .addPixel(1, 1, true)
        .addPixel(4, 1, true)
        .addPixel(1, 4, true)
        .addPixel(4, 4, true),

    TRIANGLE: new Shape()
        .addPixel(1, 1)
        .addPixel(1, 2)
        .addPixel(1, 3)
        .addPixel(1, 4)
        .addPixel(1, 5)
        .addPixel(1, 6)
        .addPixel(1, 7)
        .addPixel(2, 2)
        .addPixel(2, 6)
        .addPixel(3, 2)
        .addPixel(3, 6)
        .addPixel(4, 3)
        .addPixel(4, 5)
        .addPixel(5, 3)
        .addPixel(5, 5)
        .addPixel(6, 4)
        .addPixel(0, 0, true)
        .addPixel(0, 1, true)
        .addPixel(0, 2, true)
        .addPixel(0, 3, true)
        .addPixel(0, 4, true)
        .addPixel(0, 5, true)
        .addPixel(0, 6, true)
        .addPixel(0, 7, true)
        .addPixel(0, 8, true)
        .addPixel(1, 0, true)
        .addPixel(1, 8, true)
        .addPixel(2, 1, true)
        .addPixel(2, 7, true)
        .addPixel(3, 1, true)
        .addPixel(3, 7, true)
        .addPixel(4, 2, true)
        .addPixel(4, 6, true)
        .addPixel(5, 2, true)
        .addPixel(5, 6, true)
        .addPixel(6, 3, true)
        .addPixel(6, 5, true)
        .addPixel(7, 3, true)
        .addPixel(7, 5, true)
        .addPixel(7, 4, true)
        .addPixel(8, 4, true)
};

export default shapes;
