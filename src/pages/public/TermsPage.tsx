import { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative z-10 w-full">
      <div className="max-w-4xl mx-auto pt-16 px-8 pb-24">
        <h1
          className="font-display font-black uppercase tracking-widest mb-2"
          style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: 'var(--gold-accent)' }}
        >
          Terms &amp; Conditions
        </h1>
        <p className="text-xs font-mono mb-10" style={{ color: 'var(--text-dim)' }}>
          Five Eyes Ltd — Last updated 10 September 2025
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
          <LegalSection title="Contact Us">
            <p className="text-sm">
              Five Eyes LTD ("we", "us", "our") is a registered company in the United Kingdom (Company Number
              16616326 — Registered Office Address 20 Wenlock Road, London, England, N1 7GU).
            </p>
            <p className="text-sm mt-3">
              If you have any queries about our Terms of Use, please get in touch with us by email at{' '}
              <a href="mailto:info@fiveeyesltd.com" className="hover:underline" style={{ color: 'var(--gold-accent)' }}>
                info@fiveeyesltd.com
              </a>{' '}
              or post (to our registered office, addressed for the attention of the "Website Administrator").
            </p>
          </LegalSection>

          <LegalSection title="Our Terms">
            <p className="text-sm">
              1. These Terms of Use set out the agreement between Five Eyes LTD and you and apply whenever you
              visit or use our website(s) or any related applications or downloads (together, the "Services").
              You should read these terms carefully and make sure that you fully understand them. Your use of the
              Services constitutes acceptance of these Terms of Use. If you do not agree to or understand these
              terms, you are not permitted to use the Services.
            </p>
            <p className="text-sm mt-3">
              2. Additional terms, such as our Privacy Policy (which, together with these Terms of Use, we shall
              refer to as the "Five Eyes LTD Terms"). We will endeavour to update these whenever necessary but
              cannot guarantee to do so and third-party app store providers and you may have to agree to
              additional terms in order to download, install and/or use our mobile application(s). Our Terms of
              Supply will apply to any paid-for service that we provide to you.
            </p>
          </LegalSection>

          <LegalSection title="Use of the Services">
            <div className="text-sm space-y-3">
              <p>1. "User Content" means any and all content uploaded to and/or shared, by a user of the Services, via the Services.</p>
              <p>2. User Content is not pre-screened by us. You are solely responsible for any User Content you create. The views expressed in such User Content do not represent the views or values of Five Eyes LTD.</p>
              <p>3. You will not create any User Content which is obscene, discriminatory, threatening, offensive, defamatory, abusive, in breach of confidence or privacy, or otherwise in violation of any applicable law, regulation or code. We reserve the right to remove any User Content that violates the Five Eyes LTD Terms.</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>4. You must not:</p>
              <ul className="list-none space-y-1 pl-4" style={{ color: 'var(--text-muted)' }}>
                <li>4.1. use the Services for any purpose other than your own personal use;</li>
                <li>4.2. access the Services using automated means;</li>
                <li>4.3. engage in any activities that violate these Terms of Use or any applicable laws or regulations;</li>
                <li>4.4. provide false personal details to us in registering as a Registered User;</li>
                <li>4.5. attempt to gain access to the account of, or impersonate, a third party;</li>
                <li>4.6. make use of the Services or act in a manner that is hateful, discriminatory or otherwise objectionable; or</li>
                <li>4.7. do anything that could impair the proper working of any part of the Services or users' access to the Services.</li>
              </ul>
              <p>5. You are responsible for ensuring that all persons who access the Services through your internet connection are aware of the Five Eyes LTD Terms and comply with them.</p>
            </div>
          </LegalSection>

          <LegalSection title="Use of the Services by Minors">
            <div className="text-sm space-y-3">
              <p>1. If you are under the age of 18, please review the Five Eyes LTD Terms with a parent or guardian and ensure that you both understand them.</p>
              <p>2. If you are under 16 years old, by registering with us you certify that your parent or guardian has expressed their consent to you becoming a Registered User.</p>
              <p>3. If you invite anyone under the age of 18 to use the Services, you agree to ensure that they understand the content and effect of the Five Eyes LTD Terms and agree to abide by them.</p>
            </div>
          </LegalSection>

          <LegalSection title="Changes to the Terms">
            <p className="text-sm">
              We keep the Terms under review and may change or update them from time to time. If we decide to do
              this, we will post such changes on our website(s), and your continued use of our Services shall
              constitute acceptance of these amendments.
            </p>
            <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
              These Terms of Use were last updated on 10 September 2025.
            </p>
          </LegalSection>

          <LegalSection title="Changes to the Services">
            <p className="text-sm">
              Subject to any rights that you may have under our Terms of Supply, we reserve the right to modify,
              restrict your access to or terminate the Services or any part of them, whether on a temporary or
              permanent basis, at any time. We will try to give you notice of any material changes by posting
              details on our website, and/or by emailing you if you are a Registered User.
            </p>
          </LegalSection>

          <LegalSection title="Technical Requirements">
            <p className="text-sm">
              You are responsible for ensuring that your system and internet connection are adequate to access
              and use the Services.
            </p>
          </LegalSection>

          <LegalSection title="Ownership of Content">
            <div className="text-sm space-y-3">
              <p>1. We are the owner or licensee of all the intellectual property in the Services (the "Five Eyes LTD Content").</p>
              <p>2. We grant you a limited, personal, non-transferable, non-sublicensable licence to use the Services and Five Eyes LTD Content solely to access and use the Services in accordance with the Five Eyes LTD Terms.</p>
              <p>3. You must not use any of the Five Eyes LTD Content for commercial purposes without acknowledgement of us as proprietor.</p>
              <p>4. You warrant that you are the owner or licensee of all User Content you create, that such content does not infringe any third-party intellectual property rights.</p>
              <p>5. You grant us a perpetual, worldwide, non-exclusive, irrevocable, royalty-free licence to store, copy, sub-licence and otherwise use any User Content you create at our sole discretion, in accordance with our Privacy Policy.</p>
              <p>6. If you wish to use any third-party User Content you must obtain consent from the relevant rights holder.</p>
            </div>
          </LegalSection>

          <LegalSection title="Termination or Suspension">
            <div className="text-sm space-y-3">
              <p>1. You may terminate your account and stop using the Services at any time by deleting your account at "settings &gt; manage account".</p>
              <p>2. We may suspend your access at any time for routine, planned or emergency maintenance or upgrades.</p>
              <p>3. We may at any time terminate or suspend your account and/or access to all or any part of the Services. Any breach of the Five Eyes LTD Terms will automatically terminate any licence granted to you.</p>
              <p>4. Our liability for any loss or damage arising from termination or suspension of your account is excluded to the fullest extent permitted by applicable law.</p>
              <p>5. If you have purchased storage space or other products, please refer to our Terms of Supply as to how termination will affect you.</p>
              <p>6. If we terminate your account, you will not create another one without our explicit written permission.</p>
            </div>
          </LegalSection>

          <LegalSection title="Disclaimers and Limitation of Liability">
            <div className="text-sm space-y-3">
              <p>1. To the fullest extent permitted by applicable law, all conditions, warranties and other terms which might otherwise be implied by statute or at law or in equity are expressly excluded. No representations, warranties or terms of any kind are made in respect of the Services.</p>
              <p>2. Neither we nor any of our data providers, affiliates, licensors, suppliers, successors and assignees give any warranty that the Services will be available at all times, uninterrupted, or free from error, virus or other harmful components.</p>
              <p>3. Our maximum aggregate liability under or in connection with these Terms of Use, whether in contract, tort or otherwise, shall in all circumstances be limited to five hundred pounds sterling (GBP £500).</p>
              <p>4. Nothing in these Terms limits our liability to you for direct or foreseeable losses as a result of our breach of the Terms, death or personal injury caused by our negligence, fraud, or any other liability which cannot be excluded or limited under applicable law.</p>
              <p>5. You agree to indemnify each Five Eyes LTD Party in full for losses, damages and reasonable costs suffered as a direct result of your use of the Services, breach of your obligations, or your creation of any User Content.</p>
            </div>
          </LegalSection>

          <LegalSection title="Linking">
            <div className="text-sm space-y-3">
              <p>1. The Services may contain links to third-party websites. We are not responsible for, nor do we endorse, such websites or their content. If you access any third-party websites linked to by the Services, you do so at your own risk.</p>
              <p>2. Save for linking to the home page of our website(s) in a fair manner, you agree not to link to or frame any part of our website(s) without our express written permission.</p>
            </div>
          </LegalSection>

          <LegalSection title="Miscellaneous">
            <div className="text-sm space-y-3">
              <p>1. If any provision of the Five Eyes LTD Terms is or becomes invalid or unenforceable, the affected provision(s) shall be severed and shall not affect the validity of any other provisions.</p>
              <p>2. No delay or failure by us to enforce any breach of the Five Eyes LTD Terms shall constitute a waiver of any prior or subsequent breach.</p>
              <p>3. We will not be liable for any failure to perform any obligations caused by any event, act, omission or circumstance beyond our reasonable control.</p>
              <p>4. You may not assign, sub-license or otherwise dispose of any of your rights under the Terms of Use.</p>
              <p>5. The Five Eyes LTD Terms contain the entire agreement between Five Eyes LTD and you in relation to the subject matter of the Five Eyes LTD Terms.</p>
              <p>6. These Terms of Use are not intended to confer any rights or remedies on any person other than the parties to the Five Eyes LTD Terms.</p>
              <p>7. The Five Eyes LTD Terms and any related dispute or claim shall be governed by, and interpreted in accordance with, English law and subject to the non-exclusive jurisdiction of the English courts.</p>
            </div>
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
