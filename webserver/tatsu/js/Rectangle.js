import Component from "./Component.js";
import {roundedRectanglePath} from "./DrawUtils.js";

export default class Rectangle extends Component {

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} borderRadius
     * @param {number} shadowBlur
     */
    constructor(x, y, width, height, borderRadius, shadowBlur) {
        super(x, y, width, height);
        /** @private */
        this.borderRadius = borderRadius;
        /** @private */
        this.shadowBlur = shadowBlur;
    }

    draw(ctx) {

        let previousBlur = ctx.shadowBlur;

        ctx.shadowBlur = this.shadowBlur;
        ctx.shadowColor = "white";

        ctx.beginPath();

        roundedRectanglePath(ctx, this.x, this.y, this.width, this.height, this.borderRadius);

        ctx.closePath();

        if (this.shadowBlur > 0) {
            let repeats = 4;
            for (let i = 0; i < repeats; i++) {
                ctx.shadowBlur += 0.25;
                ctx.fill();
            }
        } else {
            ctx.fill();
        }

        ctx.shadowColor = "rgba(0, 0, 0, 0)";
        ctx.shadowBlur = previousBlur;
    }

}
