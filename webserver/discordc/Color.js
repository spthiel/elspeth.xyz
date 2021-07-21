const fs = require("fs");
const {Canvas, Image} = require('canvas');

let image;

fs.readFile(__dirname + '/defaultavatar.png', ((err, data) => {

    image = new Image();
    image.src = data;

    console.log(image);
}))

function genImage(colors) {

    let blockHeight = 48;
    let height = blockHeight * colors.length;
    let width = 900;
    let canvas = new Canvas(width, height);
    let thirds = width/3;

    let ctx = canvas.getContext("2d");
    ctx.font = "16px Arial";

    for (let i = 0; i < colors.length; i++) {
        let color = colors[i];
        let hex = color[0];
        let name = color[1] || color[0];

        let rgb = +("0x" + hex);
        let r = rgb >> 16;
        let g = rgb >> 8 & 255;
        let b = rgb & 255;


        let isBright = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
        ) > 127.5;

        ctx.fillStyle = "#" + hex;
        ctx.fillRect(0, blockHeight * i, thirds, blockHeight);
        ctx.fillStyle = "#2f3136";
        ctx.fillRect(thirds, blockHeight * i, thirds, blockHeight);
        ctx.fillStyle = "#f2f3f4";
        ctx.fillRect(thirds*2, blockHeight * i, thirds, blockHeight);
        drawAvatar(ctx, thirds + 15, 4 + blockHeight * i);
        drawAvatar(ctx, thirds*2 + 15, 4 + blockHeight * i);

        ctx.fillStyle = isBright ? "black" : "white";
        ctx.textAlign = "center"
        ctx.textBaseline = "middle";
        ctx.fillText(name, thirds/2, blockHeight * i + blockHeight/2, thirds);

        drawMessage(ctx, thirds + 72, blockHeight*i, hex, false);
        drawMessage(ctx, thirds * 2 + 72, blockHeight*i, hex, true);

    }

    return canvas.createPNGStream();
}

function drawMessage(ctx, x, y, color, light, maxWidth) {

    let textColor = light ? "#2e3338" : "#dcddde";
    let timeStamp = light ? "#747f8d" : "#72767d";

    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#" + color;
    ctx.fillText("Discord User", x, y + 21, maxWidth);
    let text = ctx.measureText('Discord User');
    ctx.font = "12px Arial";
    ctx.fillStyle = timeStamp;
    ctx.fillText("Today at 8:25 AM", x + text.width + 8 - 1, y + 21 - 2);
    ctx.font = "16px Arial";
    ctx.fillStyle = textColor;
    ctx.fillText("Look, a message!", x + 1, y + 21 + 22);

}

function drawAvatar(ctx, x, y) {

    ctx.save();

    ctx.strokeStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(x+20, y+20, 20, 0, 2 * Math.PI, false);
    ctx.clip();
    ctx.drawImage(image, x, y, 40, 40);

    ctx.restore();
}

module.exports = {
    genImage: genImage
};
