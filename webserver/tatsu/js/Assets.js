
const cache = {};

/**
 *
 * @param {string} asset
 * @returns {Promise<CanvasImageSource>}
 */
export function get(asset) {
    asset = "./assets/" + asset;
    return new Promise(((resolve, reject) => {
        if (cache[asset]) {
            resolve(cache[asset]);
            return;
        }
        const image = new Image();
        image.src = asset;
        image.onload = () => {
            cache[asset] = image;
            resolve(image);
        }
        image.onerror = reject;
    }));
}

/**
 * Equal to Promise.all([get, get, ...])
 * @param {string} assets
 * @returns {Promise<CanvasImageSource[]>}
 */
export function all(...assets) {
    return Promise.all(assets.map(get));
}
