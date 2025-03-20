// Quantum State Representation
let quantumState = [[1], [0], [0], [0]]; // |00⟩ state

// Hadamard and CNOT Matrices
const Hadamard = [
    [1 / Math.sqrt(2), 1 / Math.sqrt(2)],
    [1 / Math.sqrt(2), -1 / Math.sqrt(2)]
];

const CNOT = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 0]
];

// Drag and Drop Logic
document.querySelectorAll('.gate').forEach(gate => {
    gate.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData("text", e.target.getAttribute("data-type"));
    });
});

document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        const gateType = e.dataTransfer.getData("text");

        // Place the gate in the UI
        e.target.textContent = gateType;

        // Apply Quantum Logic
        applyGate(gateType, Array.from(zone.parentNode.parentNode.children).indexOf(zone.parentNode));
    });
});

// Matrix Multiplication Helper
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

// Apply Quantum Gates
function applyGate(type, qubitIndex) {
    if (type === "H" && qubitIndex === 0) {
        // Apply Hadamard on qubit 0
        let I = [[1, 0], [0, 1]];
        let H_I = kroneckerProduct(Hadamard, I);
        quantumState = multiplyMatrix(H_I, quantumState);
    }
    if (type === "CNOT" && qubitIndex === 0) {
        // Apply CNOT
        quantumState = multiplyMatrix(CNOT, quantumState);
    }

    updateStateDisplay();
}

// Kronecker Product (for multi-qubit operations)
function kroneckerProduct(A, B) {
    let result = [];
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B.length; j++) {
            result.push(A[i].map(a => B[j].map(b => a * b)).flat());
        }
    }
    return result;
}

// Update Quantum State Display
function updateStateDisplay() {
    const states = ["|00⟩", "|01⟩", "|10⟩", "|11⟩"];
    let output = quantumState.map((amp, i) => `${(amp[0].toFixed(2))} ${states[i]}`).join("\n");
    document.getElementById("state").textContent = output;
}
