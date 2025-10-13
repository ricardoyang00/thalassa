class SgiUtils {
    static #seed = 0;

    static setSeed(seed) {
        this.#seed = seed;
    }

    static rand(from = 0, to = 1) {
        if (from > to) {
            const temp = from;
            from = to;
            to = temp;
        }

        // mulberry32
        let t = this.#seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return from + (to - from) * ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export { SgiUtils };
