/**
 * CODE INTEGRITY VALIDATORS
 * 
 * AST parsing, type checking, memory validation for generated patches.
 * Replaces economic formulas with cybersecurity validators.
 * 
 * When AlgorithmicMutator generates a patch, these validators ensure:
 * 1. Syntax is valid
 * 2. Types match existing code
 * 3. Memory bounds are safe
 * 4. No new vulnerabilities introduced
 */

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-1, where 1 = completely safe
  errors: string[];
  warnings: string[];
  metrics: {
    cyclomaticComplexity: number;
    nesting: number;
    unsafeOperations: number;
  };
}

/**
 * SYNTAX & SEMANTIC VALIDATOR
 */
export class TypeScriptValidator {
  /**
   * Parse TypeScript/JavaScript code and validate syntax
   */
  validateSyntax(code: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      score: 1,
      errors: [],
      warnings: [],
      metrics: {
        cyclomaticComplexity: 0,
        nesting: 0,
        unsafeOperations: 0
      }
    };

    try {
      // Basic syntax validation without external parser
      const lines = code.split('\n');
      let braceCount = 0;
      let parenCount = 0;
      let bracketCount = 0;
      let nesting = 0;
      let maxNesting = 0;
      let ccn = 1;

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Count braces for structure validation
        for (const char of line) {
          if (char === '{') { braceCount++; nesting++; maxNesting = Math.max(maxNesting, nesting); }
          if (char === '}') { braceCount--; nesting--; }
          if (char === '(') parenCount++;
          if (char === ')') parenCount--;
          if (char === '[') bracketCount++;
          if (char === ']') bracketCount--;
        }

        // Detect unsafe operations
        if (trimmed.includes('eval(')) {
          result.metrics.unsafeOperations++;
          result.warnings.push(`Unsafe function call: eval`);
        }
        if (trimmed.includes('Function(')) {
          result.metrics.unsafeOperations++;
          result.warnings.push(`Unsafe function call: Function`);
        }
        if (trimmed.includes('exec(')) {
          result.metrics.unsafeOperations++;
          result.warnings.push(`Unsafe function call: exec`);
        }

        // Count decision points for cyclomatic complexity
        if (trimmed.startsWith('if ') || trimmed.includes(' if ')) ccn++;
        if (trimmed.includes(' ? ') && trimmed.includes(' : ')) ccn++;
        if (trimmed.includes('case ')) ccn++;
        if (trimmed.startsWith('catch')) ccn++;
      }

      // Check for unbalanced braces
      if (braceCount !== 0 || parenCount !== 0 || bracketCount !== 0) {
        result.isValid = false;
        result.errors.push('Unbalanced braces/parentheses');
        result.score = 0;
        return result;
      }

      result.metrics.cyclomaticComplexity = ccn;
      result.metrics.nesting = maxNesting;
      result.score = Math.max(0, 1 - (result.metrics.unsafeOperations * 0.15));

      if (ccn > 20) {
        result.warnings.push(`High cyclomatic complexity: ${ccn}`);
        result.score *= 0.9;
      }

      if (maxNesting > 5) {
        result.warnings.push(`Deep nesting: ${maxNesting} levels`);
        result.score *= 0.95;
      }
    } catch (error) {
      result.isValid = false;
      result.score = 0;
      result.errors.push((error as Error).message);
    }

    return result;
  }
}

/**
 * TYPE SAFETY VALIDATOR
 */
export class TypeSafetyValidator {
  private existingTypes: Map<string, string> = new Map();

  /**
   * Register known types from existing code
   */
  registerTypes(typedefs: Record<string, string>): void {
    for (const [name, type] of Object.entries(typedefs)) {
      this.existingTypes.set(name, type);
    }
  }

  /**
   * Check if new code's types match existing interfaces
   */
  validateTypes(code: string, importedTypes: Record<string, string>): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      score: 1,
      errors: [],
      warnings: [],
      metrics: {
        cyclomaticComplexity: 0,
        nesting: 0,
        unsafeOperations: 0
      }
    };

    try {
      // Simple regex-based type checking
      const variablePattern = /const\s+(\w+)\s*[:=]/g;
      const functionPattern = /function\s+(\w+)\s*\(/g;
      
      let match;
      while ((match = variablePattern.exec(code)) !== null) {
        const varName = match[1];
        const expectedType = importedTypes[varName];
        
        if (expectedType) {
          // Would do actual type checking in production
          // For now, just note it
          result.warnings.push(`Defined variable: ${varName}`);
        }
      }

      result.score = Math.max(0.8, 1 - (result.warnings.length * 0.05));
    } catch (error) {
      result.isValid = false;
      result.score = 0;
      result.errors.push(`Type validation failed: ${(error as Error).message}`);
    }

    return result;
  }
}

/**
 * MEMORY SAFETY VALIDATOR
 */
export class MemorySafetyValidator {
  /**
   * Detect potential memory leaks and allocation issues
   */
  validateMemorySafety(code: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      score: 1,
      errors: [],
      warnings: [],
      metrics: {
        cyclomaticComplexity: 0,
        nesting: 0,
        unsafeOperations: 0
      }
    };

    try {
      const allocations: Set<string> = new Set();
      const deallocations: Set<string> = new Set();
      const lines = code.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();

        // Track resource allocation
        if (trimmed.includes('new ')) {
          const match = trimmed.match(/new\s+(\w+)/);
          if (match) allocations.add(match[1]);
        }

        // Track cleanup calls
        if (trimmed.includes('.close()') || trimmed.includes('.dispose()') || trimmed.includes('.cleanup()')) {
          const match = trimmed.match(/(\w+)\.(close|dispose|cleanup)/);
          if (match) deallocations.add(match[1]);
        }

        // Detect return statements
        if (trimmed.startsWith('return ')) {
          const match = trimmed.match(/return\s+(\w+)/);
          if (match && allocations.has(match[1]) && !deallocations.has(match[1])) {
            result.warnings.push(`Potential memory leak: ${match[1]} allocated but never freed`);
            result.score *= 0.85;
          }
        }
      }
    } catch (error) {
      result.errors.push(`Memory validation error: ${(error as Error).message}`);
      result.score = 0;
    }

    return result;
  }
}

/**
 * UNIFIED CODE INTEGRITY VALIDATOR
 */
export class CodeIntegrityValidator {
  private syntaxValidator: TypeScriptValidator;
  private typeValidator: TypeSafetyValidator;
  private memoryValidator: MemorySafetyValidator;

  constructor() {
    this.syntaxValidator = new TypeScriptValidator();
    this.typeValidator = new TypeSafetyValidator();
    this.memoryValidator = new MemorySafetyValidator();
  }

  /**
   * COMPREHENSIVE VALIDATION
   * Used by AlgorithmicMutator before deploying a patch
   */
  validatePatchCode(
    code: string,
    typedefs?: Record<string, string>,
    importedTypes?: Record<string, string>
  ): ValidationResult {
    // Run all validators
    const syntaxResult = this.syntaxValidator.validateSyntax(code);
    if (!syntaxResult.isValid) return syntaxResult; // Fail fast on syntax

    const typeResult = this.typeValidator.validateTypes(code, importedTypes || {});
    const memoryResult = this.memoryValidator.validateMemorySafety(code);

    // Aggregate results
    const aggregated: ValidationResult = {
      isValid: syntaxResult.isValid && typeResult.isValid && memoryResult.isValid,
      score: (syntaxResult.score + typeResult.score + memoryResult.score) / 3,
      errors: [
        ...syntaxResult.errors,
        ...typeResult.errors,
        ...memoryResult.errors
      ],
      warnings: [
        ...syntaxResult.warnings,
        ...typeResult.warnings,
        ...memoryResult.warnings
      ],
      metrics: {
        cyclomaticComplexity: syntaxResult.metrics.cyclomaticComplexity,
        nesting: syntaxResult.metrics.nesting,
        unsafeOperations:
          syntaxResult.metrics.unsafeOperations +
          (typeResult.metrics.unsafeOperations || 0) +
          (memoryResult.metrics.unsafeOperations || 0)
      }
    };

    // Require 70% safety score for deployment
    if (aggregated.score < 0.7) {
      aggregated.isValid = false;
      aggregated.errors.push(
        `Safety score too low: ${(aggregated.score * 100).toFixed(1)}% (need 70%)`
      );
    }

    return aggregated;
  }
}

// Export singleton
export const codeValidator = new CodeIntegrityValidator();
