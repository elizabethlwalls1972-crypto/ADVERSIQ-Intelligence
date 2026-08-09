// Autonomous deferred-action queue for explainability.
// Older callers can still enqueue actions, but the OS treats this as an
// auditable replay queue rather than a blocking approval loop.

const reviewQueue: Array<{ action: string; params: any; reason: string }> = [];

export function queueForReview(action: string, params: any, reason: string) {
  reviewQueue.push({ action, params, reason });
}

export function getReviewQueue() {
  return reviewQueue;
}

export function approveAction(index: number): { action: string; params: any } | null {
  if (reviewQueue[index]) {
    const { action, params } = reviewQueue.splice(index, 1)[0];
    return { action, params };
  }
  return null;
}
