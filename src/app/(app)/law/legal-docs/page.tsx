'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

type DocType = 'nda' | 'non-compete' | 'partnership' | 'invention-assignment' | 'founder-agreement'

interface Field {
  key: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'select'
  placeholder?: string
  options?: string[]
  required?: boolean
  fullWidth?: boolean
}

interface DocConfig {
  title: string
  description: string
  fields: Field[]
}

const DOC_CONFIGS: Record<DocType, DocConfig> = {
  'nda': {
    title: 'Non-Disclosure Agreement',
    description: 'Protect confidential information shared between parties. Use before discussing sensitive business details.',
    fields: [
      { key: 'disclosing_party', label: 'Disclosing Party (Who shares info)', type: 'text', placeholder: 'Full name or company name', required: true },
      { key: 'disclosing_email', label: 'Disclosing Party Email', type: 'text', placeholder: 'email@example.com', required: true },
      { key: 'receiving_party', label: 'Receiving Party (Who receives info)', type: 'text', placeholder: 'Full name or company name', required: true },
      { key: 'receiving_email', label: 'Receiving Party Email', type: 'text', placeholder: 'email@example.com', required: true },
      { key: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', placeholder: 'Describe the general purpose for which confidential information will be shared...', required: true, fullWidth: true },
      { key: 'definition', label: 'What counts as confidential?', type: 'textarea', placeholder: 'Describe the types of information considered confidential (e.g., financial data, trade secrets, customer lists)...', required: true, fullWidth: true },
      { key: 'term', label: 'Term (how long does this last?)', type: 'select', options: ['1 year', '2 years', '3 years', '5 years', 'Perpetual'], required: true },
      { key: 'jurisdiction', label: 'Governing Jurisdiction / State', type: 'text', placeholder: 'e.g. Missouri, Delaware, California', required: true },
      { key: 'effective_date', label: 'Effective Date', type: 'date', required: true },
    ]
  },
  'non-compete': {
    title: 'Non-Compete Agreement',
    description: 'Restrict a party from engaging in competing business activities. Note: enforceability varies by state.',
    fields: [
      { key: 'restricted_party', label: 'Restricted Party (employee/contractor)', type: 'text', placeholder: 'Full legal name', required: true },
      { key: 'restricted_email', label: 'Restricted Party Email', type: 'text', placeholder: 'email@example.com', required: true },
      { key: 'business_name', label: 'Business / Employer Name', type: 'text', placeholder: 'Company name', required: true },
      { key: 'business_address', label: 'Business Address', type: 'text', placeholder: 'Full address', required: true },
      { key: 'scope', label: 'Industry / Scope of restriction', type: 'textarea', placeholder: 'Describe the industry or business activities restricted...', required: true, fullWidth: true },
      { key: 'territory', label: 'Geographic Territory', type: 'text', placeholder: 'e.g. State of Missouri, United States, Worldwide', required: true },
      { key: 'duration', label: 'Duration of Restriction', type: 'select', options: ['6 months', '1 year', '2 years', '3 years', '5 years'], required: true },
      { key: 'compensation', label: 'Compensation / Consideration', type: 'text', placeholder: 'e.g. $5,000, employment, equity grant', required: true },
      { key: 'effective_date', label: 'Effective Date', type: 'date', required: true },
    ]
  },
  'partnership': {
    title: 'Partnership Agreement',
    description: 'Formalize a business partnership. Defines equity splits, roles, profit sharing, and decision-making.',
    fields: [
      { key: 'partner1_name', label: 'Partner 1 — Full Name', type: 'text', placeholder: 'Full legal name', required: true },
      { key: 'partner1_address', label: 'Partner 1 — Address', type: 'text', placeholder: 'Full address', required: true },
      { key: 'partner1_email', label: 'Partner 1 — Email', type: 'text', placeholder: 'email@example.com', required: true },
      { key: 'partner2_name', label: 'Partner 2 — Full Name', type: 'text', placeholder: 'Full legal name', required: true },
      { key: 'partner2_address', label: 'Partner 2 — Address', type: 'text', placeholder: 'Full address', required: true },
      { key: 'partner2_email', label: 'Partner 2 — Email', type: 'text', placeholder: 'email@example.com', required: true },
      { key: 'business_name', label: 'Business Name (if any)', type: 'text', placeholder: 'Leave blank if not named yet' },
      { key: 'business_purpose', label: 'Business Purpose', type: 'textarea', placeholder: 'Describe what the partnership will do...', required: true, fullWidth: true },
      { key: 'equity_split', label: 'Equity Split', type: 'select', options: ['50/50', '60/40', '70/30', '80/20', 'Other'], required: true },
      { key: 'profit_loss', label: 'Profit & Loss Split', type: 'select', options: ['50/50', '60/40', '70/30', '80/20', 'Proportional to equity', 'Other'], required: true },
      { key: 'roles', label: 'Roles & Responsibilities', type: 'textarea', placeholder: 'Describe what each partner is responsible for...', required: true, fullWidth: true },
      { key: 'term', label: 'Term of Partnership', type: 'select', options: ['At-will (no end date)', '1 year', '2 years', '5 years', 'Perpetual'], required: true },
      { key: 'dispute', label: 'Dispute Resolution', type: 'select', options: ['Binding arbitration', 'Mediation first', 'Court litigation', 'Mutual agreement'], required: true },
      { key: 'effective_date', label: 'Effective Date', type: 'date', required: true },
    ]
  },
  'invention-assignment': {
    title: 'Invention Assignment Agreement',
    description: 'Transfer invention rights from creator to company. Essential for co-founders, contractors, and employees.',
    fields: [
      { key: 'assignor', label: 'Assignor / Inventor — Full Name', type: 'text', placeholder: 'Full legal name of inventor', required: true },
      { key: 'assignor_address', label: 'Assignor Address', type: 'text', placeholder: 'Full address', required: true },
      { key: 'assignor_email', label: 'Assignor Email', type: 'text', placeholder: 'email@example.com', required: true },
      { key: 'assignee', label: 'Assignee / Company Name', type: 'text', placeholder: 'Company receiving the invention', required: true },
      { key: 'assignee_address', label: 'Assignee Address', type: 'text', placeholder: 'Company address', required: true },
      { key: 'invention_title', label: 'Title of Invention', type: 'text', placeholder: 'Name or description of the invention', required: true },
      { key: 'invention_description', label: 'Description of Invention', type: 'textarea', placeholder: 'Provide a detailed description of the invention...', required: true, fullWidth: true },
      { key: 'compensation', label: 'Compensation', type: 'text', placeholder: 'e.g. $1, cash, stock, or "for good and valuable consideration"', required: true },
      { key: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', placeholder: 'e.g. Missouri, Delaware', required: true },
      { key: 'effective_date', label: 'Effective Date', type: 'date', required: true },
    ]
  },
  'founder-agreement': {
    title: 'Founder Agreement',
    description: 'The big one. Vesting, equity, roles, IP, non-competes, and exit clauses — everything before you incorporate.',
    fields: [
      { key: 'founder1_name', label: 'Founder 1 — Full Name', type: 'text', placeholder: 'Full legal name', required: true },
      { key: 'founder1_address', label: 'Founder 1 — Address', type: 'text', placeholder: 'Full address', required: true },
      { key: 'founder1_email', label: 'Founder 1 — Email', type: 'text', placeholder: 'email@example.com', required: true },
      { key: 'founder2_name', label: 'Founder 2 — Full Name', type: 'text', placeholder: 'Full legal name', required: true },
      { key: 'founder2_address', label: 'Founder 2 — Address', type: 'text', placeholder: 'Full address', required: true },
      { key: 'founder2_email', label: 'Founder 2 — Email', type: 'text', placeholder: 'email@example.com', required: true },
      { key: 'company_name', label: 'Company Name (if any)', type: 'text', placeholder: 'Leave blank if not named yet' },
      { key: 'company_purpose', label: 'Company Purpose', type: 'textarea', placeholder: 'Describe what the company will do...', required: true, fullWidth: true },
      { key: 'equity_split', label: 'Equity Split (founder 1 / founder 2)', type: 'select', options: ['50/50', '60/40', '70/30', '80/20', 'Other'], required: true },
      { key: 'vesting_schedule', label: 'Vesting Schedule', type: 'select', options: ['4 years, 1 year cliff (standard)', '3 years, 1 year cliff', '2 years, 6 month cliff', 'No vesting'], required: true },
      { key: 'roles', label: 'Roles & Responsibilities', type: 'textarea', placeholder: 'Who is responsible for what? CEO, CTO, etc...', required: true, fullWidth: true },
      { key: 'ip_ownership', label: 'IP Ownership', type: 'select', options: ['All IP automatically assigned to company', 'Licensed to company', 'Joint ownership'], required: true },
      { key: 'non_compete', label: 'Non-Compete after departure?', type: 'select', options: ['Yes — 1 year', 'Yes — 2 years', 'No'], required: true },
      { key: 'confidentiality', label: 'Confidentiality', type: 'select', options: ['Mutual NDA applies', 'Company NDA only', 'Standard provisions'], required: true },
      { key: 'decision_making', label: 'Deadlock / Decision-Making', type: 'select', options: ['Majority vote', 'Tie goes to CEO', 'Binding arbitration', 'Equal split triggers mediation'], required: true },
      { key: 'exit_clause', label: 'Exit / Buyout Clause', type: 'select', options: ['Buyout at fair market value', 'Right of first refusal', 'Drag-along / tag-along rights', 'No specific provision'], required: true },
      { key: 'term', label: 'Term', type: 'select', options: ['Perpetual until dissolved', '5 years', '10 years', 'Until stated goal is achieved'], required: true },
      { key: 'dispute', label: 'Dispute Resolution', type: 'select', options: ['Delaware courts', 'Missouri courts', 'Binding arbitration', 'Mediation first'], required: true },
      { key: 'effective_date', label: 'Effective Date', type: 'date', required: true },
    ]
  }
}

function generateDocText(docType: DocType, values: Record<string, string>): string {
  const cfg = DOC_CONFIGS[docType]
  const date = values.effective_date || new Date().toISOString().split('T')[0]
  const formattedDate = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  switch (docType) {
    case 'nda': return `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of ${formattedDate} ("Effective Date").

1. PARTIES

Disclosing Party:
Name: ${values.disclosing_party || '[NAME]'}
Email: ${values.disclosing_email || '[EMAIL]'}

Receiving Party:
Name: ${values.receiving_party || '[NAME]'}
Email: ${values.receiving_email || '[EMAIL]'}

2. PURPOSE

The parties wish to explore a potential business relationship concerning the following purpose: ${values.purpose || '[PURPOSE]'}

3. CONFIDENTIAL INFORMATION

For purposes of this Agreement, "Confidential Information" means: ${values.definition || '[DEFINITION]'}

Confidential Information includes, without limitation: trade secrets, business plans, customer lists, financial data, technical specifications, product designs, and any other non-public information shared between the parties.

4. OBLIGATIONS OF RECEIVING PARTY

The Receiving Party agrees to:
(a) Hold and maintain the Confidential Information in strict confidence;
(b) Not disclose the Confidential Information to any third parties without prior written consent;
(c) Use the Confidential Information solely for the Purpose stated herein;
(d) Protect the Confidential Information using the same degree of care used to protect its own confidential information, but no less than reasonable care.

5. TERM

This Agreement shall remain in effect for ${values.term || '[TERM]'} from the Effective Date.

6. RETURN OF INFORMATION

Upon request by the Disclosing Party or termination of this Agreement, the Receiving Party shall promptly return or destroy all Confidential Information in its possession.

7. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of ${values.jurisdiction || '[JURISDICTION]'}, without regard to its conflict of law principles.

8. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, or agreements relating thereto.

9. SIGNATURES

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________
${values.disclosing_party || '[DISCLOSING PARTY NAME]'}
Disclosing Party

_________________________
${values.receiving_party || '[RECEIVING PARTY NAME]'}
Receiving Party
`

    case 'non-compete': return `NON-COMPETE AGREEMENT

This Non-Compete Agreement ("Agreement") is entered into as of ${formattedDate} ("Effective Date").

1. PARTIES

Restricted Party:
Name: ${values.restricted_party || '[NAME]'}
Email: ${values.restricted_email || '[EMAIL]'}

Business / Employer:
Name: ${values.business_name || '[BUSINESS NAME]'}
Address: ${values.business_address || '[ADDRESS]'}

2. ACKNOWLEDGEMENTS

The Restricted Party acknowledges that:
(a) The Business provides competitive compensation and valuable consideration;
(b) During the course of engagement, the Restricted Party will have access to Confidential Information, trade secrets, and business relationships;
(c) A non-compete agreement is necessary to protect the legitimate business interests of the Business.

3. SCOPE OF RESTRICTION

The Restricted Party agrees not to engage in, directly or indirectly, the following activities within the ${values.territory || '[TERRITORY]'} territory:

${values.scope || '[SCOPE]'}

4. DURATION

This restriction shall remain in effect for ${values.duration || '[DURATION]'} following the Effective Date or termination of engagement, whichever occurs later.

5. COMPENSATION

In consideration for this Agreement, the Restricted Party shall receive: ${values.compensation || '[COMPENSATION]'}

6. ENFORCEABILITY

If any provision of this Agreement is found to be unenforceable, the remaining provisions shall remain in full force and effect. The parties agree to modify any unenforceable provision to the minimum extent necessary to make it enforceable.

7. GOVERNING LAW

This Agreement shall be governed by the laws of the state in which the Business is primarily located.

8. SIGNATURES

_________________________
${values.restricted_party || '[RESTRICTED PARTY]'}
Restricted Party

_________________________
${values.business_name || '[BUSINESS]'}
Business / Employer

_________________________
Witness
`

    case 'partnership': return `PARTNERSHIP AGREEMENT

This Partnership Agreement ("Agreement") is entered into as of ${formattedDate} ("Effective Date").

1. PARTNERS

Partner 1:
Name: ${values.partner1_name || '[NAME]'}
Address: ${values.partner1_address || '[ADDRESS]'}
Email: ${values.partner1_email || '[EMAIL]'}

Partner 2:
Name: ${values.partner2_name || '[NAME]'}
Address: ${values.partner2_address || '[ADDRESS]'}
Email: ${values.partner2_email || '[EMAIL]'}

Business Name (if applicable): ${values.business_name || '[TO BE DETERMINED]'}

2. PURPOSE

The purpose of this Partnership is: ${values.business_purpose || '[PURPOSE]'}

3. EQUALITY OF PARTNERS

The Partners acknowledge that they are entering into this Agreement as equal partners and agree to conduct all Partnership affairs in good faith.

4. PROFIT AND LOSS SHARING

Net profits and net losses of the Partnership shall be allocated as follows:
${values.profit_loss || '[PROFIT/LOSS SPLIT]'}

5. ROLES AND RESPONSIBILITIES

${values.roles || '[ROLES]'}

6. MANAGEMENT

Decisions shall be made by mutual agreement of the Partners. In the event of a deadlock, the Partners agree to engage in good-faith mediation before pursuing other remedies.

7. TERM

This Agreement shall remain in effect for ${values.term || '[TERM]'}, unless dissolved by mutual agreement or as otherwise provided herein.

8. DISPUTE RESOLUTION

Disputes arising under this Agreement shall be resolved by: ${values.dispute || '[DISPUTE RESOLUTION]'}

9. BANKRUPTCY / DISSOLUTION

In the event that the Partnership is dissolved, assets shall be distributed first to creditors, then according to each Partner's respective interest.

10. AMENDMENTS

This Agreement may be amended only by written instrument signed by all Partners.

11. ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between the Partners with respect to the Partnership.

12. SIGNATURES

IN WITNESS WHEREOF, the Partners have executed this Agreement as of the date first written above.

_________________________
${values.partner1_name || '[PARTNER 1]'}
Partner 1

_________________________
${values.partner2_name || '[PARTNER 2]'}
Partner 2

_________________________
Witness
`

    case 'invention-assignment': return `INVENTION ASSIGNMENT AGREEMENT

This Invention Assignment Agreement ("Agreement") is entered into as of ${formattedDate} ("Effective Date").

1. PARTIES

Assignor (Inventor):
Name: ${values.assignor || '[NAME]'}
Address: ${values.assignor_address || '[ADDRESS]'}
Email: ${values.assignor_email || '[EMAIL]'}

Assignee (Company):
Name: ${values.assignee || '[COMPANY]'}
Address: ${values.assignee_address || '[ADDRESS]'}

2. INVENTION

Title: ${values.invention_title || '[TITLE]'}
Description: ${values.invention_description || '[DESCRIPTION]'}

The Assignor represents that the above invention was conceived and developed solely or partly by the Assignor.

3. ASSIGNMENT OF RIGHTS

For good and valuable consideration of ${values.compensation || '[COMPENSATION]'}, the receipt and sufficiency of which is hereby acknowledged, the Assignor hereby assigns, transfers, and conveys to the Assignee:

(a) All right, title, and interest in and to the invention;
(b) All patents, copyrights, trade secrets, and other intellectual property rights;
(c) All causes of action for past, present, and future infringement;
(d) The right to register any of the above with any governmental authority.

4. FURTHER ASSURANCES

The Assignor agrees to execute any additional documents and take any further actions necessary to perfect the assignment set forth herein, including but not limited to providing testimony in any related legal proceeding.

5. REPRESENTATIONS

The Assignor represents and warrants that:
(a) The Assignor is the sole inventor of the invention;
(b) The invention does not infringe any third-party intellectual property rights;
(c) The Assignor has full authority to assign these rights.

6. GOVERNING LAW

This Agreement shall be governed by the laws of ${values.jurisdiction || '[JURISDICTION]'}.

7. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the parties regarding the subject matter hereof.

8. SIGNATURES

_________________________
${values.assignor || '[ASSIGNOR]'}
Assignor / Inventor

_________________________
${values.assignee || '[ASSIGNEE]'}
Assignee / Company

_________________________
Witness
`

    case 'founder-agreement': return `FOUNDER AGREEMENT

This Founder Agreement ("Agreement") is entered into as of ${formattedDate} ("Effective Date").

1. FOUNDERS

Founder 1:
Name: ${values.founder1_name || '[NAME]'}
Address: ${values.founder1_address || '[ADDRESS]'}
Email: ${values.founder1_email || '[EMAIL]'}

Founder 2:
Name: ${values.founder2_name || '[NAME]'}
Address: ${values.founder2_address || '[ADDRESS]'}
Email: ${values.founder2_email || '[EMAIL]'}

Company Name (if applicable): ${values.company_name || '[TO BE DETERMINED]'}

2. COMPANY PURPOSE

The Company is formed for the following purpose: ${values.company_purpose || '[PURPOSE]'}

3. EQUITY AND FOUNDER SHARES

The Founders agree that equity shall be split as follows:
${values.equity_split || '[EQUITY SPLIT]'}

Vesting Schedule: ${values.vesting_schedule || '[VESTING]'}

4. ROLES AND RESPONSIBILITIES

${values.roles || '[ROLES]'}

5. INTELLECTUAL PROPERTY

All intellectual property created by Founders in connection with the Company shall be owned by: ${values.ip_ownership || '[IP OWNERSHIP]'}

6. NON-COMPETE

Upon departure from the Company, Founders agree to the following non-compete terms: ${values.non_compete || '[NON-COMPETE]'}

7. CONFIDENTIALITY

${values.confidentiality || '[CONFIDENTIALITY]'}

8. DECISION-MAKING AND DEADLOCK

In the event of a deadlock on material decisions: ${values.decision_making || '[DECISION-MAKING]'}

9. EXIT / BUYOUT

Upon departure, the following buyout provisions apply: ${values.exit_clause || '[EXIT CLAUSE]'}

10. TERM

This Agreement shall remain in effect for ${values.term || '[TERM]'}, unless otherwise amended by written agreement of all Founders.

11. DISPUTE RESOLUTION

Disputes shall be resolved by: ${values.dispute || '[DISPUTE RESOLUTION]'}

12. INCORPORATION

The Founders agree to incorporate the Company within 90 days of the Effective Date, unless otherwise agreed in writing.

13. ADDITIONAL FOUNDERS

This Agreement shall be amended to reflect any additional Founders joining the Company.

14. ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between the Founders with respect to the subject matter hereof.

15. SIGNATURES

IN WITNESS WHEREOF, the Founders have executed this Agreement as of the date first written above.

_________________________
${values.founder1_name || '[FOUNDER 1]'}
Founder 1

_________________________
${values.founder2_name || '[FOUNDER 2]'}
Founder 2

_________________________
Witness
`
  }
}

export default function LegalDocsPage() {
  const searchParams = useSearchParams()
  const initialDoc = searchParams.get('doc') as DocType | null

  const [activeDoc, setActiveDoc] = useState<DocType>(initialDoc || 'nda')
  const [values, setValues] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDownload, setShowDownload] = useState(false)

  const cfg = DOC_CONFIGS[activeDoc]

  const handleFieldChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const generatedText = generateDocText(activeDoc, values)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    // Simple download as .txt file
    const blob = new Blob([generatedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeDoc}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Header */}
      <div className="border-b border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/law" className="flex items-center gap-2 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors">
            <ArrowLeft size={18} /> Back to Porterful Law
          </Link>
          <div className="text-sm text-[var(--pf-text-muted)]">Legal Doc Generator</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Instant Legal Documents</h1>
          <p className="text-[var(--pf-text-secondary)]">NDAs, non-competes, agreements — generated in seconds. No lawyer required for the basics.</p>
        </div>

        {/* Doc type selector */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {(Object.keys(DOC_CONFIGS) as DocType[]).map(key => (
            <button
              key={key}
              onClick={() => { setActiveDoc(key); setValues({}); setPreview(false) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeDoc === key
                  ? 'bg-[var(--pf-orange)] text-white'
                  : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)]/40'
              }`}
            >
              {DOC_CONFIGS[key].title}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-[var(--pf-orange)]" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{cfg.title}</h2>
                  <p className="text-sm text-[var(--pf-text-secondary)]">{cfg.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {cfg.fields.map(field => (
                <div key={field.key} className={field.fullWidth ? '' : ''}>
                  <label className='block text-sm font-medium mb-2'>{field.label}{field.required && ' *'}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className='w-full px-4 py-3 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl text-white placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)] transition-colors min-h-[100px] resize-none'
                      placeholder={field.placeholder}
                      value={values[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      className='w-full px-4 py-3 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl text-white focus:outline-none focus:border-[var(--pf-orange)] transition-colors'
                      value={values[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className='w-full px-4 py-3 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl text-white placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)] transition-colors'
                      placeholder={field.placeholder}
                      value={values[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreview(!preview)}
                    className="px-3 py-1.5 text-sm bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)]/40 transition-colors"
                  >
                    {preview ? <ChevronUp size={14} /> : 'Expand'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-sm bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg text-[var(--pf-text-secondary)] hover:border-[var(--pf-orange)]/40 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 text-sm bg-[var(--pf-orange)] text-white rounded-lg hover:bg-[var(--pf-orange-dark)] transition-colors flex items-center gap-1.5"
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>

              <div className="bg-white text-black rounded-2xl border border-[var(--pf-border)] overflow-hidden">
                <div className={`bg-[var(--pf-bg-secondary)] px-6 py-3 border-b border-[var(--pf-border)] flex items-center justify-between`}>
                  <span className="text-sm font-medium text-[var(--pf-text-secondary)]">{cfg.title}.txt</span>
                  <span className="text-xs text-[var(--pf-text-muted)]">Plain text</span>
                </div>
                <pre className={`p-6 text-sm font-mono whitespace-pre-wrap max-h-[600px] overflow-y-auto ${preview ? 'max-h-none' : 'max-h-[500px]'}`}>
                  {generatedText}
                </pre>
              </div>

              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-sm text-yellow-200">
                  <strong>⚠️ Not legal advice.</strong> This document is a starting point. Have a lawyer review it before signing anything significant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
