function addColor(colorname, color) {
    const grid = document.getElementById("grid");
    let html = `<div class="message-2qnXI6 cozyMessage-3V1Y8y groupStart-23k01U wrapper-2a6GCs cozy-3raOZG zalgo-jN1Ica"><div class="contents-2mQqc9" role="document"><img src="https://canary.discord.com/assets/c09a43a372ba81e3018c3151d4ed4773.png" aria-hidden="true" class="avatar-1BDn8e" alt=" "><h2 class="header-23xsNx"><span class="headerText-3Uvj1Y"><div class="username-1A8OIy" role="button" tabindex="-1" data-focus-blocked-uid_4009="0">Discord User</div></span><span class="timestamp-3ZCmNB"><span aria-label="Today at 8:25 AM">Today at 8:25 AM</span></span></h2><div class="markup-2BOw-j messageContent-2qWWxC">Look, a message!</div></div></div>`;
    let define = document.createElement("span");
    let parent = document.createElement("div");
    define.innerText = colorname;
    parent.style.backgroundColor = color;
    parent.className = "text";
    parent.appendChild(define);
    grid.appendChild(parent);
    parent = document.createElement("div");
    parent.innerHTML = html;
    parent.className = "dark";
    parent.style.setProperty("--header-primary", color)
    grid.append(parent);
    parent = document.createElement("div");
    parent.innerHTML = html;
    parent.className = "light";
    parent.style.setProperty("--header-primary", color)
    grid.append(parent);
}

window.location.pathname.replace(/\/color\/?/g,"").split("/").map(color => color.split(":")).forEach(color => {
    if(color.length >= 2) {
        addColor(color[1], color[0]);
    } else {
        addColor(color[0], color[0])
    }
})