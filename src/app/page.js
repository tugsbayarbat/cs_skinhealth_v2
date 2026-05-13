import Link from 'next/link';

export const metadata = {
  title: 'Skin Care Assistant',
  description: 'A multimodal AI system for preliminary dermatological assessment, combining computer vision and conversational reasoning',
  viewport: 'width=device-width, initial-scale=1',
};

const PLAN_ITEMS = [
  {
    num: '01',
    title: 'Project Description',
    body: (
      <>
        <p>The Skin Care Assistant combines image analysis and conversational reasoning into a single multimodal pipeline. Instead of predicting a single class label, we use a fine-tuned DenseNet-121 to extract visual features that are projected into the embedding space of the language model via a light MLP connector. This enables the system to make joint reasoning about morphological cues - texture, scaling, erythema - along with patient reported symptoms.</p>
        <p style={{ marginTop: '1rem' }}>The assistant is now focusing on three dermatological categories: acne, eczema and psoriasis. All responses are formulated as a provisional decision support with explicit disclaimers and advice to consult a dermatologist.</p>
      </>
    ),
  },
  {
    num: '02',
    title: 'Key Features',
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <strong>Multimodal joint diagnosis</strong><br />
          DenseNet-121 visual features into the LLaMA embedding space, thus enabling a single reasoning pass over the image and the collected symptoms, as compared to treating the two modalities as independent signals.
        </div>
        <div>
          <strong>Task-specific LoRA adapters</strong><br />
          A common base model with a LoRA adapter on top for each task: symptom collection, joint diagnosis, grounded Q&A. This decouples behaviours that interfere with each other in single-adapter fine-tuning at little overhead. The orchestrator dynamically switches the adapters at runtime.
        </div>
        <div>
          <strong>Structured symptom collection</strong><br />
          A fine-tuned anamnesis protocol enforces a one-question-at-a-time policy and emits an explicit termination signal when collection is complete, giving the orchestrator a reliable handoff to the visual pipeline.
        </div>
        <div>
          <strong>Retrieval-augmented follow-up</strong><br />
          After diagnosis delivery, follow-up questions are answered through a RAG pipeline that combines dense retrieval (ChromaDB), lexical retrieval (BM25), reciprocal rank fusion, and reranking — grounding responses in a curated knowledge base rather than parametric memory.
        </div>
      </div>
    ),
  },
];

const TEAM = [
  {
    name: 'Tugsbayar Bat-Erdene',
    role: 'Master of Computing (Computer Science), Curtin University',
    initials: 'T',
    color: '#6B35D9',
    image: null,
    linkedin: 'https://www.linkedin.com/in/tugsbayar-bat/',
  },
  {
    name: 'Enkhjargal Togoo',
    role: 'Master of Computing (Artificial Intelligence), Curtin University',
    initials: 'E',
    color: '#3B82F6',
    image: null,
    linkedin: 'https://www.linkedin.com/in/enkhjargal-togoo-7b6063163/',
  },
  {
    name: 'Rai Sanda',
    role: 'Master of Computing (Artificial Intelligence), Curtin University',
    initials: 'R',
    color: '#10B981',
    image: null,
    linkedin: null,
  },
  {
    name: 'Romina Lopez',
    role: 'Master of Computing (Artificial Intelligence), Curtin University',
    initials: 'R',
    color: '#F59E0B',
    image: null,
    linkedin: 'https://www.linkedin.com/in/romina-lopez-ai/',
  },
  {
    name: 'Santiago Boxiga',
    role: 'Master of Computing (Artificial Intelligence), Curtin University',
    initials: 'S',
    color: '#EF4444',
    image: null,
    linkedin: 'https://www.linkedin.com/in/santiago-boxiga-4a2070143/',
  },
  {
    name: 'Tianhao Geng',
    role: 'Master of Computing (Computer Science), Curtin University',
    initials: 'T',
    color: '#8B5CF6',
    image: null,
    linkedin: null,
  },
];

const LinkedInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);


export default function HomePage() {
  return (
    <div className="intro-page">

      {/* NAV */}
      <nav className="intro-nav">
        <div className="intro-nav-logo">
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#6B35D9" />
            <path d="M18 8C12.477 8 8 12.477 8 18s4.477 10 10 10 10-4.477 10-10S23.523 8 18 8zm0 3a7 7 0 1 1 0 14A7 7 0 0 1 18 11zm0 2a5 5 0 1 0 0 10A5 5 0 0 0 18 13z" fill="white" />
          </svg>
          SkinHealth
        </div>
        <Link href="/chat" className="intro-try-btn">Try it out →</Link>
      </nav>

      <div className="intro-content">

        {/* HEADER */}
        <header className="intro-header">
          <p className="intro-label">COMPUTER SCIENCE PROJECT</p>
          <h1 className="intro-title">Skin Care Assistant</h1>
          <p className="intro-desc">
            Lightweight multimodal AI system that integrates DenseNet for visual feature extraction and a fine-tuned LLaMA 3.2 3B language model to provide image-aware dermatological guidance in a structured conversational manner.
          </p>
          <Link href="/chat" className="intro-hero-btn">Try it out →</Link>
        </header>

        <hr className="intro-divider" />

        {/* PROJECT PLAN */}
        <section className="intro-section" id="plan">
          <div className="intro-plan-list">
            {PLAN_ITEMS.map((item) => (
              <div key={item.num} className="intro-plan-item">
                <div className="intro-num">{item.num}</div>
                <h2 className="intro-plan-heading">{item.title.toUpperCase()}</h2>
                <div className="intro-plan-body">{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="intro-divider" />

        {/* TEAM */}
        <section className="intro-section" id="team">
          <p className="intro-label">THE TEAM</p>
          <div className="intro-team-list">
            {TEAM.map((m, i) => (
              <div key={i} className="intro-team-row">
                {/* Avatar */}
                <div className="intro-team-avatar" style={{ background: m.color }}>
                  {m.image
                    ? <img src={m.image} alt={m.name} className="intro-team-avatar-img" />
                    : m.initials
                  }
                </div>

                {/* Name + role */}
                <div className="intro-team-info">
                  {m.linkedin
                    ? <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="intro-team-name intro-team-name-link">{m.name}</a>
                    : <span className="intro-team-name">{m.name}</span>
                  }
                  <span className="intro-team-role">{m.role}</span>
                </div>

                {/* LinkedIn icon */}
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="intro-linkedin-icon" title={`${m.name} on LinkedIn`}>
                    <LinkedInIcon />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <hr className="intro-divider" />

        {/* FOOTER */}
        <footer className="intro-footer">
          <span>COMPUTER SCIENCE PROJECT · Curtin University 2026</span>
          <Link href="/chat" className="intro-try-btn">Try it out →</Link>
        </footer>

      </div>
    </div>
  );
}
