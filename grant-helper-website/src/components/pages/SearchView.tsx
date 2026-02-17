import './EmptyState.css';

export default function SearchView() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🔍</div>
      <h2 className="empty-state-title">Discover Grants Tailored to Your Mission</h2>
      <p className="empty-state-description">
        Search through thousands of grant opportunities matched to your organization's
        profile. Our AI helps you find grants with the highest likelihood of success.
      </p>
      <div className="empty-state-actions">
        <button className="btn-primary">Start Searching</button>
        <button className="btn-secondary">View Recommended</button>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3 className="feature-title">AI-Powered Matching</h3>
          <p className="feature-text">
            Smart algorithms match your profile to the most relevant grant opportunities.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3 className="feature-title">Real-Time Updates</h3>
          <p className="feature-text">
            Get notified about new grants and upcoming deadlines that match your criteria.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Success Insights</h3>
          <p className="feature-text">
            See success rates and competition levels for each grant opportunity.
          </p>
        </div>
      </div>
    </div>
  );
}
