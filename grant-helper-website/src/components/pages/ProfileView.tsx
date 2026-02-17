import './EmptyState.css';

export default function ProfileView() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🏢</div>
      <h2 className="empty-state-title">Create Your Organization Profile</h2>
      <p className="empty-state-description">
        Tell us about your nonprofit so we can find the perfect grants for you.
        This information will be used to match you with relevant opportunities and
        help draft compelling grant applications.
      </p>
      <div className="empty-state-actions">
        <button className="btn-primary">Get Started</button>
        <button className="btn-secondary">Import from EIN</button>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">📋</div>
          <h3 className="feature-title">Mission & Impact</h3>
          <p className="feature-text">
            Share your organization's mission, programs, and the communities you serve.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💰</div>
          <h3 className="feature-title">Financial Details</h3>
          <p className="feature-text">
            Provide your budget, funding history, and financial needs.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3 className="feature-title">Focus Areas</h3>
          <p className="feature-text">
            Identify your key program areas and target populations.
          </p>
        </div>
      </div>
    </div>
  );
}
