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

    static collideTestCounter = 0;
    static getCollidingObjects(a, b, visited = new Set()) {
        this.collideTestCounter++;
        if (visited.has(b))
            return new Set();
        visited.add(b);

        if (a.obj) {
            return b.obj
                ? a.box.intersectsBox(b.box) ? new Set().add({a: a.obj, b: b.obj}) : new Set()
                : b.children.reduce((result, node) => result.union(this.getCollidingObjects(a, node, visited)), new Set());
        } else if (b.obj) {
            return a.children.reduce((result, node) => result.union(this.getCollidingObjects(node, b, visited)), new Set());
        }

        return a.children.reduce((resA, nodeA) => resA.union(
            b.children.reduce((resB, nodeB) => resB.union(
                nodeA.box.intersectsBox(nodeB.box)
                    ? this.getCollidingObjects(nodeA, nodeB, visited)
                    : new Set()
            ), new Set())
        ), new Set());
    }
}

export { SgiUtils };
