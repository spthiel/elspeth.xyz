import settings from "./configs.js";
import {sourceAtop, sourceMultiply} from "./DrawUtils.js";
import Rectangle from "./Rectangle.js";
import Plates from "./Plates.js";
import * as Assets from "./Assets.js";
import Shapes from "./Shapes.js";


class Profile extends Plates {

    constructor() {
        super(600, 600);
        this.addComponent(new Rectangle(20, 154, 104, 104, 20, 3));
        this.addComponent(new Rectangle(144, 164, 48, 32, 10, 3));
        this.addComponent(new Rectangle(20, 278, 352, 40, 10, 3));
        this.addComponent(new Rectangle(392, 278, 188, 40, 10, 3));
    }

    async paint() {
    }
}

class Rank extends Plates {

    constructor() {
        super(740, 260);
        this.addComponent(new Rectangle(28, 0, 160, 260, 0, 3));
        this.addComponent(new Rectangle(270, 110, 450, 32, 10, 3));
        this.addComponent(new Rectangle(206, 38, 48, 32, 10, 3));
    }

    async paint() {
    }
}

class LevelUp extends Plates {

    constructor() {
        super(740, 128);
        this.addComponent(new Rectangle(312, 24, 48, 32, 10, 3));
        this.addComponent(new Rectangle(620, 10, 108, 108, 18, 3));
    }

    async paint() {
    }
}

class Wallet extends Plates {

    constructor() {
        super(480, 300);
        this.addComponent(new Rectangle(30, 28, 155, 52, 2, 3));
        this.addComponent(new Rectangle(363, 126, 91, 60, 14, 4));
    }

    async paint() {
    }
}


let active = 0;

const plates = [
    new Profile(),
    new Rank(),
    new LevelUp(),
    new Wallet()
];

export async function repaintShapes() {
    await plates[active].repaint();
}

export function repaintColor() {
    plates[active].repaintColor()
}

export function download() {
    plates[active].download();
}

export function rotate(x, y) {
    plates[active].rotateShapeAt(x, y);
}

export function getShapeAt(x, y) {
    return plates[active].getShapeAt(x, y);
}

export function addShape(x, y, shape) {
    plates[active].addShape(x, y, 0, shape);
}

export function deleteShapeAt(x, y) {
    return plates[active].deleteShapeAt(x, y);
}

export function moveShapeBy(selected, dx, dy) {
    return plates[active].moveShape(selected, dx, dy);
}

let currentNode = null;

export function load(index) {
    if (currentNode == null) {
        currentNode = document.getElementById("canvas")
    }
    active = index;
    currentNode.parentElement.replaceChild(plates[active].canvas.canvas, currentNode)
    currentNode = plates[active].canvas.canvas;
}

load(active);

export function getNames() {
    return plates.map(shape => shape.constructor.name);
}
