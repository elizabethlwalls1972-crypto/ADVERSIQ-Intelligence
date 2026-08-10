export const wellArchitectedAuditEngine = {
  async audit(): Promise<{ status: string; findings: string[] }> {
    return { status: 'disabled', findings: [] };
  },
};
