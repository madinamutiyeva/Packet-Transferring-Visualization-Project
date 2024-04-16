let data = { vertices: [], edges: [] };
let dataToSend = { vertices: [], edges: [] };

const area = document.getElementById('graph-area');
const sourceDropdown = document.getElementById('sourceVertex');
const targetDropdown = document.getElementById('targetVertex');

function addVertices() {
    const vCount = parseInt(document.getElementById('v-count').value);
    if (isNaN(vCount) || vCount < 1)
        return;

    area.innerHTML = '';
    sourceDropdown.innerHTML = '';
    targetDropdown.innerHTML = '';
    data = { vertices: [], edges: [] };

    for (let i = 0; i < vCount; i++) {
        // set each vertex to DOM
        const vertex = document.createElement('div');
        vertex.id = `vertex-${i}`;
        vertex.className = 'vertex';
        vertex.style.left = (10 + 40 * (i % 24)) + 'px';
        vertex.style.top = (10 + 40 * parseInt(i/24)) + 'px';
        vertex.textContent = i;
        area.appendChild(vertex);

        // add each vertex to dataset
        data.vertices[i] = vertex;

        // update dropdowns
        const option = document.createElement('option');
        option.text = i;
        option.value = i;

        sourceDropdown.append(option.cloneNode(true));
        targetDropdown.append(option);

        // add moving behavior
        var isDragging, currentVertex;

        vertex.addEventListener('mousedown', (event) => {
            isDragging = true;
            const rect = vertex.getBoundingClientRect();
            offsetX = event.clientX - (rect.left + rect.width / 2) + 20;
            offsetY = event.clientY - (rect.top + rect.height / 2) + 65;
            currentVertex = vertex;
            currentVertex.style.zIndex = '3';
            currentVertex.style.cursor = 'grabbing';
        });
    }

    document.addEventListener('mousemove', (event) => {
        if (currentVertex && isDragging) {
            const x = event.clientX - offsetX;
            const y = event.clientY - offsetY;
            currentVertex.style.left = x + 'px';
            currentVertex.style.top = y + 'px';

            data.edges.forEach(function(edge) {
                if (
                    edge.sourceBody.id != currentVertex.id &&
                    edge.targetBody.id != currentVertex.id
                ) return;
                
                const sourceRect = edge.sourceBody.getBoundingClientRect();
                const targetRect = edge.targetBody.getBoundingClientRect();
                const areaRect = area.getBoundingClientRect();

                // Calculate edge width and height
                let distance = Math.sqrt((sourceRect.left - targetRect.left) ** 2 + (sourceRect.top - targetRect.top) ** 2);
                let angle = Math.atan2(targetRect.top - sourceRect.top, targetRect.left - sourceRect.left);
            
                // Calculate edge position
                edge.body.style.left = `${sourceRect.left + sourceRect.width/2 - areaRect.left}px`;
                edge.body.style.top = `${sourceRect.top + sourceRect.height/2 - areaRect.top}px`;
                edge.body.style.width = `${distance}px`;
                edge.body.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
                edge.body.textContent = parseInt(distance * 10) / 10;
            });
        }
    });

    document.addEventListener('mouseup', () => {
        if (currentVertex && isDragging) {
            isDragging = false;
            currentVertex.style.cursor = 'grab';
            currentVertex.style.zIndex = '2';
            currentVertex = null;
        }
    });
}

function addEdge() {
    const sourceID = document.getElementById('sourceVertex').value;
    const targetID = document.getElementById('targetVertex').value;

    if (
        sourceID == '' || targetID == '' ||
        data.edges.find(e => e.source === sourceID && e.target === targetID) || data.edges.find(e => e.source == targetID && e.target == sourceID)
    ) return;

    const edge = document.createElement('div');
    edge.id = `edge-${sourceID}-${targetID}`;
    edge.className = 'edge';

    const sourceBody = data.vertices[sourceID];
    const targetBody = data.vertices[targetID];
    const sourceRect = sourceBody.getBoundingClientRect();
    const targetRect = targetBody.getBoundingClientRect();
    const areaRect = area.getBoundingClientRect();

    // Calculate edge width and height
    let distance = Math.sqrt((sourceRect.left - targetRect.left) ** 2 + (sourceRect.top - targetRect.top) ** 2);
    let angle = Math.atan2(targetRect.top - sourceRect.top, targetRect.left - sourceRect.left);

    // Calculate edge position
    edge.style.left = `${sourceRect.left + sourceRect.width/2 - areaRect.left}px`;
    edge.style.top = `${sourceRect.top + sourceRect.height/2 - areaRect.top}px`;
    edge.style.width = `${distance}px`;
    edge.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
    edge.textContent = parseInt(distance * 10) / 10;

    area.appendChild(edge);
    
    data.edges.push({
        source: sourceID,
        target: targetID,
        body: edge,
        sourceBody: sourceBody,
        targetBody: targetBody
    });
}


function clearGraph() {
    area.innerHTML = '';
    sourceDropdown.innerHTML = '';
    targetDropdown.innerHTML = '';
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