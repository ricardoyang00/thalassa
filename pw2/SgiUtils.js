class SgiUtils {
    static #seed = 0;

    static #mulberry32(seed) {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    static setSeed(seed) {
        this.#seed = seed;
    }

    static rand(from, to) {
        if (from > to) {
            const temp = from;
            from = to;
            to = temp;
        }
        return this.#mulberry32(this.#seed++) * (to - from) + from;
    }
}

export { SgiUtils };
