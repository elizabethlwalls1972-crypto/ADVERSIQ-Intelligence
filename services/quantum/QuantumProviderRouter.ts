
export type QuantumBackend = 'simulator' | 'ionq' | 'ibm' | 'local';
export class QuantumProviderRouter {
  private backends: QuantumBackend[] = ['simulator', 'local'];
  route(taskComplexity: number): QuantumBackend {
    if (taskComplexity > 0.8) return this.backends.includes('ibm') ? 'ibm' : 'simulator';
    return 'simulator';
  }
  registerBackend(b: QuantumBackend) { if (!this.backends.includes(b)) this.backends.push(b); }
}
export default QuantumProviderRouter;
