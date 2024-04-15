class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    swap(index1, index2) {
        const temp = this.heap[index1];
        this.heap[index1] = this.heap[index2];
        this.heap[index2] = temp;
    }

    getParentIndex(index) {
        return Math.floor((index - 1) / 2);
    }

    enqueue(element, priority) {
        this.heap.push({ element, priority });
        this.heapifyUp();
    }

    heapifyUp() {
        let currentIndex = this.heap.length - 1;
        while (currentIndex > 0) {
            const parentIndex = this.getParentIndex(currentIndex);
            if (this.heap[currentIndex].priority < this.heap[parentIndex].priority) {
                this.swap(currentIndex, parentIndex);
                currentIndex = parentIndex;
            } else {
                break;
            }
        }
    }

    dequeue() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop();
        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown();
        return root;
    }

    heapifyDown() {
        let currentIndex = 0;
        while (true) {
            const leftChildIndex = 2 * currentIndex + 1;
            const rightChildIndex = 2 * currentIndex + 2;
            let nextIndex = currentIndex;
            if (leftChildIndex < this.heap.length && this.heap[leftChildIndex].priority < this.heap[nextIndex].priority) {
                nextIndex = leftChildIndex;
            }
            if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].priority < this.heap[nextIndex].priority) {
                nextIndex = rightChildIndex;
            }
            if (nextIndex !== currentIndex) {
                this.swap(currentIndex, nextIndex);
                currentIndex = nextIndex;
            } else {
                break;
            }
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

function dijkstra(graph, source, target) {
    const queue = new PriorityQueue();
    const distances = {};
    const previous = {};

    for (const vertex in graph) {
        distances[vertex] = vertex === source ? 0 : Infinity;
        queue.enqueue(vertex, distances[vertex]);
        previous[vertex] = null;
    }

    while (!queue.isEmpty()) {
        const { element: currentVertex } = queue.dequeue();

        if (currentVertex === target) {
            return getPath(previous, target);
        }

        for (const neighbor in graph[currentVertex]) {
            const weight = graph[currentVertex][neighbor];
            const distanceToNeighbor = distances[currentVertex] + weight;

            if (distanceToNeighbor < distances[neighbor]) {
                distances[neighbor] = distanceToNeighbor;
                previous[neighbor] = currentVertex;
                queue.enqueue(neighbor, distanceToNeighbor);
            }
        }
    }

    return null;
}

function getPath(previous, target) {
    const path = [];
    let vertex = target;
    while (vertex !== null) {
        path.unshift(vertex);
        vertex = previous[vertex];
    }
    return path;
}

module.exports = dijkstra;