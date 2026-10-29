import React from 'react';

const TimelineView = ({
  decisions,
  expandedId,
  onToggle,
  comments,
}) => {
  const byMonth = decisions.reduce((acc, d) => {
    const date = d.decision_taken_date
      ? new Date(d.decision_taken_date)
      : new Date(d.decision_due_date);
    const month = date.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
    (acc[month] ||= []).push(d);
    return acc;
  }, {});

  const sortedMonths = Object.keys(byMonth).sort((a, b) => {
    return new Date(`${b} 1`) - new Date(`${a} 1`);
  });

  return (
    <div className="timeline">
      <div className="timeline__spine" />

      {sortedMonths.map((month) => (
        <div className="timeline__month" key={month}>
          <div className="timeline__month-label">{month}</div>

          {byMonth[month].map((decision, index) => {
            const isOpen = expandedId === decision.decision_id;
            return (
              <div
                key={decision.decision_id}
                className={
                  'timeline__row ' +
                  (index % 2 === 0
                    ? 'timeline__row--left'
                    : 'timeline__row--right')
                }
              >
                <div
                  className={
                    'timeline__card' + (isOpen ? ' timeline__card--active' : '')
                  }
                  onClick={() => onToggle(decision.decision_id)}
                >
                  {decision.decision_name}
                </div>

                {isOpen && (
                  <div className="timeline__popover">
                    <h4>Decision Details</h4>
                    <p>
                      Due:{' '}
                      {new Date(decision.decision_due_date).toLocaleDateString()}
                    </p>
                    <p>
                      Taken:{' '}
                      {decision.decision_taken_date
                        ? new Date(
                            decision.decision_taken_date
                          ).toLocaleDateString()
                        : '--'}
                    </p>
                    <p>Details: {decision.user_statement}</p>
                    <p>
                      Tags:{' '}
                      {decision.tags?.map((t) => (
                        <span key={t.id} className="decision-tag">
                          {t.tag_name}
                        </span>
                      ))}
                    </p>
                    <p>Reasons:</p>
                    {decision.decision_reason?.map((r) => (
                      <p key={r.id}>• {r.decision_reason_text}</p>
                    ))}
                    <p>Comments: {comments[decision.decision_id]?.length ?? 0}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TimelineView;