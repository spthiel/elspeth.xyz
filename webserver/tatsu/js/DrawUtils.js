import Canvas from "./Canvas.js";

/**
 *
 * @param {CanvasImageSource} overlay
 * @param {CanvasImageSource} source
 * @param {number} width
 * @param {number} height
 * @returns {HTMLCanvasElement}
 */
export function sourceMultiply(overlay, source, width, height) {

    const sourceCanvas = new Canvas(width, height);
    sourceCanvas.drawImage(source, 0, 0, width, height);
    const overlayCanvas = new Canvas(width, height);
    overlayCanvas.drawImage(overlay, 0, 0, width, height);

    const sourceImageData = sourceCanvas.ctx.getImageData(0, 0, width, height);
    const overlayData = overlayCanvas.ctx.getImageData(0, 0, width, height).data;
    const sourceData = sourceImageData.data;
    for (let px = 0; px < sourceData.length; px += 4) {
        if (sourceData[px+3] > 0) {
            sourceData[px] = Math.floor(overlayData[px]*sourceData[px]/255.);
            sourceData[px+1] = Math.floor(overlayData[px+1]*sourceData[px+1]/255.);
            sourceData[px+2] = Math.floor(overlayData[px+2]*sourceData[px+2]/255.);
        }
    }
    sourceCanvas.ctx.putImageData(sourceImageData, 0, 0);
    return sourceCanvas.canvas;
}

export function sourceAtop(color, source, width, height) {

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(source, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = color;
    ctx.fillRect(0,0,width, height);
    return canvas;
}

export function roundedRectanglePath(ctx, x, y, width, height, radius) {
    ctx.moveTo(radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}
