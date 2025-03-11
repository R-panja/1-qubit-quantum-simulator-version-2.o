const qiskit = require('@qiskit/algo-js');

console.log('Version');
console.log(qiskit.version);


// Basic Quantum Circuit Simulation Logic
let qubits = [0, 0]; // Initial state: all qubits are |0>

// Function to add a quantum gate
function addGate(gate) {
    if (gate === 'H') {
        // Hadamard Gate (simplified version)
        qubits[0] = qubits[0] === 0 ? 1 / Math.sqrt(2) : -1 / Math.sqrt(2);
    } else if (gate === 'X') {
        // Pauli-X Gate (bit-flip)
        qubits = qubits.map(q => q === 0 ? 1 : 0);
    }
    updateCircuit();
}

// Function to update the circuit visualization
function updateCircuit() {
    // Update text representation of qubits
    document.getElementById('output').innerText = `Qubits: ${qubits}`;
    // Call function to update the visual representation of the circuit
    drawCircuit();
}

// Simulate the quantum circuit (measurement result)
function simulateCircuit() {
    const result = Math.random() > 0.5 ? '1' : '0';
    document.getElementById('output').innerText = `Measurement Result: ${result}`;
}

// **Canvas Visualization using Fabric.js**
let canvas = new fabric.Canvas('circuitCanvas'); // Set up the Fabric.js canvas

// Function to draw quantum circuit on canvas
function drawCircuit() {
    canvas.clear();  // Clear the canvas each time
    let lineHeight = 40;
    let yPos = 20;

    // Draw qubits
    qubits.forEach((q, index) => {
        // Draw a line for each qubit
        let qubitLine = new fabric.Line([50, yPos, 250, yPos], {
            stroke: 'black',
            strokeWidth: 2,
            selectable: false
        });
        canvas.add(qubitLine);

        // Draw a simple circle to represent the quantum gate
        if (q === 1) {
            let gateCircle = new fabric.Circle({
                radius: 10,
                fill: 'red',
                left: 120,
                top: yPos - 10,
                selectable: false
            });
            canvas.add(gateCircle);
        }

        yPos += lineHeight;
    });

    canvas.renderAll();
}

// Call this function to initialize the circuit
drawCircuit();

// **Optional: Advanced Quantum Simulation using Qiskit.js or Quantum.js**
// Here we would integrate the advanced simulation features using a quantum library if desired.
