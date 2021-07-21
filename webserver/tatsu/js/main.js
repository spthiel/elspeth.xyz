import * as ContextMenu from "./CanvasContextMenu.js";
import settings from "./configs.js";
import LinkedList from "./LinkedList.js";
import * as View from "./Views.js";

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
        const attribute = input.getAttribute("setting")
        const setting = attribute ? attribute.split(".") : undefined;
        if (setting) {
            updateVariable(input, setting);
        }
    }

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
                    }
                };

                reader.readAsDataURL(input.files[0]);
            } else {
                reject("No image present")
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
                View.download();
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
                const attribute = target.getAttribute("setting")
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
                View.load(value);
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
            if (!View.deleteShapeAt(event.offsetX, event.offsetY)) {
                ContextMenu.show(event.pageX, event.pageY).then(shape => {
                    if (shape) {
                        View.addShape(event.offsetX, event.offsetY, shape);
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
    })

    document.addEventListener("mousedown", (event) => {
        if (event.target.tagName === "CANVAS") {
            mouseDownEvent(event.offsetX, event.offsetY);
        }
    });

    function mouseDownEvent(x, y) {
        selected = View.getShapeAt(x, y);
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
    })

    document.addEventListener("mousemove", (event) => {
        if (mouseDown && event.target.tagName === "CANVAS") {
            mouseMoveEvent(event.offsetX, event.offsetY);
        }
    });

    function mouseMoveEvent(x, y) {

        let dx = x - lastX;
        let dy = y - lastY;

        dirty = true;

        View.moveShapeBy(selected, dx, dy);

        lastX = x;
        lastY = y;
    }

    document.addEventListener("touchend", (event) => {
        mouseDown = false;
    })

    document.addEventListener("mouseup", (event) => {
        mouseDown = false;
    })

    document.addEventListener("dblclick", (event) => {
        if (event.target.tagName === "CANVAS") {
            event.preventDefault();
            event.stopPropagation();
            dblClickEvent(event.offsetX, event.offsetY);
        }
    });

    function dblClickEvent(x, y) {
        View.rotate(x, y);
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
    })

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

function hexToRGB(h) {
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (h.length === 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

        // 6 digits
    } else if (h.length === 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    return [r-0 , g-0, b-0];
}

const drawTime = new LinkedList();

async function draw() {

    if (!dirtyPaint && !dirty) {
        return;
    }

    const start = window.performance.now();

    if (dirtyPaint) {
        View.repaintColor();
    }

    if (dirty) {
        await View.repaintShapes();
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
