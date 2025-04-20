// Graph representation and visualization
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const modeIndicator = document.getElementById('modeIndicator');

// Buttons
const addNodeBtn = document.getElementById('addNodeBtn');
const addEdgeBtn = document.getElementById('addEdgeBtn');
const clearBtn = document.getElementById('clearBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const speedSlider = document.getElementById('speedSlider');

// Results elements
const colorCount = document.getElementById('colorCount');
const solutionCount = document.getElementById('solutionCount');
const stepCount = document.getElementById('stepCount');
const resultsSteps = document.getElementById('resultsSteps');
const colorPalette = document.getElementById('colorPalette');

// Graph data
let nodes = [];
let edges = [];
let nodeColors = [];
let mode = 'addNode';
let selectedNode = null;
let simulationRunning = false;
let simulationPaused = false;
let animationSpeed = 5;
let animationTimeout = null;

// Simulation data
let steps = [];
let currentStep = 0;
let solutions = [];
let totalSteps = 0;

// Colors for nodes
const colors = [
    '#3498db', // blue
    '#e74c3c', // red
    '#2ecc71', // green
    '#f39c12', // orange
    '#9b59b6', // purple
    '#1abc9c', // turquoise
    '#d35400', // pumpkin
    '#34495e', // dark blue
    '#7f8c8d', // gray
    '#16a085'  // green sea
];

// Initialize canvas size
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    drawGraph();
}

// Draw the graph
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2;
    for (const edge of edges) {
        const node1 = nodes[edge[0]];
        const node2 = nodes[edge[1]];
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.stroke();
    }
    
    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        
        if (nodeColors[i] !== undefined && nodeColors[i] !== null) {
            ctx.fillStyle = colors[nodeColors[i] - 1] || '#ccc';
        } else {
            ctx.fillStyle = '#ccc';
        }
        
        // Highlight selected node
        if (i === selectedNode) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000';
        } else {
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#666';
        }
        
        ctx.fill();
        ctx.stroke();
        
        // Node label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, node.x, node.y);
    }
}

// Add a new node at the specified position
function addNode(x, y) {
    nodes.push({ x, y });
    nodeColors.push(null);
    drawGraph();
}

// Add an edge between two nodes
function addEdge(node1, node2) {
    // Check if edge already exists
    for (const edge of edges) {
        if ((edge[0] === node1 && edge[1] === node2) || 
            (edge[0] === node2 && edge[1] === node1)) {
            return false;
        }
    }
    
    edges.push([node1, node2]);
    drawGraph();
    return true;
}

// Find the node at the given position
function findNodeAt(x, y) {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        if (distance <= 20) {
            return i;
        }
    }
    return null;
}

// Clear the graph
function clearGraph() {
    nodes = [];
    edges = [];
    nodeColors = [];
    resetSimulation();
    drawGraph();
}

// Reset the simulation
function resetSimulation() {
    simulationRunning = false;
    simulationPaused = false;
    steps = [];
    currentStep = 0;
    solutions = [];
    totalSteps = 0;
    
    // Reset node colors
    nodeColors = Array(nodes.length).fill(null);
    
    // Update UI
    colorCount.textContent = '0';
    solutionCount.textContent = '0';
    stepCount.textContent = '0';
    resultsSteps.innerHTML = '<p>Simulation steps will appear here...</p>';
    updateColorPalette(0);
    
    // Reset buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
    
    drawGraph();
}

// Update the color palette display
function updateColorPalette(numColors) {
    colorPalette.innerHTML = '';
    for (let i = 0; i < numColors; i++) {
        const colorSample = document.createElement('div');
        colorSample.className = 'color-sample';
        colorSample.style.backgroundColor = colors[i];
        colorPalette.appendChild(colorSample);
    }
}

// Graph coloring algorithm using backtracking
function graphColoring() {
    resetSimulation();
    
    if (nodes.length === 0) {
        alert('Please add some nodes to the graph first.');
        return;
    }
    
    simulationRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    
    // Create adjacency list
    const graph = Array(nodes.length).fill().map(() => []);
    for (const [u, v] of edges) {
        graph[u].push(v);
        graph[v].push(u);
    }
    
    // Initialize colors array
    const colors = Array(nodes.length).fill(null);
    
    // Start with minimum possible colors (1)
    let m = 1;
    let foundSolution = false;
    
    while (!foundSolution && m <= nodes.length) {
        steps.push({
            type: 'info',
            message: `Trying with ${m} colors...`
        });
        
        // Try coloring with m colors
        if (graphColoringUtil(graph, m, colors, 0)) {
            foundSolution = true;
            steps.push({
                type: 'success',
                message: `Found a valid coloring with ${m} colors!`
            });
        } else {
            steps.push({
                type: 'info',
                message: `Cannot color with ${m} colors, trying ${m+1} colors.`
            });
            m++;
        }
    }
    
    // Start animation
    totalSteps = steps.length;
    stepCount.textContent = totalSteps;
    colorCount.textContent = m;
    solutionCount.textContent = solutions.length;
    updateColorPalette(m);
    
    animateSteps();
}

// Utility function for graph coloring
function graphColoringUtil(graph, m, colors, v) {
    // If all vertices are assigned a color, we found a solution
    if (v === nodes.length) {
        // Save this solution
        solutions.push([...colors]);
        steps.push({
            type: 'solution',
            message: `Solution ${solutions.length} found: [${colors.join(', ')}]`,
            colors: [...colors]
        });
        return true;
    }
    
    // Try different colors for vertex v
    for (let c = 1; c <= m; c++) {
        // Check if assignment of color c to v is valid
        steps.push({
            type: 'try',
            message: `Trying color ${c} for node ${v+1}`,
            node: v,
            color: c
        });
        
        if (isSafe(graph, colors, v, c)) {
            // Assign color c to v
            colors[v] = c;
            steps.push({
                type: 'assign',
                message: `Assigned color ${c} to node ${v+1}`,
                node: v,
                color: c
            });
            
            // Recur to assign colors to rest of the vertices
            if (graphColoringUtil(graph, m, colors, v + 1)) {
                return true;
            }
            
            // If assigning color c doesn't lead to a solution, remove it
            colors[v] = null;
            steps.push({
                type: 'backtrack',
                message: `Backtracking: Removed color from node ${v+1}`,
                node: v
            });
        }
    }
    
    // If no color can be assigned to this vertex
    return false;
}

// Check if it's safe to color vertex v with color c
function isSafe(graph, colors, v, c) {
    // Check all adjacent vertices
    for (const u of graph[v]) {
        if (colors[u] === c) {
            steps.push({
                type: 'conflict',
                message: `Conflict: Node ${u+1} already has color ${c}`,
                node: v,
                conflictNode: u
            });
            return false;
        }
    }
    return true;
}

// Animate the steps of the algorithm
function animateSteps() {
    if (!simulationRunning || simulationPaused) {
        return;
    }
    
    if (currentStep < steps.length) {
        const step = steps[currentStep];
        
        // Update node colors based on step
        if (step.type === 'try' || step.type === 'assign') {
            nodeColors[step.node] = step.color;
        } else if (step.type === 'backtrack') {
            nodeColors[step.node] = null;
        } else if (step.type === 'solution') {
            nodeColors = [...step.colors];
        }
        
        // Add step to results
        const stepItem = document.createElement('div');
        stepItem.className = `step-item ${step.type}`;
        stepItem.textContent = step.message;
        resultsSteps.appendChild(stepItem);
        resultsSteps.scrollTop = resultsSteps.scrollHeight;
        
        // Draw updated graph
        drawGraph();
        
        // Move to next step
        currentStep++;
        
        // Calculate delay based on speed slider
        const delay = 1100 - (speedSlider.value * 100);
        animationTimeout = setTimeout(animateSteps, delay);
    } else {
        // Simulation complete
        simulationRunning = false;
        pauseBtn.disabled = true;
        startBtn.disabled = false;
        startBtn.textContent = 'Restart Simulation';
    }
}

// Event Listeners
window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (mode === 'addNode') {
        // Check if clicking on an existing node
        const nodeIndex = findNodeAt(x, y);
        if (nodeIndex === null) {
            addNode(x, y);
        }
    } else if (mode === 'addEdge') {
        const nodeIndex = findNodeAt(x, y);
        if (nodeIndex !== null) {
            if (selectedNode === null) {
                // First node selection
                selectedNode = nodeIndex;
                drawGraph();
            } else if (selectedNode !== nodeIndex) {
                // Second node selection, create edge
                addEdge(selectedNode, nodeIndex);
                selectedNode = null;
            }
        }
    }
});

addNodeBtn.addEventListener('click', () => {
    mode = 'addNode';
    selectedNode = null;
    modeIndicator.textContent = 'Mode: Add Node';
    drawGraph();
});

addEdgeBtn.addEventListener('click', () => {
    mode = 'addEdge';
    selectedNode = null;
    modeIndicator.textContent = 'Mode: Add Edge';
    drawGraph();
});

clearBtn.addEventListener('click', clearGraph);

startBtn.addEventListener('click', () => {
    if (!simulationRunning) {
        graphColoring();
    } else {
        simulationPaused = false;
        pauseBtn.textContent = 'Pause';
        animateSteps();
    }
});

pauseBtn.addEventListener('click', () => {
    simulationPaused = !simulationPaused;
    pauseBtn.textContent = simulationPaused ? 'Resume' : 'Pause';
    
    if (!simulationPaused) {
        animateSteps();
    }
});

resetBtn.addEventListener('click', resetSimulation);

speedSlider.addEventListener('input', () => {
    animationSpeed = parseInt(speedSlider.value);
});

// Initialize
resizeCanvas();