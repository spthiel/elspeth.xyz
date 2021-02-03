function addRow() {
    let wrapper = document.getElementById("heaps");
    let count = wrapper.childElementCount + 2;
    let newHeap = document.createElement("div");
    newHeap.className = "setting";

    let label = document.createElement("label");
    label.innerText = "Reihe " + count;
    label.setAttribute("for", "heap" + count + "count");
    let heapcount = document.createElement("input");
    heapcount.setAttribute("id", "heap" + count + "count");
    heapcount.type = "number";
    heapcount.min = "1";
    heapcount.max = "15";
    heapcount.value = "1";
    heapcount.addEventListener("change", (event) => change(count, parseInt(heapcount.value)))

    newHeap.appendChild(label);
    newHeap.appendChild(heapcount);
    wrapper.appendChild(newHeap);

    addHeap(count);

    document.getElementById("removeheap").removeAttribute("disabled");
    game.reset();
}

function addHeap(index) {

    let wrapper = document.getElementById("board");

    let newHeap = document.createElement("div");
    newHeap.className = "heap";
    newHeap.setAttribute("id", "heap" + index);

    let newMatch = document.createElement("div");
    newMatch.className = "match unlit";

    newHeap.appendChild(newMatch);
    wrapper.appendChild(newHeap);

}

function removeRow() {
    let wrapper = document.getElementById("heaps");
    let count = wrapper.childElementCount;
    wrapper.removeChild(wrapper.lastElementChild);
    if (count <= 1) {
        document.getElementById("removeheap").setAttribute("disabled", "")
    }
    removeHeap();

    game.reset();
}

function removeHeap() {
    let wrapper = document.getElementById("board");
    wrapper.removeChild(wrapper.lastElementChild);
}

function change(heap, count) {
    let wrapper = document.getElementById("heap" + heap);
    if (!wrapper) {
        return;
    }

    while (wrapper.childElementCount < count) {
        let newMatch = document.createElement("div");
        newMatch.className = "match unlit";
        wrapper.appendChild(newMatch);
    }

    while (wrapper.childElementCount > count) {
        wrapper.removeChild(wrapper.lastElementChild);
    }

    game.reset();
}

function getAllHeaps() {
    let elements = document.getElementsByClassName("heap");
    let map = Array.from(elements).map(element => [element.getAttribute("id").replace("heap", ""), element.getElementsByClassName("unlit").length])
    let out = [];
    for (let x of map) {
        out[x[0]-1] = x[1];
    }
    return out;
}

function getBestMove() {

    let heaps = getAllHeaps();

    let isMisere = document.forms[0].gametype.value === "Misere";
    let countNon01 = heaps.filter(x => x > 1).length;
    let isNearEndgame = countNon01 <= 1;

    let movesLeft = 0;

    if (isMisere && isNearEndgame) {
        movesLeft = heaps.filter(x => x > 0).length;


        let isOdd = movesLeft % 2 === 1;
        let sizeofMax = Math.max(...heaps);
        let indexOfMax = heaps.indexOf(sizeofMax);

        if (sizeofMax === 1 && isOdd) {
            return getRandomMove(heaps);
        }

        return [indexOfMax, sizeofMax - isOdd]
    }

    let nimSum = heaps.reduce((x, y) => x ^ y, 0);
    if (nimSum === 0) {
        return getRandomMove(heaps);
    }

    for (let index in heaps) {
        let heap = heaps[index];
        let targetSize = heap ^ nimSum
        if (targetSize < heap) {
            let amountToRemove = heap - targetSize
            return [index, amountToRemove]
        }
    }
}

function getRandomMove(heaps) {
    let nonZero = heaps.filter(x => x > 0);
    let random = Math.random() * (nonZero.length - 1) | 0;
    let index = 0;
    for (let heap of heaps) {
        if (heap > 0) {
            random--;
        }
        if (random < 0) {
            break;
        }
        index++;
    }
    return [index, (Math.random() * (heaps[index] - 1) | 0) + 1]
}
