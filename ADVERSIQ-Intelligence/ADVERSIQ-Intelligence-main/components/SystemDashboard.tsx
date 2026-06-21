import React, { useState, useEffect } from 'react';
import { getReviewQueue, approveAction } from '../core/human-oversight-explainability/reviewQueue';

export const SystemDashboard: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [reports, setReports] = useState<string[]>([]);

  useEffect(() => {
    setQueue(getReviewQueue());
    // Simulate loading reports
    setReports(['report1.json', 'report2.json']);
  }, []);

  const handleApprove = (index: number) => {
    approveAction(index);
    setQueue(getReviewQueue());
  };

  return (
    <div>
      <h1>System Dashboard</h1>
      <section>
        <h2>Human Oversight Queue</h2>
        {queue.map((item, index) => (
          <div key={index}>
            <p>Action: {item.action}</p>
            <button onClick={() => handleApprove(index)}>Approve</button>
          </div>
        ))}
      </section>
      <section>
        <h2>Explainability Reports</h2>
        {reports.map(report => (
          <p key={report}>{report}</p>
        ))}
      </section>
    </div>
  );
};
