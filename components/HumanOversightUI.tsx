import React, { useState, useEffect } from 'react';
import { getReviewQueue, approveAction } from '../core/human-oversight-explainability/reviewQueue';

export const HumanOversightUI: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    setQueue(getReviewQueue());
  }, []);

  const handleApprove = (index: number) => {
    approveAction(index);
    setQueue(getReviewQueue());
  };

  return (
    <div>
      <h2>Human Oversight Queue</h2>
      {queue.map((item, index) => (
        <div key={index}>
          <p>Action: {item.action}</p>
          <button onClick={() => handleApprove(index)}>Approve</button>
        </div>
      ))}
    </div>
  );
};
