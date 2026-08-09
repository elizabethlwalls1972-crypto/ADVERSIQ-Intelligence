import { runContinualHarnessAudit } from '../services/nsil/continual_harness_auditor';

const args = parseArgs(process.argv.slice(2));

const report = await runContinualHarnessAudit({
  rootDir: process.cwd(),
  outputDir: args.outputDir,
  runLiveProbe: args.liveProbe === 'true',
  liveProbeMaxMatters: args.liveProbeMaxMatters ? Number(args.liveProbeMaxMatters) : undefined,
});

console.log('\nContinual Harness audit complete');
console.log(`Run ID: ${report.runId}`);
console.log(`Files scanned: ${report.scannedFiles}`);
console.log(`Text files scanned: ${report.scannedTextFiles}`);
console.log(`Findings: critical=${report.summary.critical}, high=${report.summary.high}, medium=${report.summary.medium}, low=${report.summary.low}`);
console.log(`Production status: ${report.summary.productionStatus}`);
console.log('Capability checks:');
for (const check of report.capabilityChecks) {
  console.log(`- ${check.status.toUpperCase()} ${check.label}: ${check.evidence}`);
}
console.log('Output files:');
for (const file of report.outputFiles) {
  console.log(`- ${file}`);
}

if (report.summary.productionStatus === 'blocked') {
  process.exitCode = 1;
}

function parseArgs(values: string[]): Record<string, string> {
  return values.reduce<Record<string, string>>((acc, value, index) => {
    if (value.startsWith('--')) {
      const key = value.slice(2);
      const next = values[index + 1];
      acc[key] = next && !next.startsWith('--') ? next : 'true';
    }
    return acc;
  }, {});
}
