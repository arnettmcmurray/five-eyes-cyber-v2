import { useEffect } from 'react';

export default function PrivacyPolicyPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative z-10 w-full">
      <div className="max-w-4xl mx-auto pt-16 px-8 pb-24">
        <h1
          className="font-display font-black uppercase tracking-widest mb-2"
          style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: 'var(--gold-accent)' }}
        >
          Privacy Policy
        </h1>
        <p className="text-xs font-mono mb-10" style={{ color: 'var(--text-dim)' }}>
          Five Eyes Ltd — fiveeyesltd.com
        </p>

        <div
          className="space-y-8 leading-relaxed rounded-2xl p-8"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <LegalSection title="Introduction">
            <p className="text-sm">
              Five Eyes LTD ("We" or "Us") is committed to protecting and respecting your privacy in line with
              current legislation. This Statement of Privacy applies to Five Eyes LTD and governs data collection
              and usage. Unless otherwise noted, all references to Five Eyes LTD include{' '}
              <a href="https://fiveeyesltd.com" target="_blank" rel="noopener noreferrer"
                className="hover:underline" style={{ color: 'var(--gold-accent)' }}>
                https://fiveeyesltd.com
              </a>.
            </p>
            <p className="text-sm mt-3">
              The Five Eyes LTD websites are used for marketing purposes and as an online training site. By using
              our websites, you consent to the data practices described in this statement.
            </p>
            <p className="text-sm mt-3">
              The Five Eyes LTD products and services use your Personal Data collected manually from you and from
              any applications you may link to your account. Please note that any apps you integrate with the
              Five Eyes LTD service are subject to their own terms and privacy policy.
            </p>
          </LegalSection>

          <LegalSection title="About Five Eyes LTD">
            <p className="text-sm">Five Eyes LTD is a registered company in the United Kingdom.</p>
            <ul className="text-sm mt-2 space-y-1" style={{ color: 'var(--text-muted)' }}>
              <li>Company Number: 16616326</li>
              <li>Registered Office Address: 20 Wenlock Road, London, England, N1 7GU</li>
            </ul>
          </LegalSection>

          <LegalSection title="Definitions">
            <ul className="text-sm space-y-2">
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Personal Data</span> — Data relating to a living individual who can be identified from that data.</li>
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Data Controller</span> — Determines the purposes and manner in which personal data is processed.</li>
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Data Processor</span> — Processes data on behalf of the Data Controller. We adhere to GDPR legislation and related data protection requirements.</li>
            </ul>
          </LegalSection>

          <LegalSection title="What Data We Use">
            <ul className="text-sm space-y-2">
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Personal Data</span> — Collected via email, contact forms, subscriptions, or purchases. Used for service delivery and, if consented, marketing communications.</li>
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cookies</span> — Small text files to improve site experience and safeguard privacy. Types include strictly necessary, performance, functionality, and advertising cookies. For more info visit{' '}
                <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer"
                  className="hover:underline" style={{ color: 'var(--gold-accent)' }}>www.allaboutcookies.org</a>.</li>
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Web Beacons</span> — Used in webpages and emails for fraud detection and tracking engagement.</li>
            </ul>
          </LegalSection>

          <LegalSection title="Who We Share Your Data With">
            <p className="text-sm mb-2">We use third-party providers to fulfil our services:</p>
            <ul className="text-sm space-y-2">
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Paypal Inc</span> — Payment processing (Name, Address, Email, Phone, Credit Card details)</li>
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Stripe Inc</span> — Payment processing (same data as above)</li>
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Go High Level</span> — CRM and marketing automation (Name, Email, survey answers)</li>
              <li><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Hyros</span> — Tracking (Name, Email, survey answers)</li>
            </ul>
          </LegalSection>

          <LegalSection title="Where We Store Your Data">
            <p className="text-sm">All Data is stored within EEA servers or providers adhering to the EU-US Privacy Shield.</p>
          </LegalSection>

          <LegalSection title="How We Use Your Data">
            <ul className="text-sm space-y-2">
              <li>To provide the service (Name, Email, Address, Company information).</li>
              <li>To improve our services (feedback, contact via email).</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p className="text-sm mt-3">We never share identifiable data beyond service fulfilment.</p>
          </LegalSection>

          <LegalSection title="How Long We Keep Your Data">
            <p className="text-sm">We retain Personal Data for approximately 7 years or longer if legally required.</p>
          </LegalSection>

          <LegalSection title="Your Rights">
            <p className="text-sm mb-2">You may contact us to:</p>
            <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'var(--text-muted)' }}>
              <li>Correct or delete your Personal Data.</li>
              <li>Withdraw consent for data usage.</li>
              <li>Stop direct marketing.</li>
              <li>Request a copy of your data ("subject access request").</li>
              <li>Request data portability.</li>
              <li>Object to automated decisions.</li>
              <li>Restrict or object to data use.</li>
            </ul>
          </LegalSection>

          <LegalSection title="How to Contact Us">
            <p className="text-sm">
              Email:{' '}
              <a href="mailto:info@fiveeyesltd.com"
                className="hover:underline" style={{ color: 'var(--gold-accent)' }}>
                info@fiveeyesltd.com
              </a>
            </p>
          </LegalSection>

          <LegalSection title="Complaints">
            <p className="text-sm">You can complain to the ICO:</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF<br />
              Tel: 0303 123 1113 or 01625 545 745
            </p>
            <p className="text-sm mt-2">
              <a href="https://ico.org.uk/global/contact-us/email/" target="_blank" rel="noopener noreferrer"
                className="hover:underline" style={{ color: 'var(--gold-accent)' }}>
                Contact via ICO website
              </a>
            </p>
          </LegalSection>

          <LegalSection title="Changes to this Privacy Statement">
            <p className="text-sm">
              We may update this Privacy Statement from time to time. We will notify you of changes where required by law.
            </p>
          </LegalSection>
        </div>
      </div>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-sm font-black uppercase tracking-widest mb-3"
        style={{ color: 'var(--gold-accent)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
