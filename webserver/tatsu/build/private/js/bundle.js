(function () {
    'use strict';

    class Canvas {

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
            this.ctx.clearRect(0, 0, this.width, this.height);
        }

        fill(color) {
            this.resetModifiers();
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, this.width, this.height);
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

    /**
     * @type {{global: {main: string, inner: string, outer: string, background: {x: number, y: number, backgroundColor: string , backgroundImage: CanvasImageSource, backgroundDim: number}, hitboxes: boolean, gradient: {enabled: boolean, direction: number, rainbow: boolean, points: Object<string, {value: number, color: string}>}}}}
     */
    const settings = {};

    /**
     * @class Shape
     */

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

    const contextDiv = document.getElementById("contextMenu");
    let alreadySetup = false;
    contextDiv.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        processClick(event);
    });

    document.addEventListener("click", event => {
        close();
    });

    function processClick(event) {
        if (event.target.hasAttribute("value")) {
            if (openPromise) {
                openPromise(shapes[event.target.getAttribute("value")]);
                close();
            }
        }
    }

    function setup() {
        for (let name in shapes) {
            const shape = shapes[name];
            const canvas = new Canvas(shape.getWidth(), shape.getHeight());
            canvas.canvas.setAttribute("value", name);
            canvas.canvas.style.padding = "0 10px";
            canvas.getContext().fillStyle = "black";
            shape.drawInner(canvas.getContext(), 0, 0, 0);
            shape.drawOuter(canvas.getContext(), 0, 0, 0);
            contextDiv.appendChild(canvas.canvas);
        }
    }

    /**
     * @type function(value: Shape) => void;
     */
    let openPromise;

    function close() {
        contextDiv.style.display = "none";
        if (openPromise) {
            openPromise(null);
        }
    }

    /**
     *
     * @param x
     * @param y
     * @return {Promise<void>}
     */
    function show(x, y) {
        return new Promise(resolve => {
            if (!alreadySetup) {
                setup();
                alreadySetup = true;
            }
            close();
            openPromise = resolve;
            contextDiv.style.display = "block";
            contextDiv.style.left = x + "px";
            contextDiv.style.top = y + "px";
        })
    }

    class LinkedList {

        constructor() {
            this.head = this.tail = null;
            this.sum = 0;
            this.count = 0;
            this.average = 0;
        }

        add(value) {
            const newNode = {previous: null, value: value};
            if (this.head) {
                this.head.previous = newNode;
            } else {
                this.tail = newNode;
            }
            this.head = newNode;
            this.sum += value;
            this.count++;
            if (this.count > 50) {
                this.remove();
            }
            this.calc();
        }

        remove() {
            this.sum -= this.tail.value;
            this.count--;
            this.tail = this.tail.previous;
            this.calc();
        }

        calc() {
            if (this.count === 0) {
                this.average = 0;
                return;
            }
            this.average = this.sum/this.count;
        }

    }

    /**
     *
     * @param {CanvasImageSource} overlay
     * @param {CanvasImageSource} source
     * @param {number} width
     * @param {number} height
     * @returns {HTMLCanvasElement}
     */
    function sourceMultiply(overlay, source, width, height) {

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

    function roundedRectanglePath(ctx, x, y, width, height, radius) {
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

    class Component {

        constructor(x, y, width, height) {
            /** @protected */
            this.x = x;
            /** @protected */
            this.y = y;
            /** @protected */
            this.width = width;
            /** @protected */
            this.height = height;
        }

        draw() {
            /* Implement custom drawing here */
        }

    }

    class Rectangle extends Component {

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

    class Plates {

        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.canvas = new Canvas(width, height);
            this.ctx = this.canvas.getContext();
            this.color = {};
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
            this.components.forEach(component => component.draw(this.ctx));
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

            roundedRectanglePath(this.ctx, 3, 3, this.width-6, this.height-6, 20);

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
                this.color.fill(settings.global.main);
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
            link.href = this.canvas.canvas.toDataURL("image/png");
            link.click();
        }

        async paint() {
            /* Implement custom painting here */
        }

    }

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

    async function repaintShapes() {
        await plates[active].repaint();
    }

    function repaintColor() {
        plates[active].repaintColor();
    }

    function download() {
        plates[active].download();
    }

    function rotate(x, y) {
        plates[active].rotateShapeAt(x, y);
    }

    function getShapeAt(x, y) {
        return plates[active].getShapeAt(x, y);
    }

    function addShape(x, y, shape) {
        plates[active].addShape(x, y, 0, shape);
    }

    function deleteShapeAt(x, y) {
        return plates[active].deleteShapeAt(x, y);
    }

    function moveShapeBy(selected, dx, dy) {
        return plates[active].moveShape(selected, dx, dy);
    }

    let currentNode = null;

    function load(index) {
        if (currentNode == null) {
            currentNode = document.getElementById("canvas");
        }
        active = index;
        currentNode.parentElement.replaceChild(plates[active].canvas.canvas, currentNode);
        currentNode = plates[active].canvas.canvas;
    }

    load(active);

    let dirty = true;
    let dirtyPaint = true;

    // Moving function into module scope for access with scrollbars
    let checkInput;

    /* Input events */{

        document.addEventListener("input", (event) => {
            checkInput(event.target);
        });

        document.addEventListener("change", (event) => {
            if (event.target.tagName === "SELECT") {
                checkInput(event.target);
            }
        });

        checkInput = (input) => {
            const attribute = input.getAttribute("setting");
            const setting = attribute ? attribute.split(".") : undefined;
            if (setting) {
                updateVariable(input, setting);
            }
        };

        function updateVariable(input, setting) {

            const group = makePath(setting);
            const last = setting[setting.length - 1];

            if (input.tagName === "SCROLLBAR") {
                input.type = "scrollbar";
            }

            switch (input.type) {
                case "file":
                    loadFile(input)
                        .then(img => {
                            group[last] = img;
                            if (input.hasAttribute("repaint")) {
                                dirtyPaint = true;
                            }
                            dirty = true;
                        })
                        .catch(err => {
                            group[last] = null;
                            dirty = true;
                        });
                    break;
                case "checkbox":
                    group[last] = input.checked;
                    if (input.hasAttribute("repaint")) {
                        dirtyPaint = true;
                    }
                    dirty = true;
                    break;
                case "scrollbar":
                    group[last] = input.getAttribute("value");
                    if (input.hasAttribute("repaint")) {
                        dirtyPaint = true;
                    }
                    dirty = true;
                    break;
                default:
                    if(input.hasAttribute("max") && parseInt(input.value) > input.getAttribute("max")) {
                        input.value = input.getAttribute("max");
                    } else if(input.hasAttribute("min") && parseInt(input.value) < input.getAttribute("min")) {
                        input.value = input.getAttribute("min");
                    }

                    group[last] = input.value;
                    if (input.hasAttribute("repaint")) {
                        dirtyPaint = true;
                    }
                    dirty = true;
                    break;
            }
        }

        function loadFile(input) {
            return new Promise(((resolve, reject) => {
                if (input.files && input.files[0]) {
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        const img = new Image();
                        img.src = e.target.result;
                        img.onload = () => {
                            resolve(img);
                        };
                    };

                    reader.readAsDataURL(input.files[0]);
                } else {
                    reject("No image present");
                }
            }))
        }

        document.querySelectorAll("[setting]").forEach(checkInput);
    }

    /* Button events */{
        document.addEventListener("click", (event) => {
            checkButton(event.target);
        });

        function checkButton(target) {
            if (target.hasAttribute("action")) {
                const action = target.getAttribute("action");
                runButton(target, action);
            }
        }

        let pointId = 0;
        const pointHTML = `
        <label for="gradientPercent%ID%">At %</label>
        <input id="gradientPercent%ID%" type="number" class="gradient-percent thin" min="0" max="100" setting="global.gradient.points.%ID%.value" value="%VALUE%" repaint>
        <input type="color" class="inlineBlock thin" setting="global.gradient.points.%ID%.color" value="#ffff00" repaint>
        <button class="inlineBlock thin" action="removeGradient" setting="global.gradient.points.%ID%">Remove</button>
    `;

        function runButton(target, action) {
            switch (action) {
                case "download":
                    download();
                    break;
                case "addGradient": {
                    const elementId = pointId++;
                    const setting = makePath(["global","gradient","points",elementId, 0]);
                    setting.color = "#ffff00";
                    const pointsWrapper = document.getElementById("gradientPoints");
                    const parentElement = document.createElement("div");
                    const maxPercent = Math.min(Math.max(...Array.from(document.getElementsByClassName("gradient-percent")).map(element => element.value), -1) + 1,100);
                    setting.value = maxPercent;
                    parentElement.innerHTML = pointHTML.replace(/%ID%/g, "" + elementId).replace(/%VALUE%/g, "" + maxPercent);
                    parentElement.className = "gradientRow";
                    pointsWrapper.appendChild(parentElement);
                    break;
                }
                case "removeGradient": {
                    const pointsWrapper = document.getElementById("gradientPoints");
                    pointsWrapper.removeChild(target.parentElement);
                    const attribute = target.getAttribute("setting");
                    const path = attribute ? attribute.split(".") : undefined;
                    if (path) {
                        const setting = makePath(path);
                        delete setting[path[path.length-1]];
                    }
                    dirty = true;
                    dirtyPaint = true;
                    break;
                }
                case "switch": {
                    const value = target.getAttribute("value");
                    load(value);
                    dirty = true;
                    dirtyPaint = true;
                }
            }
        }
    }

    /* Canvas events */{

        document.addEventListener("contextmenu", (event) => {
            if (event.target.tagName === "CANVAS") {
                event.preventDefault();
                event.stopPropagation();
                if (!deleteShapeAt(event.offsetX, event.offsetY)) {
                    show(event.pageX, event.pageY).then(shape => {
                        if (shape) {
                            addShape(event.offsetX, event.offsetY, shape);
                            dirty = true;
                        }
                    });
                } else {
                    dirty = true;
                }
            }
        });

        let mouseDown = false;
        let selected = null;
        let lastX = -1;
        let lastY = -1;

        document.addEventListener("touchstart", (event) => {
            const touches = event.touches;
            if (touches.length === 1) {
                const touch = touches[0];
                const target = touch.target;
                if (target.tagName === "CANVAS") {
                    const boundingClientRect = target.getBoundingClientRect();
                    let x = touch.pageX - boundingClientRect.x;
                    let y = touch.pageY - boundingClientRect.y;
                    mouseDownEvent(x, y);
                }
            }
        });

        document.addEventListener("mousedown", (event) => {
            if (event.target.tagName === "CANVAS") {
                mouseDownEvent(event.offsetX, event.offsetY);
            }
        });

        function mouseDownEvent(x, y) {
            selected = getShapeAt(x, y);
            if (typeof selected === "number") {
                mouseDown = true;
                lastX = x;
                lastY = y;
            }
        }

        document.addEventListener("touchmove", (event) => {
            const touches = event.touches;
            if (mouseDown && touches.length === 1) {
                const touch = touches[0];
                const target = touch.target;
                if (target.tagName === "CANVAS") {
                    const boundingClientRect = target.getBoundingClientRect();
                    let x = touch.pageX - boundingClientRect.x;
                    let y = touch.pageY - boundingClientRect.y;
                    mouseMoveEvent(x, y);
                }
            }
        });

        document.addEventListener("mousemove", (event) => {
            if (mouseDown && event.target.tagName === "CANVAS") {
                mouseMoveEvent(event.offsetX, event.offsetY);
            }
        });

        function mouseMoveEvent(x, y) {

            let dx = x - lastX;
            let dy = y - lastY;

            dirty = true;

            moveShapeBy(selected, dx, dy);

            lastX = x;
            lastY = y;
        }

        document.addEventListener("touchend", (event) => {
            mouseDown = false;
        });

        document.addEventListener("mouseup", (event) => {
            mouseDown = false;
        });

        document.addEventListener("dblclick", (event) => {
            if (event.target.tagName === "CANVAS") {
                event.preventDefault();
                event.stopPropagation();
                dblClickEvent(event.offsetX, event.offsetY);
            }
        });

        function dblClickEvent(x, y) {
            rotate(x, y);
            dirty = true;
        }

    }

    /* Scrollbar events */{

        document.addEventListener("mousedown", (event) => {
            const target = event.target;
            scrollbarMouseDown(target, event.pageX, event.pageY);
        });

        document.addEventListener("touchstart", (event) => {
            const touches = event.touches;
            if (touches.length === 1) {
                const touch = touches[0];
                const target = touch.target;
                scrollbarMouseDown(target, touch.pageX, touch.pageY);
            }
        });

        let scrollTarget = undefined;

        function scrollbarMouseDown(target, pageX, pageY) {
            if (target && target.tagName === "SCROLLBAR") {
                scrollTarget = target;
            }
        }

        document.addEventListener("mousemove", (event) => {
            if (scrollTarget) {
                scrollbarMouseMove(event.clientX, event.clientY);
            }
        });

        document.addEventListener("touchmove", (event) => {
            const touches = event.touches;
            if (scrollTarget && touches.length === 1) {
                const touch = touches[0];
                scrollbarMouseMove(touch.clientX, touch.clientY);
            }
        });

        const thumbHeight = 10;

        function scrollbarMouseMove(pageX, pageY) {

            const type = scrollTarget.getAttribute("type");
            const boundingClientRect = scrollTarget.getBoundingClientRect();
            const page = {x: pageX, y: pageY};

            const axis = type === "height" ? "y" : "x";

            let percent = (page[axis]-boundingClientRect[axis])/boundingClientRect[type];
            percent *= 100;
            percent -= thumbHeight/2;
            percent = Math.max(Math.min(percent, 100-thumbHeight), 0);

            scrollTarget.style.setProperty("--percent", percent + "%");
            scrollTarget.setAttribute("value", percent);
            checkInput(scrollTarget);
        }

        document.addEventListener("touchend", reset);
        document.addEventListener("mouseup", reset);

        function reset() {
            scrollTarget = undefined;
        }
    }

    function makePath(setting) {
        let current = settings;
        for (let i = 0; i < setting.length - 1; i++) {
            if (!current[setting[i]]) {
                current[setting[i]] = {};
            }
            current = current[setting[i]];
        }
        return current;
    }

    const drawTime = new LinkedList();

    async function draw() {

        if (!dirtyPaint && !dirty) {
            return;
        }

        const start = window.performance.now();

        if (dirtyPaint) {
            repaintColor();
        }

        if (dirty) {
            await repaintShapes();
        }

        const end = window.performance.now();
        drawTime.add(Math.round(end-start));
        document.getElementById("avgRenderTime").innerText = Math.round(drawTime.average) + "ms";

        dirtyPaint = false;
        dirty = false;

    }

    async function tick() {
        await draw();
        requestAnimationFrame(tick);
    }

    tick();

}());
