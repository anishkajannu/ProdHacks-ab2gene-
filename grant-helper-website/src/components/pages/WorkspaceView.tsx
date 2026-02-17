import './EmptyState.css';

export default function WorkspaceView() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">✍️</div>
      <h2 className="empty-state-title">Your AI-Powered Grant Writing Workspace</h2>
      <p className="empty-state-description">
        Draft, refine, and perfect your grant applications with AI assistance.
        Answer key questions and let our AI help you craft compelling narratives
        that resonate with funders.
      </p>
      <div className="empty-state-actions">
        <button className="btn-primary">Create New Application</button>
        <button className="btn-secondary">View Templates</button>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">✨</div>
          <h3 className="feature-title">AI Draft Generation</h3>
          <p className="feature-text">
            Answer questions about your project and get AI-generated draft responses.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3 className="feature-title">Iterative Refinement</h3>
          <p className="feature-text">
            Edit and refine AI suggestions to match your organization's voice.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3 className="feature-title">Version Control</h3>
          <p className="feature-text">
            Track changes and maintain different versions of your applications.
          </p>
        </div>
      </div>
    </div>
  );
}
