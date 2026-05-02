/* ─────────────────────────────────────────────────────────────────────────────
   InfoPage.jsx
   Renders static informational pages: Privacy Policy, Terms of Use,
   Cookie Policy, Accessibility, GDPR Info, FAQ, Help Center, How It Works.
   Content is selected by the `type` prop.
───────────────────────────────────────────────────────────────────────────── */
import { S } from '../styles/theme';

const UPDATED = '1 May 2025';

/* ── Shared layout helpers ─────────────────────────────────────────────────── */
const H2 = ({ children }) => (
  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginTop: 36, marginBottom: 12, borderBottom: '1px solid #1e293b', paddingBottom: 10 }}>
    {children}
  </h2>
);
const H3 = ({ children }) => (
  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginTop: 22, marginBottom: 8 }}>{children}</h3>
);
const P = ({ children }) => (
  <p style={{ color: '#94a3b8', fontFamily: 'system-ui', fontSize: 15, lineHeight: 1.8, marginBottom: 14 }}>{children}</p>
);
const UL = ({ items }) => (
  <ul style={{ color: '#94a3b8', fontFamily: 'system-ui', fontSize: 15, lineHeight: 1.8, paddingLeft: 22, marginBottom: 14 }}>
    {items.map((it, i) => <li key={i} style={{ marginBottom: 6 }}>{it}</li>)}
  </ul>
);
const Step = ({ n, title, desc }) => (
  <div style={{ display: 'flex', gap: 20, marginBottom: 28, alignItems: 'flex-start' }}>
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f59e0b18', border: '1px solid #f59e0b44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#f59e0b', fontSize: 18, flexShrink: 0 }}>{n}</div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9', marginBottom: 6 }}>{title}</div>
      <P>{desc}</P>
    </div>
  </div>
);
const Faq = ({ q, a }) => (
  <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 10, padding: '18px 22px', marginBottom: 12 }}>
    <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 15, marginBottom: 8 }}>Q: {q}</div>
    <div style={{ color: '#94a3b8', fontFamily: 'system-ui', fontSize: 14, lineHeight: 1.7 }}>A: {a}</div>
  </div>
);

/* ── Page content definitions ──────────────────────────────────────────────── */
const PAGES = {

  howItWorks: {
    tag: 'PLATFORM GUIDE',
    title: 'How It Works',
    subtitle: 'Everything you need to know to buy or sell a vehicle on AutoAuction LT.',
    body: () => (
      <>
        <H2>For Buyers</H2>
        <Step n="01" title="Create a Free Account" desc="Register with your name, email, and password. No credit card required. Your account is active immediately." />
        <Step n="02" title="Browse Vehicles" desc="Explore all listed vehicles with full specs, condition reports, damage notes, and high-resolution photos. Filter by category, status, or price." />
        <Step n="03" title="Place a Bid" desc="When an auction is live, place your bid. The minimum increment is €100 above the current highest bid. Your bid is recorded instantly — no admin approval needed." />
        <Step n="04" title="Win the Auction" desc="When the auction ends, the admin reviews all bids and selects the winner. You'll see your bid marked as WINNER in your dashboard. The admin contacts you to finalise the purchase." />

        <H2>For Sellers</H2>
        <Step n="01" title="Submit Your Interest" desc="Click 'Get Started' on the homepage and fill in your contact details and vehicle information. Our team will respond within 24 hours." />
        <Step n="02" title="Vehicle Inspection & Listing" desc="After we confirm your submission, an admin will create the listing with your vehicle's details, photos, starting bid, and condition report." />
        <Step n="03" title="Auction Goes Live" desc="The admin schedules and starts the auction. You can monitor bids in real time on the listing page." />
        <Step n="04" title="Sale Completed" desc="Once a winner is selected, the admin facilitates contact between you and the buyer. The transaction is completed offline." />

        <H2>Bidding Rules</H2>
        <UL items={[
          'All bids are final — you cannot retract a bid once placed.',
          'Minimum bid increment is €100 above the current highest bid.',
          'The auction admin selects the winning bid after the auction ends.',
          'AutoAuction LT acts as a platform only — we do not handle payments.',
          'Fraudulent bidding will result in account suspension.',
        ]} />

        <H2>Live Auction Features</H2>
        <P>All live auctions feature real-time bid updates visible to every user on the page — no refresh needed. A countdown timer shows exactly how much time remains. You can also leave comments on the listing to ask the seller questions.</P>
      </>
    ),
  },

  helpCenter: {
    tag: 'SUPPORT',
    title: 'Help Center',
    subtitle: 'Guides and answers for using the AutoAuction LT platform.',
    body: () => (
      <>
        <H2>Getting Started</H2>
        <H3>How do I create an account?</H3>
        <P>Click <strong style={{color:'#f59e0b'}}>Register</strong> in the top navigation. Fill in your first name, last name, email address, and a password. Your account is created immediately with buyer access.</P>
        <H3>I forgot my password — what do I do?</H3>
        <P>Currently, password reset is handled by contacting admin through the Contact Admin form. We are working on a self-service reset feature.</P>
        <H3>How do I upgrade to seller?</H3>
        <P>Submit the "Get Started" form on the homepage with your vehicle details. The admin team will review and set up your listing within 24 hours.</P>

        <H2>Bidding</H2>
        <H3>How do I place a bid?</H3>
        <P>Navigate to any live auction. On the right side panel, enter an amount at or above the minimum bid (current bid + €100) and click <strong style={{color:'#f59e0b'}}>Place Bid</strong>. Your bid is recorded instantly.</P>
        <H3>Can I cancel a bid?</H3>
        <P>No. All bids are final once placed. Please ensure you intend to purchase before bidding.</P>
        <H3>How are winners selected?</H3>
        <P>After the auction ends, the admin reviews the bid history and selects the winner — usually the highest bidder. The winning bid is marked in the Bids tab and the bidder is notified.</P>

        <H2>Account & Security</H2>
        <H3>How do I update my profile?</H3>
        <P>Log in and click your username in the top navigation, then go to Dashboard → Profile to update your name, email, phone, and country.</P>
        <H3>My account is blocked — what happened?</H3>
        <P>Accounts can be blocked by admin for violations of our Terms of Use (e.g. fraudulent bidding). Contact admin via the Report Issue form to appeal.</P>

        <H2>Technical Issues</H2>
        <H3>Bids are not updating in real time</H3>
        <P>The platform refreshes bid data every 500ms automatically. If you see stale data, try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R). If the issue persists, use the Report Issue form.</P>
        <H3>I can't upload photos to my listing</H3>
        <P>Photos must be JPG, PNG, or WebP and under 10 MB each. If you have problems, contact admin directly.</P>
      </>
    ),
  },

  faq: {
    tag: 'SUPPORT',
    title: 'Frequently Asked Questions',
    subtitle: 'Quick answers to the most common questions about AutoAuction LT.',
    body: () => (
      <>
        <H2>Platform & Accounts</H2>
        <Faq q="Is AutoAuction LT free to use?" a="Yes. Registration and browsing are completely free. There are no fees charged to buyers for participating in auctions. Seller listing terms are discussed with the admin team." />
        <Faq q="Who can bid on auctions?" a="Any registered and active user can bid on live auctions. You must be logged in to place a bid." />
        <Faq q="What countries can use the platform?" a="AutoAuction LT is currently focused on Lithuania and the Baltic region. Any user can register, but vehicle transactions are expected to comply with Lithuanian law." />
        <Faq q="Can I change my username?" a="Usernames cannot be changed after registration. Contact admin if you need assistance." />

        <H2>Auctions & Bidding</H2>
        <Faq q="What is the minimum bid increment?" a="€100 above the current highest bid. The platform enforces this automatically and will reject lower bids." />
        <Faq q="Can I see who else has bid?" a="Yes. The Bids tab on every listing shows all bids, bidder usernames, amounts, and timestamps in real time." />
        <Faq q="What happens after I win?" a="The admin marks your bid as the winner, which ends the auction. You will see your winning status in your Dashboard. The admin or seller will contact you at the email address on your account." />
        <Faq q="Can I bid on multiple auctions at the same time?" a="Yes, there is no restriction on bidding across multiple auctions simultaneously." />
        <Faq q="Is there a reserve price?" a="The starting bid acts as the minimum. If bids are below the seller's expectations, the admin may choose not to select a winner." />

        <H2>Listings & Vehicles</H2>
        <Faq q="How accurate are the condition reports?" a="Condition and damage fields are filled in by the listing admin based on seller-provided information and inspection. AutoAuction LT does not independently verify vehicle condition." />
        <Faq q="Can I inspect the vehicle before bidding?" a="The platform does not arrange inspections directly. Contact the seller through the listing comments or via admin before bidding." />
        <Faq q="What does LISTED status mean?" a="A listing with LISTED status has been added by admin but no auction has been scheduled yet. Check back later or contact admin for details." />

        <H2>Privacy & Data</H2>
        <Faq q="What data does AutoAuction LT store?" a="We store your registration details (name, email, phone, country), bid history, comments, and messages. See our Privacy Policy for full details." />
        <Faq q="Can I delete my account?" a="Account deletion requests must be submitted via the Report Issue form. Under GDPR you have the right to erasure." />
      </>
    ),
  },

  gdpr: {
    tag: 'LEGAL',
    title: 'GDPR Information',
    subtitle: `Your data rights under the General Data Protection Regulation. Last updated: ${UPDATED}`,
    body: () => (
      <>
        <H2>1. Data Controller</H2>
        <P>AutoAuction LT is operated by Fazle Rabbi Mahim as a Vytautas Magnus University term paper project. For data-related enquiries, contact: <strong style={{color:'#f59e0b'}}>admin@autoauction.lt</strong></P>

        <H2>2. What Personal Data We Collect</H2>
        <UL items={[
          'Registration data: first name, last name, email address, phone number, country',
          'Activity data: bids placed, comments posted, messages sent',
          'Seller inquiry data: name, email, phone, vehicle information, message text',
          'Technical data: login timestamps, IP address (server logs only)',
        ]} />

        <H2>3. Legal Basis for Processing</H2>
        <UL items={[
          'Contract performance — processing bids and auction participation',
          'Legitimate interest — platform security, fraud prevention',
          'Consent — seller inquiry form submissions',
        ]} />

        <H2>4. Your Rights Under GDPR</H2>
        <H3>Right of Access (Art. 15)</H3>
        <P>You may request a copy of all personal data we hold about you.</P>
        <H3>Right to Rectification (Art. 16)</H3>
        <P>You may correct inaccurate personal data via your Dashboard → Profile page at any time.</P>
        <H3>Right to Erasure (Art. 17)</H3>
        <P>You may request deletion of your account and associated data. Submit a request via the Report Issue form. We will process it within 30 days.</P>
        <H3>Right to Portability (Art. 20)</H3>
        <P>You may request your data in a machine-readable format (JSON/CSV). Contact admin to make this request.</P>
        <H3>Right to Object (Art. 21)</H3>
        <P>You may object to processing based on legitimate interest. This may limit your ability to use the platform.</P>

        <H2>5. Data Retention</H2>
        <P>Active account data is retained for the lifetime of your account. Bid records are retained for 3 years for legal compliance. Seller inquiry data is retained for 12 months. You may request early deletion at any time.</P>

        <H2>6. Third-Party Sharing</H2>
        <P>We do not sell, rent, or share personal data with third parties for marketing purposes. Data may be shared with law enforcement if required by Lithuanian or EU law.</P>

        <H2>7. Cookies</H2>
        <P>We use only essential session cookies required for login functionality. No tracking or advertising cookies are used. See our Cookie Policy for full details.</P>

        <H2>8. Contact for Data Requests</H2>
        <P>To exercise any of your GDPR rights, use the Report Issue form on this platform or email <strong style={{color:'#f59e0b'}}>admin@autoauction.lt</strong>. We respond within 30 calendar days.</P>
      </>
    ),
  },

  privacy: {
    tag: 'LEGAL',
    title: 'Privacy Policy',
    subtitle: `How AutoAuction LT collects, uses, and protects your personal data. Last updated: ${UPDATED}`,
    body: () => (
      <>
        <H2>1. Who We Are</H2>
        <P>AutoAuction LT ("we", "us", "our") is an online automobile auction platform operated as a Vytautas Magnus University academic project by Fazle Rabbi Mahim. This policy applies to all users of autoauction.lt.</P>

        <H2>2. Information We Collect</H2>
        <H3>Information you provide directly</H3>
        <UL items={[
          'Account registration: name, email address, password (hashed), phone number, country',
          'Bids placed on auctions including amount and timestamp',
          'Comments and messages you post on the platform',
          'Seller inquiry form submissions',
        ]} />
        <H3>Information collected automatically</H3>
        <UL items={[
          'Login session data and authentication tokens',
          'Browser type and operating system (server logs)',
          'IP address (retained in server logs for 30 days)',
        ]} />

        <H2>3. How We Use Your Information</H2>
        <UL items={[
          'To provide and operate the auction platform',
          'To authenticate your identity and maintain your session',
          'To process and record bids on auctions',
          'To notify you of winning bids and auction outcomes',
          'To respond to your support enquiries',
          'To prevent fraud and ensure platform security',
        ]} />

        <H2>4. Data Security</H2>
        <P>Passwords are stored using industry-standard hashing (PBKDF2/bcrypt). All API communication uses HTTPS in production. Authentication tokens are stored client-side in localStorage and sent via secure headers. We do not store payment card data.</P>

        <H2>5. Data Sharing</H2>
        <P>We do not sell or share your personal data with third parties for commercial purposes. Bidder usernames are publicly visible on auction listings as part of the transparent bidding process. Your email and phone number are only visible to platform administrators.</P>

        <H2>6. Your Rights</H2>
        <P>Under GDPR you have the rights of access, rectification, erasure, portability, and objection. See our GDPR Information page for full details on exercising these rights.</P>

        <H2>7. Cookies</H2>
        <P>We use only essential session cookies. No advertising or tracking cookies are used. See our Cookie Policy for details.</P>

        <H2>8. Changes to This Policy</H2>
        <P>We may update this policy from time to time. Continued use of the platform after changes constitutes acceptance of the revised policy. The "last updated" date at the top reflects the most recent revision.</P>

        <H2>9. Contact</H2>
        <P>For privacy-related enquiries: <strong style={{color:'#f59e0b'}}>admin@autoauction.lt</strong></P>
      </>
    ),
  },

  terms: {
    tag: 'LEGAL',
    title: 'Terms of Use',
    subtitle: `The rules governing your use of AutoAuction LT. Last updated: ${UPDATED}`,
    body: () => (
      <>
        <H2>1. Acceptance of Terms</H2>
        <P>By registering for or using AutoAuction LT, you agree to these Terms of Use. If you do not agree, do not use the platform.</P>

        <H2>2. Eligibility</H2>
        <UL items={[
          'You must be at least 18 years of age to register.',
          'You must provide accurate and truthful registration information.',
          'One account per person is permitted.',
          'Accounts created on behalf of others without authorisation are prohibited.',
        ]} />

        <H2>3. Bidding Rules</H2>
        <UL items={[
          'All bids are legally binding commitments to purchase if selected as the winner.',
          'Bids may not be retracted after submission.',
          'Shill bidding (bidding on your own listing or coordinating bids) is strictly prohibited.',
          'The minimum bid increment is €100 above the current highest bid.',
          'The platform reserves the right to void bids in cases of suspected fraud.',
        ]} />

        <H2>4. Seller Obligations</H2>
        <UL items={[
          'Sellers must provide accurate vehicle information, condition, and photographs.',
          'Sellers must honour the sale to the winning bidder.',
          'Misrepresentation of vehicle condition may result in account suspension and legal liability.',
        ]} />

        <H2>5. Prohibited Conduct</H2>
        <UL items={[
          'Fraudulent or deceptive activity of any kind',
          'Attempting to circumvent the bidding system',
          'Harassment of other users via comments or messages',
          'Uploading illegal, infringing, or offensive content',
          'Automated bots or scripts accessing the platform',
        ]} />

        <H2>6. Platform Role</H2>
        <P>AutoAuction LT is a marketplace platform only. We do not take ownership of vehicles, handle payments, or guarantee vehicle condition. Transactions are completed directly between buyers and sellers. The platform facilitates the connection and records bids transparently.</P>

        <H2>7. Disclaimer of Warranties</H2>
        <P>The platform is provided "as is" for academic demonstration purposes. We do not warrant uninterrupted service, data accuracy, or fitness for commercial use.</P>

        <H2>8. Governing Law</H2>
        <P>These terms are governed by the laws of the Republic of Lithuania. Disputes shall be resolved in Lithuanian courts.</P>
      </>
    ),
  },

  cookies: {
    tag: 'LEGAL',
    title: 'Cookie Policy',
    subtitle: `How AutoAuction LT uses cookies. Last updated: ${UPDATED}`,
    body: () => (
      <>
        <H2>1. What Are Cookies?</H2>
        <P>Cookies are small text files stored in your browser by websites you visit. They help websites remember your preferences and maintain login sessions between page loads.</P>

        <H2>2. Cookies We Use</H2>
        <H3>Essential / Strictly Necessary Cookies</H3>
        <P>AutoAuction LT uses only one category of cookie: session authentication. These are required for the login system to function and cannot be disabled without breaking core functionality.</P>
        <div style={{background:'#0d1117',border:'1px solid #1e293b',borderRadius:10,padding:'16px 20px',marginBottom:14,fontFamily:'system-ui',fontSize:13}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,color:'#64748b',fontWeight:700,marginBottom:10}}>
            <span>Cookie Name</span><span>Purpose</span><span>Duration</span><span>Type</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,color:'#94a3b8'}}>
            <span>authToken</span><span>Stores authentication token in localStorage</span><span>Session / Until logout</span><span>Essential</span>
          </div>
        </div>

        <H2>3. What We Do NOT Use</H2>
        <UL items={[
          'Advertising or targeting cookies',
          'Analytics cookies (e.g. Google Analytics)',
          'Social media tracking cookies',
          'Third-party marketing pixels',
        ]} />

        <H2>4. Managing Cookies</H2>
        <P>You can clear cookies and localStorage data at any time through your browser settings. Note that clearing authentication tokens will log you out of the platform. Most browsers allow you to block cookies entirely, but this will prevent login from working.</P>

        <H2>5. Changes</H2>
        <P>If we add new cookies in future, this policy will be updated and users notified via the platform.</P>
      </>
    ),
  },

  accessibility: {
    tag: 'LEGAL',
    title: 'Accessibility Statement',
    subtitle: `Our commitment to digital accessibility. Last updated: ${UPDATED}`,
    body: () => (
      <>
        <H2>Our Commitment</H2>
        <P>AutoAuction LT is committed to ensuring digital accessibility for all users. We aim to make our platform usable by people with visual, motor, auditory, and cognitive disabilities to the greatest extent practicable.</P>

        <H2>Conformance Status</H2>
        <P>We target WCAG 2.1 Level AA compliance. As an academic project, full compliance has not been audited, but the following measures have been implemented:</P>
        <UL items={[
          'Sufficient colour contrast ratios for text against backgrounds',
          'Keyboard-navigable interactive elements',
          'Semantic HTML structure with appropriate heading hierarchy',
          'Descriptive alt text on vehicle images',
          'Form labels and error messages for all input fields',
          'Focus indicators on interactive elements',
        ]} />

        <H2>Known Limitations</H2>
        <UL items={[
          'Some modal dialogs may not fully trap focus for screen reader users',
          'Real-time bid updates are not announced via ARIA live regions in all cases',
          'Some data tables may not include complete header markup for screen readers',
        ]} />

        <H2>Assistive Technologies</H2>
        <P>The platform has been tested with keyboard-only navigation. Screen reader compatibility with VoiceOver (macOS) and NVDA (Windows) is partially supported.</P>

        <H2>Feedback & Assistance</H2>
        <P>If you experience accessibility barriers on this platform, please contact us via the Report Issue form or email <strong style={{color:'#f59e0b'}}>admin@autoauction.lt</strong>. We will make reasonable efforts to accommodate your needs and respond within 14 days.</P>

        <H2>Formal Complaints</H2>
        <P>If you are unsatisfied with our response, you may contact the Lithuanian State Data Protection Inspectorate or your national disability rights organisation.</P>
      </>
    ),
  },
};

/* ── Main component ────────────────────────────────────────────────────────── */
export default function InfoPage({ type, setPage }) {
  const content = PAGES[type];
  if (!content) return null;
  const { tag, title, subtitle, body: Body } = content;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 60px 80px' }} className="fade-in">
      {/* Back */}
      <div onClick={() => setPage('home')} style={{ color: '#64748b', fontSize: 14, cursor: 'pointer', fontFamily: 'system-ui', marginBottom: 32 }}>
        ← Back to Home
      </div>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, letterSpacing: 3, fontFamily: 'system-ui', marginBottom: 10 }}>{tag}</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#f1f5f9', marginBottom: 12, lineHeight: 1.15 }}>{title}</h1>
        <p style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: 15, lineHeight: 1.7 }}>{subtitle}</p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #1e293b', marginBottom: 32 }} />

      {/* Body */}
      <Body />
    </div>
  );
}
