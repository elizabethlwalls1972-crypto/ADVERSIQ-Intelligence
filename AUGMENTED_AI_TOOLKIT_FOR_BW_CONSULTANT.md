# Augmented AI Toolkit for BW Consultant (2026)

## Purpose
This toolkit operationalizes **Augmented AI** (human-centered AI collaboration) for BW Consultant across:
- Case study building
- Document/report development
- Letter drafting
- Gap-filling and decision readiness

## Augmented AI Operating Loop (Implemented)
1. **Understand** — ingest user/context signals at scale.
2. **Interpret** — detect patterns, intent mode, and missing fields.
3. **Reason** — generate next-best actions and development guidance.
4. **Learn (Human-in-the-loop)** — accept/reject/modify outcome paths.
5. **Assure** — keep human final control for ethics/compliance/context fit.

## Specific Software Tools (Recommended)

### 1) Research & Intelligence
- **Perplexity Enterprise** — source-grounded evidence synthesis for policy/market/counterparty intelligence.
- **Elicit** — structured evidence extraction for defensible case-study annexes.

### 2) Document Authoring
- **Microsoft 365 Copilot** — board-ready Word/Outlook drafting and review.
- **Google Gemini for Workspace** — collaborative editing and summarization in Docs/Sheets.
- **Grammarly Business** — final tone and clarity quality pass for formal submissions.

### 3) Workflow Orchestration (Human Approval)
- **LangGraph** — orchestrate human approval checkpoints and stateful decision flows.

### 4) Quality / Feedback / Evaluation
- **Humanloop** — capture accept/reject/modify feedback and prompt quality metrics.
- **PromptLayer** — prompt observability/versioning for regulated output auditability.
- **Label Studio** — supervised quality datasets from accepted/rejected outputs.

### 5) Developer Augmentation
- **GitHub Copilot** — coding acceleration for feature build, testing, and refactoring.

### 6) Knowledge Management
- **Atlassian Intelligence** — route consultant actions to Jira/Confluence implementation plans.
- **Slack AI** — operational retrieval of prior case decisions and rationale.

## BW App Integration Map

### Already Added in Codebase
- `server/routes/consultantCapabilities.ts`
  - Detects capability mode (`analysis`, `case_study`, `document_development`, `gap_fill`, `general_help`)
  - Extracts case signals and unresolved gaps
- `server/routes/augmentedAISupport.ts`
  - Curated tool registry and mode-based tool recommendation logic
  - Augmented AI 5-step snapshot generator
- `server/routes/ai.ts`
  - `/api/ai/consultant` now returns:
    - `augmentedAI` (5-step snapshot)
    - `recommendedTools` (mode-aware tool list)
    - `capabilityMode`, `capabilityTags`, `unresolvedGaps`
  - New endpoints:
    - `GET /api/ai/augmented-ai/tools`
    - `POST /api/ai/augmented-ai/snapshot`

### Suggested Next Frontend Wiring
- Show `unresolvedGaps` + one-click “answer this gap” in BW Consultant panel.
- Show `recommendedTools` by current mode with integration playbooks.
- Add approval controls (`accept`, `modify`, `reject`) per recommendation block.

## API Usage Examples

### Get all tools
`GET /api/ai/augmented-ai/tools`

### Get tool subset by mode
`GET /api/ai/augmented-ai/tools?mode=case_study`

### Build live augmented snapshot from user text
`POST /api/ai/augmented-ai/snapshot`
```json
{
  "message": "Build a case study and fill in missing gaps for board review.",
  "context": {
    "caseStudy": {
      "organizationName": "BWGA",
      "country": "Philippines"
    }
  }
}
```

## What this gives you now
- Human-centered AI control model embedded in BW Consultant backend.
- Mode-aware recommendations to improve case-study and document outcomes.
- Explicit gap closure path that keeps humans as final decision authority.
