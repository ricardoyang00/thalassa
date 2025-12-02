class SgiUtils {
    static #seed = 0;

    static setSeed(seed) {
        this.#seed = seed;
    }

    static rand(from = 1, to = 0) {
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

    static randInt(from = 1, to = 0) {
        return Math.floor(this.rand(from, to));
    }

    static getCollidingObjects(a, b) {
        if (a.obj) {
            return b.obj
                ? a.box.intersectsBox(b.box) ? [{a: a.obj, b: b.obj}] : []
                : b.children.reduce((result, node) => result.concat(this.getCollidingObjects(a, node)), []);
        } else if (b.obj) {
            return a.children.reduce((result, node) => result.concat(this.getCollidingObjects(node, b)), []);
        }

        return a.children.reduce((resA, nodeA) => resA.concat(
            b.children.reduce((resB, nodeB) => resB.concat(
                this.getCollidingObjects(nodeA, nodeB)
            ), [])
        ), []);
    }
}

export { SgiUtils };
