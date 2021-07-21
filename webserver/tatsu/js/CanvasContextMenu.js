import Canvas from "./Canvas.js";
import Shapes from "./Shapes.js";


const contextDiv = document.getElementById("contextMenu");
let alreadySetup = false;
contextDiv.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    processClick(event);
});

document.addEventListener("click", event => {
    close();
})

function processClick(event) {
    if (event.target.hasAttribute("value")) {
        if (openPromise) {
            openPromise(Shapes[event.target.getAttribute("value")]);
            close();
        }
    }
}

function setup() {
    for (let name in Shapes) {
        const shape = Shapes[name];
        const canvas = new Canvas(shape.getWidth(), shape.getHeight());
        canvas.canvas.setAttribute("value", name);
        canvas.canvas.style.padding = "0 10px";
        canvas.getContext().fillStyle = "black";
        shape.drawInner(canvas.getContext(), 0, 0, 0)
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
export function show(x, y) {
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
