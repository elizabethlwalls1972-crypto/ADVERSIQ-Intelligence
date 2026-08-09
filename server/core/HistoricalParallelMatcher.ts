import * as fs from 'fs'
import * as path from 'path'

export interface HistoricalCase {
  id: string
  timestamp: string
  domain: string
  description: string
  actions: any[]
  outcomes: any[]
  successMetric: number
  context: Record<string, any>
}

export interface ParallelMatch {
  case: HistoricalCase
  similarity: number
  applicability: number
  lessons: string[]
  risks: string[]
}

/**
 * HistoricalParallelMatcher
 *
 * A case-based reasoning engine that stores historical problem-solving cases
 * and retrieves the most similar precedents for any new problem. It computes
 * multi-factor similarity scores (description text, domain, context, actions)
 * and derives an applicability percentage (0–100) that weights similarity
 * against domain alignment, recency, and historical success.
 *
 * Cases are persisted to disk as individual JSON files so the knowledge base
 * survives process restarts.
 */
export class HistoricalParallelMatcher {
  private cases: Map<string, HistoricalCase> = new Map()
  private domainIndex: Map<string, string[]> = new Map()
  private dataDir: string
  private readonly MAX_PARALLELS = 10
  private readonly SIMILARITY_THRESHOLD = 0.25

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'historical_parallels')
    this.ensureDataDir()
    this.loadCases()
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
  }

  /**
   * Stores a historical case in the knowledge base.
   * If a case with the same id already exists it is replaced.
   * @param caseData - The historical case to add.
   */
  async addHistoricalCase(caseData: HistoricalCase): Promise<void> {
    if (!caseData || typeof caseData !== 'object') {
      throw new Error('HistoricalCase must be a valid object')
    }

    if (!caseData.id || typeof caseData.id !== 'string') {
      throw new Error('HistoricalCase must have a valid string id')
    }

    try {
      this.cases.set(caseData.id, caseData)

      const domain = (caseData.domain || 'general').toLowerCase()
      if (!this.domainIndex.has(domain)) {
        this.domainIndex.set(domain, [])
      }
      const ids = this.domainIndex.get(domain)!
      if (!ids.includes(caseData.id)) {
        ids.push(caseData.id)
      }

      this.persistCase(caseData)
    } catch (err) {
      console.error('[HistoricalParallelMatcher] Failed to add historical case:', err)
      throw err
    }
  }

  /**
   * Finds the most similar historical cases (parallels) to a current problem.
   * Results are sorted by applicability (percentage) descending.
   * @param currentProblem - The problem to match against stored cases.
   * @param limit - Maximum number of parallels to return (default: 10).
   * @returns Array of parallel matches with similarity, applicability, lessons, and risks.
   */
  async findParallels(currentProblem: any, limit: number = this.MAX_PARALLELS): Promise<ParallelMatch[]> {
    if (!currentProblem || typeof currentProblem !== 'object') {
      throw new Error('currentProblem must be a valid object')
    }

    const matches: ParallelMatch[] = []

    for (const [, historicalCase] of this.cases) {
      const similarity = await this.computeSimilarity(currentProblem, historicalCase)

      if (similarity < this.SIMILARITY_THRESHOLD) {
        continue
      }

      const applicability = this.computeApplicability(currentProblem, historicalCase, similarity)
      const lessons = this.extractLessons(historicalCase)
      const risks = this.extractRisks(historicalCase)

      matches.push({
        case: historicalCase,
        similarity,
        applicability,
        lessons,
        risks,
      })
    }

    matches.sort((a, b) => b.applicability - a.applicability)

    return matches.slice(0, Math.max(0, limit))
  }

  /**
   * Retrieves all historical cases that belong to a specific domain.
   * @param domain - The domain to filter by (case-insensitive).
   * @returns Array of historical cases sorted by recency (newest first).
   */
  async getParallelsForDomain(domain: string): Promise<HistoricalCase[]> {
    if (!domain || typeof domain !== 'string') {
      throw new Error('domain must be a non-empty string')
    }

    const normalizedDomain = domain.toLowerCase()
    const caseIds = this.domainIndex.get(normalizedDomain) || []

    const results: HistoricalCase[] = []
    for (const id of caseIds) {
      const caseData = this.cases.get(id)
      if (caseData) {
        results.push(caseData)
      }
    }

    results.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return results
  }

  /**
   * Computes a similarity score between two cases.
   *
   * The score is a weighted combination of:
   * - Description text similarity (Jaccard on word tokens) — 40%
   * - Domain match (exact domain equality) — 25%
   * - Context similarity (key-value overlap) — 25%
   * - Action similarity (Jaccard on stringified actions) — 10%
   *
   * @param caseA - First case to compare.
   * @param caseB - Second case to compare.
   * @returns A similarity score between 0 and 1.
   */
  async computeSimilarity(caseA: any, caseB: any): Promise<number> {
    if (!caseA || !caseB) {
      return 0
    }

    const descriptionSimilarity = this.computeTextSimilarity(
      caseA.description || '',
      caseB.description || ''
    )

    const domainMatch = this.computeDomainMatch(
      caseA.domain || '',
      caseB.domain || ''
    )

    const contextSimilarity = this.computeContextSimilarity(
      caseA.context || {},
      caseB.context || {}
    )

    const actionSimilarity = this.computeActionSimilarity(
      caseA.actions || [],
      caseB.actions || []
    )

    const score =
      descriptionSimilarity * 0.4 +
      domainMatch * 0.25 +
      contextSimilarity * 0.25 +
      actionSimilarity * 0.1

    return Math.min(Math.max(score, 0), 1)
  }

  /**
   * Retrieves the single best precedent for a given problem.
   * @param problem - The problem to find a precedent for.
   * @returns The highest-applicability historical case, or null if no match is found.
   */
  async getBestPrecedent(problem: any): Promise<HistoricalCase | null> {
    const parallels = await this.findParallels(problem, 1)

    if (parallels.length === 0) {
      return null
    }

    return parallels[0].case
  }

  /**
   * Computes an applicability percentage (0–100) for a historical case
   * given the current problem. The score weights:
   * - Similarity score — 35%
   * - Domain match — 25%
   * - Recency factor — 20%
   * - Historical success metric — 20%
   * @param problem - The current problem.
   * @param historicalCase - A stored historical case.
   * @param similarity - Pre-computed similarity score (0–1).
   * @returns Applicability percentage between 0 and 100.
   */
  private computeApplicability(
    problem: any,
    historicalCase: HistoricalCase,
    similarity: number
  ): number {
    const domainMatch = this.computeDomainMatch(
      problem.domain || '',
      historicalCase.domain || ''
    )

    const recencyFactor = this.computeRecencyFactor(historicalCase.timestamp)
    const successFactor = historicalCase.successMetric || 0.5

    const applicability =
      similarity * 35 +
      domainMatch * 25 +
      recencyFactor * 20 +
      successFactor * 20

    return Math.round(Math.min(Math.max(applicability, 0), 100))
  }

  /**
   * Token-based Jaccard similarity for two text strings.
   */
  private computeTextSimilarity(textA: string, textB: string): number {
    if (!textA || !textB) return 0

    const tokenize = (s: string): Set<string> => {
      return new Set(
        s.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 1)
      )
    }

    const tokensA = tokenize(textA)
    const tokensB = tokenize(textB)

    const intersection = new Set([...tokensA].filter(t => tokensB.has(t)))
    const union = new Set([...tokensA, ...tokensB])

    if (union.size === 0) return 0
    return intersection.size / union.size
  }

  /**
   * Returns 1.0 for an exact (case-insensitive) domain match, 0.0 otherwise.
   */
  private computeDomainMatch(domainA: string, domainB: string): number {
    if (!domainA || !domainB) return 0
    return domainA.toLowerCase() === domainB.toLowerCase() ? 1.0 : 0.0
  }

  /**
   * Computes overlap between context key-value pairs.
   * String values use text similarity; other values use strict equality.
   */
  private computeContextSimilarity(
    contextA: Record<string, any>,
    contextB: Record<string, any>
  ): number {
    const keysA = Object.keys(contextA)
    const keysB = Object.keys(contextB)

    if (keysA.length === 0 && keysB.length === 0) return 1.0
    if (keysA.length === 0 || keysB.length === 0) return 0.3

    const allKeys = new Set([...keysA, ...keysB])
    let matches = 0

    for (const key of allKeys) {
      const valA = contextA[key]
      const valB = contextB[key]

      if (valA === undefined || valB === undefined) {
        continue
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        const textSim = this.computeTextSimilarity(valA, valB)
        if (textSim > 0.5) matches++
      } else if (valA === valB) {
        matches++
      }
    }

    return matches / allKeys.size
  }

  /**
   * Computes Jaccard similarity between two action arrays after
   * stringifying each action element.
   */
  private computeActionSimilarity(actionsA: any[], actionsB: any[]): number {
    if (actionsA.length === 0 && actionsB.length === 0) return 1.0
    if (actionsA.length === 0 || actionsB.length === 0) return 0

    const stringify = (actions: any[]): Set<string> => {
      return new Set(
        actions.map(a =>
          typeof a === 'string' ? a.toLowerCase() : JSON.stringify(a).toLowerCase()
        )
      )
    }

    const setA = stringify(actionsA)
    const setB = stringify(actionsB)

    const intersection = new Set([...setA].filter(t => setB.has(t)))
    const union = new Set([...setA, ...setB])

    return union.size > 0 ? intersection.size / union.size : 0
  }

  /**
   * Recency factor: recent cases are more applicable (0–1).
   * Decays step-wise with age in days.
   */
  private computeRecencyFactor(timestamp: string): number {
    try {
      const caseTime = new Date(timestamp).getTime()
      const now = Date.now()
      const ageMs = now - caseTime
      const ageDays = ageMs / (1000 * 60 * 60 * 24)

      if (ageDays < 0) return 1.0
      if (ageDays <= 7) return 1.0
      if (ageDays <= 30) return 0.8
      if (ageDays <= 90) return 0.6
      if (ageDays <= 365) return 0.4
      return 0.2
    } catch {
      return 0.5
    }
  }

  /**
   * Extracts lessons from the outcomes of a successful historical case.
   */
  private extractLessons(historicalCase: HistoricalCase): string[] {
    const lessons: string[] = []

    if (Array.isArray(historicalCase.outcomes)) {
      for (const outcome of historicalCase.outcomes) {
        if (typeof outcome === 'string' && historicalCase.successMetric > 0.5) {
          lessons.push(outcome)
        } else if (
          typeof outcome === 'object' &&
          outcome !== null &&
          outcome.success === true
        ) {
          lessons.push(outcome.description || JSON.stringify(outcome))
        }
      }
    }

    if (lessons.length === 0 && historicalCase.successMetric > 0.5) {
      lessons.push(
        `Case achieved success metric of ${(historicalCase.successMetric * 100).toFixed(1)}%`
      )
    }

    return lessons
  }

  /**
   * Extracts risks from the outcomes of an unsuccessful historical case.
   */
  private extractRisks(historicalCase: HistoricalCase): string[] {
    const risks: string[] = []

    if (Array.isArray(historicalCase.outcomes)) {
      for (const outcome of historicalCase.outcomes) {
        if (typeof outcome === 'string' && historicalCase.successMetric < 0.5) {
          risks.push(outcome)
        } else if (
          typeof outcome === 'object' &&
          outcome !== null &&
          outcome.success === false
        ) {
          risks.push(outcome.description || JSON.stringify(outcome))
        }
      }
    }

    if (risks.length === 0 && historicalCase.successMetric < 0.5) {
      risks.push(
        `Case had low success metric of ${(historicalCase.successMetric * 100).toFixed(1)}% - apply with caution`
      )
    }

    return risks
  }

  /**
   * Persists a historical case to disk as a JSON file.
   */
  private persistCase(caseData: HistoricalCase): void {
    try {
      const filename = path.join(this.dataDir, `${caseData.id}.json`)
      fs.writeFileSync(filename, JSON.stringify(caseData, null, 2))
    } catch (err) {
      console.error('[HistoricalParallelMatcher] Failed to persist case:', err)
    }
  }

  /**
   * Loads all persisted historical cases from disk on initialization.
   */
  private loadCases(): void {
    try {
      if (!fs.existsSync(this.dataDir)) return

      const files = fs.readdirSync(this.dataDir).filter(f => f.endsWith('.json'))

      for (const file of files) {
        try {
          const filepath = path.join(this.dataDir, file)
          const content = fs.readFileSync(filepath, 'utf-8')
          const caseData = JSON.parse(content) as HistoricalCase

          if (caseData.id && caseData.domain) {
            this.cases.set(caseData.id, caseData)

            const domain = caseData.domain.toLowerCase()
            if (!this.domainIndex.has(domain)) {
              this.domainIndex.set(domain, [])
            }
            const ids = this.domainIndex.get(domain)!
            if (!ids.includes(caseData.id)) {
              ids.push(caseData.id)
            }
          }
        } catch (parseError) {
          console.error(
            '[HistoricalParallelMatcher] Failed to parse case file:',
            file,
            parseError
          )
        }
      }
    } catch (err) {
      console.error('[HistoricalParallelMatcher] Failed to load cases:', err)
    }
  }

  /**
   * Returns the total number of stored historical cases.
   */
  getCaseCount(): number {
    return this.cases.size
  }

  /**
   * Retrieves a specific historical case by its id.
   * @param id - The case id to look up.
   * @returns The historical case, or undefined if not found.
   */
  getCase(id: string): HistoricalCase | undefined {
    return this.cases.get(id)
  }

  /**
   * Returns all unique domains in the knowledge base.
   * @returns Array of domain strings.
   */
  getDomains(): string[] {
    return Array.from(this.domainIndex.keys())
  }

  /**
   * Removes a historical case from the knowledge base and disk.
   * @param id - The id of the case to remove.
   * @returns True if the case was removed, false if it was not found.
   */
  async removeCase(id: string): Promise<boolean> {
    const existing = this.cases.get(id)
    if (!existing) return false

    this.cases.delete(id)

    const domain = (existing.domain || 'general').toLowerCase()
    const ids = this.domainIndex.get(domain)
    if (ids) {
      const idx = ids.indexOf(id)
      if (idx !== -1) ids.splice(idx, 1)
      if (ids.length === 0) this.domainIndex.delete(domain)
    }

    try {
      const filepath = path.join(this.dataDir, `${id}.json`)
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    } catch (err) {
      console.error('[HistoricalParallelMatcher] Failed to remove case file:', id, err)
    }

    return true
  }
}

export default HistoricalParallelMatcher
