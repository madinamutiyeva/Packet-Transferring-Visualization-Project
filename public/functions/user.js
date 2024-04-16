let latestGraphData;


document.addEventListener('DOMContentLoaded', function () {
    const receiveGraphBtn = document.getElementById('receive-graph-btn');
    if (receiveGraphBtn) {
        receiveGraphBtn.addEventListener('click', receiveGraph);
    } else {
        console.error("Element with ID 'receive-graph-btn' not found");
    }
});
function receiveGraph() {
    fetch('http://localhost:4000/get-graph')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to receive graph data');
            }
            return response.json();
        })
        .then(dataArray => {
            latestGraphData = dataArray[dataArray.length - 1];
            drawGraph(latestGraphData);
        })
        .catch(error => {
            console.error('Error receiving graph data:', error);
        });
}

async function receiveShortestPath(requestData) {
    try {
        const response = await fetch('http://localhost:4000/shortest-path', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch shortest path');
        }

        const shortestPath = await response.json();
        localStorage.setItem('shortestPath', JSON.stringify(shortestPath));
        //visualizeShortestPath(shortestPath);
    } catch (error) {
        console.error('Error:', error);
    }
}

function visualizeShortestPath(shortestPath) {
    let index = 0;

    function clearRedEdges() {
        const edges = document.querySelectorAll('.edge');
        edges.forEach(edgeElement => {
            edgeElement.style.backgroundColor = ''; // Reset background color
        });
    }

    function highlightEdge() {
        if (index < shortestPath.length - 1) {
            const source = shortestPath[index];
            const target = shortestPath[index + 1];
            const edgeId = `edge-${Math.min(source, target)}-${Math.max(source, target)}`;
            const edgeElement = document.getElementById(edgeId);

            if (edgeElement) {
                edgeElement.style.backgroundColor = 'red';
            }

            index++;
            setTimeout(highlightEdge, 1000);
        }
    }
    clearRedEdges();
    highlightEdge();
}


function createWeightElement(edgeData, latestGraphData) {
    const weightElement = document.createElement('div');
    weightElement.className = 'weight';
    weightElement.textContent = parseInt(edgeData.body.width.slice(0, -2) * 10) / 10;

    weightElement.style.position = 'absolute';

    const weightLeft = (latestGraphData.vertices[edgeData.source].offsetLeft + latestGraphData.vertices[edgeData.target].offsetLeft) / 2;
    const weightTop = (latestGraphData.vertices[edgeData.source].offsetTop + latestGraphData.vertices[edgeData.target].offsetTop) / 2;

    weightElement.style.left = `${weightLeft}px`;
    weightElement.style.top = `${weightTop}px`;

    return weightElement;
}

function createVertexElement(index, vertexData) {
    const vertexElement = document.createElement('div');
    vertexElement.className = 'vertex';
    vertexElement.style.left = vertexData.offsetLeft + 'px';
    vertexElement.style.top = vertexData.offsetTop + 'px';
    vertexElement.textContent = index;
    return vertexElement;
}

function createEdgeElement(edgeData) {
    const edgeElement = document.createElement('div');
    edgeElement.className = 'edge';
    edgeElement.style.left = edgeData.body.left;
    edgeElement.style.top = edgeData.body.top;
    edgeElement.style.width = edgeData.body.width;
    edgeElement.style.transform = edgeData.body.transform;
    return edgeElement;
}

function populateSenderReceiverOptions(verticesCount) {
    const senderSelect = document.getElementById('sender');
    const receiverSelect = document.getElementById('receiver');

    senderSelect.innerHTML = '';
    receiverSelect.innerHTML = '';

    for (let i = 0; i < verticesCount; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        senderSelect.appendChild(option.cloneNode(true));
        receiverSelect.appendChild(option.cloneNode(true));
    }
}

function drawGraph(latestGraphData) {
    const graphContainer = document.getElementById('graph');
    graphContainer.innerHTML = '';


    latestGraphData.vertices.forEach((vertexData, index) => {
        const vertexElement = createVertexElement(index, vertexData);
        graphContainer.appendChild(vertexElement);
    });

    latestGraphData.edges.forEach(edgeData => {
        const source = edgeData.source;
        const target = edgeData.target;

        const edgeId = `edge-${Math.min(source, target)}-${Math.max(source, target)}`;
        const edgeElement = createEdgeElement(edgeData);
        edgeElement.setAttribute('id', edgeId);
        graphContainer.appendChild(edgeElement);
        const weightElement = createWeightElement(edgeData, latestGraphData);
        graphContainer.appendChild(weightElement);
    });

    populateSenderReceiverOptions(latestGraphData.vertices.length);

}

function transformDataToGraph(graphData) {
    const graph = {};

    graphData.edges.forEach(edge => {
        const sourceVertex = parseInt(edge.source);
        const targetVertex = parseInt(edge.target);
        const weight = parseFloat(edge.body.width);

        if (!graph[sourceVertex]) {
            graph[sourceVertex] = {};
        }

        if (!graph[targetVertex]) {
            graph[targetVertex] = {};
        }

        graph[sourceVertex][targetVertex] = weight;
        graph[targetVertex][sourceVertex] = weight;
    });

    return graph;
}

function graphTraversal() {
    const sender = document.getElementById('sender').value;
    const receiver = document.getElementById('receiver').value;
    const requestData = {
        graph: transformDataToGraph(latestGraphData),
        source: sender,
        target: receiver
    };
    receiveShortestPath(requestData);
}

document.getElementById('message-form').addEventListener('submit', function (event) {
    event.preventDefault();
    graphTraversal();
});