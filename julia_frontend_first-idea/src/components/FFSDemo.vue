// HTML for defining the structure of the UI
<template>
  <!-- Main container for the demo application -->
  <div class="ffs-demo dark-theme">
    <div class="content-container">
      <h1>Feige-Fiat-Shamir Protocol Demonstrator</h1>
      
      <!-- Setup section -->
      <div class="card setup-section">
        <h2>Setup</h2>
        <div class="form-group">
          <label for="k-value">Number of values (k):</label>
          <input id="k-value" v-model.number="k" type="number" min="1" max="10" @change="resetDemo" class="input-field">
        </div>
        <div class="form-group">
          <label for="n-value">Modulus (n = p * q):</label>
          <input id="n-value" v-model.number="n" type="number" min="10" @change="resetDemo" class="input-field">
          <button @click="generateValues" class="btn primary">Generate values</button>
        </div>
        
        <!-- Display of the generated values -->
        <div v-if="setup.complete" class="values-display">
          <div class="values-grid">
            <div class="values-column">
              <h3>Peggy's secret values:</h3>
              <div class="secret-values">
                <div v-for="(s, index) in setup.secretValues" :key="'s'+index" class="value-item">
                  <span>s<sub>{{index+1}}</sub> = {{s}}</span>
                </div>
              </div>
            </div>
            
            <div class="values-column">
              <h3>Public values:</h3>
              <div class="public-values">
                <div v-for="(v, index) in setup.publicValues" :key="'v'+index" class="value-item">
                  <span>v<sub>{{index+1}}</sub> = {{v}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Protocol execution section -->
      <div class="card protocol-section" v-if="setup.complete">
        <h2>Protocol Workflow</h2>
        <div class="protocol-controls">
          <button @click="startNewRound" :disabled="roundActive" class="btn primary">
            <i class="icon">▶</i> Start New Round
          </button>
          <button @click="resetDemo" class="btn secondary">
            <i class="icon">↺</i> Reset
          </button>
        </div>
        
        <!-- Visual representation -->
        <div class="protocol-visualization">
          <!-- Peggy character -->
          <div class="character peggy" :class="{'active': currentStep === 'commitment' || currentStep === 'response'}">
            <div class="avatar">
              <img src="@/assets/peggy.png" alt="Peggy">
            </div>
            <div class="character-name">Peggy (Prover)</div>
            <!-- Thought bubble -->
            <div class="thought-bubble" v-if="currentStep === 'commitment' || currentStep === 'response'">
              <p v-if="currentStep === 'commitment'">
                I choose a random r: <strong>{{currentRound.r}}</strong><br>
                Calculate r² mod n: <strong>{{currentRound.x}}</strong>
              </p>
              <p v-if="currentStep === 'response' && currentRound.e === 0">
                Victor chose e=0.<br>
                I send y = r: <strong>{{currentRound.y}}</strong>
              </p>
              <p v-if="currentStep === 'response' && currentRound.e === 1">
                Victor chose e=1.<br>
                I send y = r·s<sub>j</sub> mod n: <strong>{{currentRound.y}}</strong>
              </p>
            </div>
          </div>
          
          <!-- Message exchange area -->
          <div class="protocol-messages">
            <!-- Step 1: Commitment message -->
            <div class="message" v-if="currentStep === 'commitment'">
              <div class="arrow right"></div>
              <div class="content">
                <strong>1. Commitment:</strong> x = {{currentRound.x}}
              </div>
            </div>
            
            <!-- Step 2: Challenge message -->
            <div class="message" v-if="currentStep === 'challenge'">
              <div class="arrow left"></div>
              <div class="content">
                <strong>2. Challenge:</strong> e = {{currentRound.e}}
                <span v-if="currentRound.j">, j = {{currentRound.j}}</span>
              </div>
            </div>
            
            <!-- Step 3: Response message -->
            <div class="message" v-if="currentStep === 'response'">
              <div class="arrow right"></div>
              <div class="content">
                <strong>3. Response:</strong> y = {{currentRound.y}}
              </div>
            </div>
            
            <!-- Step 4: Verification result -->
            <div class="message" v-if="currentStep === 'verification'">
              <div class="arrow none"></div>
              <div class="content verification" :class="{'success': currentRound.verified, 'failure': !currentRound.verified}">
                <strong>4. Verification:</strong> 
                <span class="verification-icon">{{ currentRound.verified ? '✓' : '✗' }}</span>
                {{ currentRound.verified ? 'Confirmed!' : 'Failed!' }}
                <div class="verification-equation">
                  {{ currentRound.e === 0 ? 'y² mod n = ' : 'y² mod n = x · v_j mod n' }}
                  <br>
                  {{ currentRound.verificationLeft }} = {{ currentRound.verificationRight }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Victor character -->
          <div class="character victor" :class="{'active': currentStep === 'challenge' || currentStep === 'verification'}">
            <div class="avatar">
              <img src="../assets/victor.png" alt="Victor">
            </div>
            <div class="character-name">Victor (Verifier)</div>
            <!-- Thought bubble -->
            <div class="thought-bubble" :class="{'verification-thought': currentStep === 'verification'}" v-if="currentStep === 'challenge' || currentStep === 'verification'">
              <p v-if="currentStep === 'challenge'">
                I randomly choose:<br>
                e = <strong>{{currentRound.e}}</strong>
                <span v-if="currentRound.e === 1">and j = <strong>{{currentRound.j}}</strong></span>
              </p>
              <p v-if="currentStep === 'verification'">
                Checking: {{ currentRound.e === 0 ? 'y² mod n = x' : 'y² mod n = x · v_j mod n' }}<br>
                {{ currentRound.verified ? '✓ Correct!' : '✗ Incorrect!' }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Protocol step buttons -->
        <div class="protocol-steps" v-if="roundActive">
          <button 
            v-if="currentStep === 'start'" 
            @click="createCommitment" 
            class="btn step-btn">
            1. Peggy creates Commitment
          </button>
          
          <button 
            v-if="currentStep === 'commitment'" 
            @click="createChallenge" 
            class="btn step-btn">
            2. Victor sends Challenge
          </button>
          
          <button 
            v-if="currentStep === 'challenge'" 
            @click="createResponse" 
            class="btn step-btn">
            3. Peggy sends Response
          </button>
          
          <button 
            v-if="currentStep === 'response'" 
            @click="verifyResponse" 
            class="btn step-btn">
            4. Victor verifies
          </button>
        </div>
        
        <!-- History of past rounds -->
        <div class="rounds-history" v-if="rounds.length > 0">
          <h3>Previous Rounds</h3>
          <div class="rounds-table">
            <table>
              <thead>
                <tr>
                  <th>Round</th>
                  <th>x</th>
                  <th>e</th>
                  <th>j</th>
                  <th>y</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(round, index) in rounds" :key="index">
                  <td>{{index + 1}}</td>
                  <td>{{round.x}}</td>
                  <td>{{round.e}}</td>
                  <td>{{round.e === 1 ? round.j : '-'}}</td>
                  <td>{{round.y}}</td>
                  <td :class="{'success': round.verified, 'failure': round.verified === false}">
                    <span class="result-icon">{{round.verified === undefined ? '-' : (round.verified ? '✓' : '✗')}}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Security information -->
          <div class="security-info">
            <p>
              <strong>Security:</strong> After {{rounds.filter(r => r.verified !== undefined).length}} rounds,
              the probability that Peggy is cheating is at most 
              (1/2)<sup>{{rounds.filter(r => r.verified).length}}</sup> = 
              {{Math.pow(0.5, rounds.filter(r => r.verified).length).toFixed(8)}}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Explanation section -->
      <div class="card explanation">
        <h2>Explanation of the Feige-Fiat-Shamir Protocol</h2>
        <div class="explanation-content">
          <div class="explanation-section">
            <h3>Goal</h3>
            <p>Peggy wants to prove to Victor that she knows the square roots of k numbers modulo n, without revealing these values.</p>
          </div>
          
          <div class="explanation-section">
            <h3>Setup</h3>
            <ol>
              <li>Peggy chooses secret values s<sub>1</sub>, s<sub>2</sub>, ..., s<sub>k</sub></li>
              <li>Peggy calculates public values v<sub>i</sub> = s<sub>i</sub>² mod n for i = 1, 2, ..., k</li>
              <li>The public values v<sub>i</sub> are published</li>
            </ol>
          </div>
          
          <div class="explanation-section">
            <h3>Protocol (for each round)</h3>
            <ol>
              <li><strong>Commitment:</strong> Peggy chooses random r and sends x = r² mod n to Victor</li>
              <li><strong>Challenge:</strong> Victor randomly chooses e ∈ {0, 1} and if e=1, also j ∈ {1, 2, ..., k}</li>
              <li><strong>Response:</strong> Peggy sends y = r (if e=0) or y = r·s<sub>j</sub> mod n (if e=1)</li>
              <li><strong>Verification:</strong> Victor checks if y² mod n = x (if e=0) or y² mod n = x·v<sub>j</sub> mod n (if e=1)</li>
            </ol>
          </div>
          
          <div class="explanation-section">
            <h3>Security</h3>
            <p>
              After t successful rounds, the probability that Peggy is cheating is at most (1/2)<sup>t</sup>.
              The protocol is "zero-knowledge" because Victor gains no information about the secret values s<sub>i</sub>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



// JavaScript for the component logic
<script>
export default {
  name: 'FFSDemo',
  data() {
    return {
      k: 3, // Number of values
      n: 143, // Modulus (should be the product of two large prime numbers)
      setup: {
        complete: false,
        secretValues: [], // s_i values
        publicValues: []  // v_i values
      },
      rounds: [],
      currentRound: {},
      roundActive: false,
      currentStep: null
    };
  },
  // Lifecycle hook to set the document background color when component is created
  created() {
    document.documentElement.style.backgroundColor = '#121212';
    document.body.style.backgroundColor = '#121212';
  },
  // Ensure background color resets if the component is removed
  beforeDestroy() {
    document.documentElement.style.backgroundColor = '';
    document.body.style.backgroundColor = '';
  },
  methods: {
    // Helper functions for modular arithmetic
    
    // Modular exponentiation (base^exponent mod modulus)
    modPow(base, exponent, modulus) {
      if (modulus === 1) return 0;
      let result = 1;
      base = base % modulus;
      while (exponent > 0) {
        if (exponent % 2 === 1) {
          result = (result * base) % modulus;
        }
        exponent = exponent >> 1; // Bit shift right (divide by 2)
        base = (base * base) % modulus;
      }
      return result;
    },
    
    // Modular multiplication (a * b mod n)
    modMul(a, b, n) {
      return (a * b) % n;
    },
    
    // Helper function to generate a random integer in the range [1, max-1]
    randomInt(max) {
      return Math.floor(Math.random() * (max - 1)) + 1;
    },
    
    // Setup phase of the protocol
    generateValues() {
      if (this.k < 1 || this.n < 10) {
        alert('Please enter valid values for k and n.');
        return;
      }
      
      const secretValues = [];
      const publicValues = [];
      
      for (let i = 0; i < this.k; i++) {
        // Choose random secret value s_i
        const s = this.randomInt(this.n);
        secretValues.push(s);
        
        // Calculate public value v_i = s_i^2 mod n
        const v = this.modPow(s, 2, this.n);
        publicValues.push(v);
      }
      
      this.setup = {
        complete: true,
        secretValues,
        publicValues
      };
      
      this.rounds = [];
      this.roundActive = false;
      this.currentStep = null;
    },
    
    // Start a new protocol round
    startNewRound() {
      this.roundActive = true;
      this.currentStep = 'start';
      this.currentRound = {};
    },
    
    // Step 1: Peggy creates commitment
    createCommitment() {
      // Peggy chooses random r
      const r = this.randomInt(this.n);
      
      // Calculate x = r^2 mod n
      const x = this.modPow(r, 2, this.n);
      
      this.currentRound = {
        r: r,  // Secret value that Peggy chooses
        x: x   // Commitment that Peggy sends to Victor
      };
      
      this.currentStep = 'commitment';
    },
    
    // Step 2: Victor sends challenge
    createChallenge() {
      // Victor randomly chooses e from {0, 1}
      const e = Math.random() < 0.5 ? 0 : 1;
      
      // If e=1, Victor also chooses j from {1, 2, ..., k}
      const j = e === 1 ? Math.floor(Math.random() * this.k) + 1 : null;
      
      this.currentRound.e = e;
      this.currentRound.j = j;
      
      this.currentStep = 'challenge';
    },
    
    // Step 3: Peggy sends response
    createResponse() {
      if (this.currentRound.e === 0) {
        // If e=0, Peggy sends y = r
        this.currentRound.y = this.currentRound.r;
      } else {
        // If e=1, Peggy sends y = r * s_j mod n
        const j = this.currentRound.j - 1; // Convert to 0-based indexing
        const s_j = this.setup.secretValues[j];
        this.currentRound.y = this.modMul(this.currentRound.r, s_j, this.n);
      }
      
      this.currentStep = 'response';
    },
    
    // Step 4: Victor verifies
    verifyResponse() {
      const y_squared = this.modPow(this.currentRound.y, 2, this.n);
      let verification_right;
      
      if (this.currentRound.e === 0) {
        // If e=0, check if y^2 mod n = x
        verification_right = this.currentRound.x;
      } else {
        // If e=1, check if y^2 mod n = x * v_j mod n
        const j = this.currentRound.j - 1; // Convert to 0-based indexing
        const v_j = this.setup.publicValues[j];
        verification_right = this.modMul(this.currentRound.x, v_j, this.n);
      }
      
      // Store verification information for display
      this.currentRound.verificationLeft = y_squared;
      this.currentRound.verificationRight = verification_right;
      
      // Check if the equation is satisfied
      this.currentRound.verified = y_squared === verification_right;
      
      this.currentStep = 'verification';
      
      // Add the current round to the history
      this.rounds.push({...this.currentRound});
      
      // End the current round
      this.roundActive = false;
    },
    
    // Reset the demo
    resetDemo() {
      this.setup.complete = false;
      this.rounds = [];
      this.currentRound = {};
      this.roundActive = false;
      this.currentStep = null;
    }
  }
};
</script>



// CSS for styling
<style>
/* Global styles to ensure full-width display */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #121212;
  overflow-x: hidden;
}

/* CSS styling for the demo interface */
.ffs-demo {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
  color: #e0e0e0;
  background-color: #121212;
  line-height: 1.6;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dark-theme {
  --primary-color: #7e57c2;
  --primary-hover: #9575cd;
  --secondary-color: #f44336;
  --secondary-hover: #e57373;
  --surface-color: #1e1e1e;
  --card-color: #2d2d2d;
  --success-color: #66bb6a;
  --error-color: #ef5350;
  --border-color: #444444;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
}

h1, h2, h3 {
  color: var(--text-primary);
  font-weight: 500;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
  background: linear-gradient(90deg, var(--primary-color), #03a9f4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 10px rgba(126, 87, 194, 0.2);
}

h2 {
  font-size: 1.5rem;
  margin-top: 0;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.card {
  background-color: var(--card-color);
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px; 
  padding: 20px; 
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: visible;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.form-group label {
  width: 200px;
  font-weight: 500;
  color: var(--text-primary);
  margin-right: 15px;
}

.input-field {
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  width: 100px;
  margin-right: 15px;
  background-color: #383838;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-field:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(126, 87, 194, 0.2);
}

.btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  background-color: #555555;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn.primary {
  background-color: var(--primary-color);
}

.btn.primary:hover {
  background-color: var(--primary-hover);
}

.btn.secondary {
  background-color: var(--secondary-color);
}

.btn.secondary:hover {
  background-color: var(--secondary-hover);
}

.protocol-steps {
  margin-top: 10px; /* Added to reduce space between the buttons and Peggy */
}

.protocol-steps .btn.step-btn {
  margin: 12px auto; 
  padding: 10px 20px;
}

.icon {
  margin-right: 8px;
  font-style: normal;
}

.values-display {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 8px;
  margin-top: 25px;
  border: 1px solid var(--border-color);
}

.values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .values-grid {
    grid-template-columns: 1fr;
  }
}

.values-column {
  display: flex;
  flex-direction: column;
}

.secret-values, .public-values {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
}

.value-item {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 10px 15px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  border: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.value-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.protocol-visualization {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0; 
  position: relative;
  min-height: 200px;
  padding-top: 100px;
  overflow: visible;
}

.character {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  position: relative;
  margin-top: 80px;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-color);
  background-color: #333333;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9);
}

.character.active .avatar {
  border-color: var(--primary-color);
  box-shadow: 0 0 15px rgba(126, 87, 194, 0.5);
}

.character-name {
  margin-top: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.thought-bubble {
  position: absolute;
  top: -110px;
  background-color: #383838;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
  width: 220px;
  min-height: 80px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  color: var(--text-primary);
  z-index: 10;
  left: 50%;
  transform: translateX(-50%);
}

.thought-bubble:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #383838;
}

.protocol-messages {
  flex-grow: 1;
  padding: 0 20px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 12px 15px;
  border-radius: 8px;
  position: relative;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.message:hover {
  transform: translateY(-2px);
}

.message .content {
  width: 100%;
  color: var(--text-primary);
}

.arrow {
  position: absolute;
  width: 40px;
  height: 2px;
  background-color: var(--primary-color);
}

.arrow.right {
  left: -40px;
}

.arrow.right:after {
  content: '';
  position: absolute;
  right: 0;
  top: -4px;
  border-left: 8px solid var(--primary-color);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.arrow.left {
  right: -40px;
}

.arrow.left:after {
  content: '';
  position: absolute;
  left: 0;
  top: -4px;
  border-right: 8px solid var(--primary-color);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.arrow.none {
  display: none;
}

.verification {
  padding: 15px;
  border-radius: 6px;
}

.verification-icon {
  font-size: 18px;
  margin-right: 8px;
}

.verification.success {
  background-color: rgba(102, 187, 106, 0.1);
  border-left: 4px solid var(--success-color);
}

.verification.failure {
  background-color: rgba(239, 83, 80, 0.1);
  border-left: 4px solid var(--error-color);
}

.verification-equation {
  font-family: 'JetBrains Mono', monospace;
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 14px;
}

.protocol-controls {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.rounds-history {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid var(--border-color);
}

.rounds-table {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-top: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  border: 1px solid var(--border-color);
  padding: 12px 15px;
  text-align: center;
}

th {
  background-color: rgba(0, 0, 0, 0.3);
  font-weight: 500;
  color: var(--text-primary);
}

tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.03);
}

tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

td.success {
  color: var(--success-color);
  font-weight: 500;
}

td.failure {
  color: var(--error-color);
  font-weight: 500;
}

.result-icon {
  font-size: 16px;
}

.security-info {
  margin-top: 25px;
  padding: 20px;
  background-color: rgba(3, 169, 244, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(3, 169, 244, 0.3);
}

.explanation {
  margin-top: 40px;
  background-color: var(--card-color);
}

.explanation-content {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

@media (max-width: 768px) {
  .content-container {
    width: 100%;
    padding: 0 10px;
  }
  
  .values-grid {
    grid-template-columns: 1fr;
  }
  
  .explanation-content {
    grid-template-columns: 1fr;
  }
}

.explanation-section {
  padding-bottom: 20px;
}

.explanation h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--primary-color);
  font-size: 1.2rem;
}

.explanation ol {
  padding-left: 25px;
  margin: 15px 0;
}

.explanation li {
  margin-bottom: 10px;
}

/* Add fixed positioning for verification thought bubbles */
.character .thought-bubble.verification-thought {
  min-width: 250px;
  width: auto;
}

/* Ensure thought bubbles don't get cut off at the edges */
.protocol-section {
  padding-top: 20px;
  position: relative;
  overflow: visible;
}

/* Create a responsive container for the protocol sections */
@media (min-width: 1400px) {
  .content-container {
    max-width: 80%;
  }
}
</style>