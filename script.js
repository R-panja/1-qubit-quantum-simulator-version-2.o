// Quantum State Representation
let quantumState = [[1], [0]]; // Initial |0⟩ state for single qubit
let numQubits = 1;
let circuit = [];

// Gate Definitions
const gates = {
    // Single qubit gates
    I: [[1, 0], [0, 1]],
    X: [[0, 1], [1, 0]],
    Y: [[0, {real: 0, imag: -1}], [{real: 0, imag: 1}, 0]],
    Z: [[1, 0], [0, -1]],
    H: [
        [1/Math.sqrt(2), 1/Math.sqrt(2)], 
        [1/Math.sqrt(2), -1/Math.sqrt(2)]
    ],
    S: [[1, 0], [0, {real: 0, imag: 1}]],
    T: [[1, 0], [0, {real: Math.cos(Math.PI/4), imag: Math.sin(Math.PI/4)}]],

    
    // Multi-qubit gates
    CNOT: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 1, 0]
    ],
    SWAP: [
        [1, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1]
    ],
    CZ: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, -1]
    ]
};

// Three.js Bloch Sphere Setup
let scene, camera, renderer, sphere, arrow;
let qubitStates = [{theta: 0, phi: 0}]; // Track state of each qubit

function initBlochSphere() {
    const container = document.getElementById('bloch-sphere');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.5;
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Add axes helper
    const axesHelper = new THREE.AxesHelper(1.5);
    scene.add(axesHelper);
    
    // Create sphere
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x3498db, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    
    // Create arrow (initially pointing to |0⟩)
    const dir = new THREE.Vector3(0, 0, 1);
    dir.normalize();
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1.5;
    const hex = 0xff0000;
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, 0.2, 0.1);
    arrow = arrowHelper;
    scene.add(arrow);
    
    // Add labels
    addLabels();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    animate();
}

function addLabels() {
    // Add |0⟩ and |1⟩ labels
    const loader = new THREE.TextureLoader();
    const createLabel = (text, position) => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.font = 'Bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(text, canvas.width/2, canvas.height/2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(position.x, position.y, position.z);
        sprite.scale.set(0.2, 0.1, 0.1);
        scene.add(sprite);
    };
    
    createLabel('|0⟩', new THREE.Vector3(0, 0, 1.2));
    createLabel('|1⟩', new THREE.Vector3(0, 0, -1.2));
    createLabel('|+⟩', new THREE.Vector3(1.2, 0, 0));
    createLabel('|-⟩', new THREE.Vector3(-1.2, 0, 0));
    createLabel('|i⟩', new THREE.Vector3(0, 1.2, 0));
    createLabel('|-i⟩', new THREE.Vector3(0, -1.2, 0));
}

function onWindowResize() {
    const container = document.getElementById('bloch-sphere');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function updateBlochSphere(qubitIndex) {
    if (qubitIndex >= qubitStates.length) return;
    
    const state = qubitStates[qubitIndex];
    const theta = state.theta;
    const phi = state.phi;
    
    // Calculate new arrow direction
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    
    // Remove old arrow
    scene.remove(arrow);
    
    // Create new arrow
    const dir = new THREE.Vector3(x, y, z);
    dir.normalize();
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1.5;
    const hex = 0xff0000;
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, 0.2, 0.1);
    arrow = arrowHelper;
    scene.add(arrow);
}

// Initialize the circuit with default qubit
function initCircuit() {
    const circuitElement = document.getElementById('circuit');
    circuitElement.innerHTML = '';
    
    for (let i = 0; i < numQubits; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        
        const qubitLabel = document.createElement('div');
        qubitLabel.className = 'qubit-label';
        qubitLabel.textContent = `q${i}`;
        row.appendChild(qubitLabel);
        
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.dataset.qubit = i;
        dropZone.dataset.step = 0;
        row.appendChild(dropZone);
        
        circuitElement.appendChild(row);
    }
    
    // Update qubit selector
    updateQubitSelector();
}

function updateQubitSelector() {
    const selector = document.getElementById('qubit-select');
    selector.innerHTML = '';
    
    for (let i = 0; i < numQubits; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Qubit ${i}`;
        selector.appendChild(option);
    }
    
    // Add event listener to update visualization when qubit is selected
    selector.addEventListener('change', (e) => {
        updateBlochSphere(parseInt(e.target.value));
    });
}

// Add a new qubit to the circuit
function addQubit() {
    numQubits++;
    updateQuantumStateForNewQubit();
    initCircuit();
    qubitStates.push({theta: 0, phi: 0});
}

// Remove the last qubit from the circuit
function removeQubit() {
    if (numQubits <= 1) return;
    numQubits--;
    updateQuantumStateForRemovedQubit();
    initCircuit();
    qubitStates.pop();
}

function updateQuantumStateForNewQubit() {
    // Tensor product with |0⟩ state
    const newState = [];
    for (let i = 0; i < quantumState.length; i++) {
        newState.push([...quantumState[i], 0]);
    }
    for (let i = 0; i < quantumState.length; i++) {
        newState.push(new Array(quantumState[0].length).fill(0));
    }
    quantumState = newState;
}

function updateQuantumStateForRemovedQubit() {
    // Trace out the last qubit (simplified version)
    const newState = [];
    const size = quantumState.length / 2;
    for (let i = 0; i < size; i++) {
        newState.push([quantumState[i][0] + quantumState[i + size][0]]);
    }
    quantumState = newState;
}

// Drag and Drop Logic
function setupDragAndDrop() {
    document.querySelectorAll('.gate').forEach(gate => {
        gate.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData("text", e.target.getAttribute("data-type"));
        });
    });

    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.target.classList.add('highlight');
        });

        zone.addEventListener('dragleave', (e) => {
            e.target.classList.remove('highlight');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.target.classList.remove('highlight');
            
            const gateType = e.dataTransfer.getData("text");
            const qubitIndex = parseInt(e.target.dataset.qubit);
            const stepIndex = parseInt(e.target.dataset.step);
            
            // Place the gate in the UI
            const gateElement = document.createElement('div');
            gateElement.className = 'gate-placed';
            gateElement.textContent = gateType;
            gateElement.dataset.type = gateType;
            gateElement.dataset.qubit = qubitIndex;
            gateElement.dataset.step = stepIndex;
            e.target.innerHTML = '';
            e.target.appendChild(gateElement);
            
            // Add gate to circuit data structure
            if (!circuit[stepIndex]) circuit[stepIndex] = [];
            circuit[stepIndex][qubitIndex] = gateType;
            
            // Apply the gate to the quantum state
            applyGate(gateType, qubitIndex);
            
            // Add a new drop zone after this gate
            addNewDropZone(qubitIndex, stepIndex + 1);
        });
    });
}

function addNewDropZone(qubitIndex, stepIndex) {
    const rows = document.querySelectorAll('.row');
    if (rows.length <= qubitIndex) return;
    
    const row = rows[qubitIndex];
    const existingDropZone = row.querySelector(`.drop-zone[data-step="${stepIndex}"]`);
    if (existingDropZone) return;
    
    // Find the position to insert the new drop zone
    let insertBeforeElement = null;
    row.querySelectorAll('.drop-zone').forEach(zone => {
        if (parseInt(zone.dataset.step) > stepIndex && !insertBeforeElement) {
            insertBeforeElement = zone;
        }
    });
    
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.dataset.qubit = qubitIndex;
    dropZone.dataset.step = stepIndex;
    
    if (insertBeforeElement) {
        row.insertBefore(dropZone, insertBeforeElement);
    } else {
        row.appendChild(dropZone);
    }
    
    // Re-setup event listeners for all drop zones
    setupDragAndDrop();
}

// Matrix Operations
function multiplyMatrix(A, B) {
    let result = new Array(A.length).fill(0).map(() => new Array(B[0].length).fill(0));
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
            for (let k = 0; k < B.length; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return result;
}

function kroneckerProduct(A, B) {
    let result = [];
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B.length; j++) {
            const row = [];
            for (let k = 0; k < A[i].length; k++) {
                for (let l = 0; l < B[j].length; l++) {
                    row.push(A[i][k] * B[j][l]);
                }
            }
            result.push(row);
        }
    }
    return result;
}

// Apply Quantum Gates
function applyGate(type, qubitIndex) {
    if (type === "H") {
        applySingleQubitGate(gates.H, qubitIndex);
        updateQubitStateAfterGate(qubitIndex, 'H');
    } else if (type === "X") {
        applySingleQubitGate(gates.X, qubitIndex);
        updateQubitStateAfterGate(qubitIndex, 'X');
    } else if (type === "Y") {
        applySingleQubitGate(gates.Y, qubitIndex);
        updateQubitStateAfterGate(qubitIndex, 'Y');
    } else if (type === "Z") {
        applySingleQubitGate(gates.Z, qubitIndex);
        updateQubitStateAfterGate(qubitIndex, 'Z');
    } else if (type === "S") {
        applySingleQubitGate(gates.S, qubitIndex);
        updateQubitStateAfterGate(qubitIndex, 'S');
    } else if (type === "T") {
        applySingleQubitGate(gates.T, qubitIndex);
        updateQubitStateAfterGate(qubitIndex, 'T');
    } else if (type === "CNOT") {
        applyMultiQubitGate(gates.CNOT, [qubitIndex, (qubitIndex + 1) % numQubits]);
    } else if (type === "SWAP") {
        applyMultiQubitGate(gates.SWAP, [qubitIndex, (qubitIndex + 1) % numQubits]);
    } else if (type === "CZ") {
        applyMultiQubitGate(gates.CZ, [qubitIndex, (qubitIndex + 1) % numQubits]);
    }
    
    updateStateDisplay();
    updateBlochSphere(document.getElementById('qubit-select').value || 0);
}

function applySingleQubitGate(gate, targetQubit) {
    // Create full matrix by tensoring with identity on other qubits
    let fullMatrix = createIdentityMatrix(Math.pow(2, numQubits));
    
    // For each qubit, apply identity or the gate
    for (let i = 0; i < numQubits; i++) {
        const currentGate = (i === targetQubit) ? gate : gates.I;
        fullMatrix = multiplyMatrix(kroneckerProduct(fullMatrix, currentGate), fullMatrix);
    }
    
    quantumState = multiplyMatrix(fullMatrix, quantumState);
}

function applyMultiQubitGate(gate, qubits) {
    if (qubits.length !== 2) return;
    
    // Create full matrix by tensoring with identity on other qubits
    let fullMatrix = createIdentityMatrix(Math.pow(2, numQubits));
    
    // Determine the order of operations based on qubit indices
    const [control, target] = qubits;
    
    // For CNOT/SWAP/CZ, we need to construct the full matrix
    fullMatrix = gate; // Simplified - in reality would need to tensor properly
    
    quantumState = multiplyMatrix(fullMatrix, quantumState);
}

function createIdentityMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
        const row = new Array(size).fill(0);
        row[i] = 1;
        matrix.push(row);
    }
    return matrix;
}

function updateQubitStateAfterGate(qubitIndex, gateType) {
    const state = qubitStates[qubitIndex];
    
    switch (gateType) {
        case 'H':
            // Hadamard gate rotates by π around X+Z axis
            state.theta = Math.PI/2 - state.theta;
            state.phi = Math.PI - state.phi;
            break;
        case 'X':
            // X gate is π rotation around X-axis
            state.theta = Math.PI - state.theta;
            state.phi = -state.phi;
            break;
        case 'Y':
            // Y gate is π rotation around Y-axis
            state.theta = Math.PI - state.theta;
            state.phi = Math.PI - state.phi;
            break;
        case 'Z':
            // Z gate is π rotation around Z-axis (just changes phase)
            state.phi += Math.PI;
            break;
        case 'S':
            // S gate is π/2 rotation around Z-axis
            state.phi += Math.PI/2;
            break;
        case 'T':
            // T gate is π/4 rotation around Z-axis
            state.phi += Math.PI/4;
            break;
    }
    
    // Normalize angles
    state.theta = ((state.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    state.phi = ((state.phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

// Update Quantum State Display
function updateStateDisplay() {
    let output = '';
    const numStates = Math.pow(2, numQubits);
    
    for (let i = 0; i < numStates; i++) {
        const binaryString = i.toString(2).padStart(numQubits, '0');
        const ket = `|${binaryString}⟩`;
        const amplitude = quantumState[i] ? quantumState[i][0].toFixed(4) : '0.0000';
        output += `${amplitude} ${ket}\n`;
    }
    
    document.getElementById('state').textContent = output;
}

// Reset the circuit
function resetCircuit() {
    quantumState = [ [1] ];
    for (let i = 1; i < Math.pow(2, numQubits); i++) {
        quantumState.push([0]);
    }
    circuit = [];
    qubitStates = Array(numQubits).fill().map(() => ({theta: 0, phi: 0}));
    initCircuit();
    updateStateDisplay();
    updateBlochSphere(0);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initCircuit();
    setupDragAndDrop();
    initBlochSphere();
    
    // Event listeners for buttons
    document.getElementById('add-qubit').addEventListener('click', addQubit);
    document.getElementById('remove-qubit').addEventListener('click', removeQubit);
    document.getElementById('reset-circuit').addEventListener('click', resetCircuit);
    
    // Initial state display
    updateStateDisplay();
});