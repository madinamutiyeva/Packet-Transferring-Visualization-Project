let dataToSend = { vertices: [], edges: [] };

let data = { vertices: [], edges: [] };

const area = document.getElementById('graph-area');
const areaRect = area.getBoundingClientRect();
const sourceInput = document.getElementById('sourceVertex');
const targetInput = document.getElementById('targetVertex');

let isDragging = false;
let currentVertex;

const dragging = (event) => {
    if (currentVertex && isDragging) {
        currentVertex.style.left = `${event.clientX - offsetX - areaRect.left}px`;
        currentVertex.style.top = `${event.clientY - offsetY - areaRect.top}px`;

        data.edges.forEach(edge => {
            if (
                edge.sourceBody.id != currentVertex.id &&
                edge.targetBody.id != currentVertex.id
            ) return;
            
            updateEdgePosition(
                edge.body,
                edge.sourceBody.getBoundingClientRect(),
                edge.targetBody.getBoundingClientRect()
            );
        });
    }
}

const stopDragging = () => {
    if (currentVertex && isDragging) {
        isDragging = false;
        currentVertex.style.cursor = 'grab';
        currentVertex.style.zIndex = '2';
        checkVerticesPosition(currentVertex);
        currentVertex = null;
    }
}

function addVertices() {
    const vCount = parseInt(document.getElementById('v-count').value);
    if (isNaN(vCount) || vCount < 1)
        return;

    area.innerHTML = '';
    sourceInput.setAttribute('max', vCount);
    targetInput.innerHTML = '';
    data = { vertices: [], edges: [] };

    for (let i = 0; i < vCount; i++) {
        // set each vertex to DOM
        const vertex = document.createElement('div');
        vertex.id = `vertex-${i}`;
        vertex.className = 'vertex';
        vertex.style.left = (10 + 40 * (i % 12)) + 'px';
        vertex.style.top = (10 + 40 * parseInt(i/12)) + 'px';
        vertex.textContent = i;
        area.appendChild(vertex);

        // add each vertex to dataset
        data.vertices[i] = vertex;

        // add moving behavior
        vertex.addEventListener('mousedown', (event) => {
            isDragging = true;
            currentVertex = vertex;
            const vRect = currentVertex.getBoundingClientRect();
            offsetX = event.clientX - vRect.left;
            offsetY = event.clientY - vRect.top;
            currentVertex.style.zIndex = '3';
            currentVertex.style.cursor = 'grabbing';
        });
    }
    document.addEventListener('mousemove', dragging);
    document.addEventListener('mouseup', stopDragging);
}

function addEdge() {
    const sourceID = sourceInput.value;
    const targetID = targetInput.value;
    const vCount = data.vertices.length;

    if (
        sourceID == '' || targetID == '' ||
        sourceID < 0 || sourceID >= vCount ||
        targetID < 0 || targetID >= vCount ||
        data.edges.find(e => e.source === sourceID && e.target === targetID)
    ) return;

    const edge = document.createElement('div');
    edge.id = `edge-${sourceID}-${targetID}`;
    edge.className = 'edge';

    const sourceBody = data.vertices[sourceID];
    const targetBody = data.vertices[targetID];

    updateEdgePosition(
        edge,
        sourceBody.getBoundingClientRect(),
        targetBody.getBoundingClientRect()
    );
    area.appendChild(edge);
    
    data.edges.push({
        source: sourceID,
        target: targetID,
        body: edge,
        sourceBody: sourceBody,
        targetBody: targetBody
    });
}

function checkVerticesPosition(vertex) {
    const vRect = vertex.getBoundingClientRect();
    if (
        areaRect.left <= vRect.left && vRect.left <= areaRect.right - vRect.width &&
        areaRect.top <= vRect.top && vRect.top <= areaRect.bottom - vRect.height
    ) return;

    if (vRect.left < areaRect.left)
        vertex.style.left = '0px';
    else if (vRect.left > areaRect.right - vRect.width)
        vertex.style.left = `${areaRect.width - vRect.width}px`;

        if (vRect.top < areaRect.top)
            vertex.style.top = '0px';
        else if (vRect.top > areaRect.bottom - vRect.height)
            vertex.style.top = `${areaRect.height - vRect.height}px`;
    
        data.edges.forEach(edge => {
            if (vertex == edge.sourceBody || vertex == edge.targetBody)
                updateEdgePosition(
                    edge.body,
                    edge.sourceBody.getBoundingClientRect(),
                    edge.targetBody.getBoundingClientRect()
                );
        });
    }
    
    function updateEdgePosition(edgeBody, sourceRect, targetRect) {
        let distance = Math.sqrt((sourceRect.left - targetRect.left) ** 2 + (sourceRect.top - targetRect.top) ** 2);
        let angle = Math.atan2(targetRect.top - sourceRect.top, targetRect.left - sourceRect.left);
    
        edgeBody.style.left = `${sourceRect.left + sourceRect.width/2 - areaRect.left}px`;
        edgeBody.style.top = `${sourceRect.top + sourceRect.height/2 - areaRect.top}px`;
        edgeBody.style.width = `${distance}px`;
        edgeBody.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
        edgeBody.textContent = distance < 100 ? parseInt(distance) : parseInt(distance * 10) / 10;
    }
    
    function submit() {
        document.removeEventListener('mousemove', dragging);
        document.removeEventListener('mouseup', stopDragging);
        document.querySelectorAll('.build').forEach(el => el.remove());
        document.querySelectorAll('.send').forEach(el => el.style.display = 'flex');
        data.vertices.forEach(vertex => vertex.style.cursor = 'default');
        data.edges.forEach(edge => edge.distance = parseInt(edge.body.textContent.replace('px', '')));
    }

function clearGraph() {
    area.innerHTML = '';
    sourceInput.innerHTML = '';
    targetInput.innerHTML = '';
    data = { vertices: [], edges: [] };
    dataToSend = { vertices: [], edges: [] };
}

function removeEdge() {
    const sourceID = document.getElementById('sourceVertex').value;
    const targetID = document.getElementById('targetVertex').value;

    const index = data.edges.findIndex(e => e.source === sourceID && e.target === targetID);
    if (index !== -1) {
        const edge = data.edges[index];
        edge.body.remove();
        data.edges.splice(index, 1);
    }
}

function submit() {
    dataToSend = { edges: [], vertices: [] };
    for (let i = 0; i < data.edges.length; i++) {
        let currentEdge = data.edges[i];
        dataToSend.edges.push( {
            source: currentEdge.source,
            target: currentEdge.target,
            body: {
                left: currentEdge.body.style.left,
                top: currentEdge.body.style.top,
                width: currentEdge.body.style.width,
                transform: currentEdge.body.style.transform
            }
        } );
    }
    for (let i = 0; i < data.vertices.length; i++) {
        let currentVertex = data.vertices[i];
        dataToSend.vertices.push( {
            offsetLeft: currentVertex.offsetLeft,
            offsetTop: currentVertex.offsetTop
        } );
    }

    fetch('http://localhost:4000/save-graph', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (response.ok) {
            console.log('Graph data submitted successfully.');
        } else {
            console.error('Failed to submit graph data.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}