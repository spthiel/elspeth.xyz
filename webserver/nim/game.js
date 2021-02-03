const game = {

    listeners: [],
    currentPlayer: 1,
    wait: false,

    reset: function () {
        Array.from(document.getElementsByClassName("lit")).forEach(element => {
            element.classList.remove("lit");
            element.classList.add("unlit")
        });
        Array.from(document.getElementsByClassName("select")).forEach(element => {
            element.classList.remove("select");
        });
        document.getElementById("board").setAttribute("overlay", "Press Start");
        game.clearListeners();
        game.currentPlayer = 1;
    },

    start: function () {
        game.wait = false;
        game.reset();
        game.turn(true);

        game.addListener(document.getElementById("board"), 'click', game.click);
        document.getElementById("board").removeAttribute("overlay");
    },

    clearListeners: function () {

        while (game.listeners.length > 0) {
            let listener = game.listeners.pop();
            listener.element.removeEventListener(listener.type, listener.listener);
        }

    },

    end: function () {
        let winner = game.currentPlayer ^ document.forms[0].gametype.value === "Misere";
        let isBot = winner ^ document.forms[0].botfirst.checked;
        let message = isBot ? "Computer hat gewonnen!" : "Spieler " + winner + " hat gewonnen!";
        document.getElementById("board")
            .setAttribute("overlay", message);
    },

    turn: function (first) {

        if (!first && document.getElementsByClassName("select").length === 0) {
            return false;
        }

        Array.from(document.getElementsByClassName("select")).forEach(element => {
            element.classList.remove("select");
            element.classList.remove("unlit");
            element.classList.add("lit");

            if (document.getElementsByClassName("unlit").length === 0) {
                game.end();
                game.wait = true;
            }

        });

        game.currentPlayer ^= 1;

        if (game.wait) {
            return false;
        }
        if (document.forms[0].botactive.checked && game.currentPlayer ^ document.forms[0].botfirst.checked) {
            game.wait = true;
            let [heap, count] = getBestMove();
            heap = 1 + parseInt(heap);
            let wrapper = document.getElementById("heap" + heap);
            let unlitCount = wrapper.getElementsByClassName("unlit").length;
            let index = unlitCount - count;
            game.select(heap, index)
                .then(() => new Promise((resolve => setTimeout(resolve, 500))))
                .then(() => game.wait = false)
                .then(() => game.turn());
        }
        return true;
    },

    click: (event) => {
        if (game.wait) {
            return false;
        }
        game.wait = true;
        let target = event.target;
        if (target.classList.contains("unlit")) {
            let child = target;
            let i = 0;
            while ((child = child.previousElementSibling) != null) {
                i++;
            }

            Array.from(document.getElementsByClassName("select")).forEach(element => {
                element.classList.remove("select");
            });
            let parent = target.parentElement;
            let id = parent.getAttribute("id");
            game.select(id.replace("heap", ""), i)
                .then(() => game.wait = false);
        } else {
            game.wait = false;
        }

    },

    select: function (heap, count) {

        let element = document.getElementById("heap" + heap).children[count];
        if (!element || !element.classList || element.classList.contains("lit")) {
            return Promise.resolve();
        }
        element.classList.add("select");
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                game.select(heap, count + 1)
                    .then(resolve)
                    .catch(reject);
            }, 200);
        })
    },

    addListener: function (node, type, listener) {
        node.addEventListener(type, listener);
        game.listeners.push({element: node, type: type, listener: listener});
    }
}
