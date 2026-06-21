import { runLiveGlobalMatters } from '../services/nsil/live_global_matter_runner';

const args = parseArgs(process.argv.slice(2));

const result = await runLiveGlobalMatters({
  outputDir: args.outputDir,
  cityLimitPerSector: args.cityLimitPerSector ? Number(args.cityLimitPerSector) : undefined,
  maxMatters: args.maxMatters ? Number(args.maxMatters) : undefined,
  minMatterScore: args.minMatterScore ? Number(args.minMatterScore) : undefined,
  continuous: args.continuous === 'true',
  intervalMinutes: args.intervalMinutes ? Number(args.intervalMinutes) : undefined,
});

if (result) {
  console.log('\nLive global regional development run complete');
  console.log(`Run ID: ${result.runId}`);
  console.log(`Accepted matters: ${result.acceptedMatters}/${result.totalMattersGenerated}`);
  console.log(`Countries scanned: ${result.countriesScanned.join(', ')}`);
  console.log(`Harness trajectories: ${result.harness.trajectoriesObserved}`);
  console.log(`Refiner changes: ${result.harness.refinerChanges}`);
  console.log(
    `p/G/K/M edits: prompt=${result.harness.promptEdits}, subagents=${result.harness.subagentEdits}, skills=${result.harness.skillEdits}, memory=${result.harness.harnessMemoryEdits}`,
  );
  console.log('Output files:');
  for (const file of result.outputFiles) {
    console.log(`- ${file}`);
  }

  console.table(result.matters.slice(0, 10).map((matter) => ({
    score: matter.score,
    city: `${matter.city.city}, ${matter.city.country}`,
    sector: matter.sector,
    issue: matter.issueTitle,
    nsilConfidence: matter.nsil?.confidence,
  })));
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
