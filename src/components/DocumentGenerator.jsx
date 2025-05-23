/* DocumentGenerator.jsx */
import React, { useState, useMemo, useCallback } from 'react'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

/* -------------------------- TEMPLATES -------------------------- */
const TEMPLATES = {
  Affidavit: `
    Legal Document: AFFIDAVIT

    I, {{name}}, do solemnly affirm the following on {{date}}:

    {{details}}

    ____________________
    Signature
  `,

  'Rental Agreement': `
    Legal Document: RENTAL AGREEMENT

    This Rental Agreement is made on {{date}} between {{name}} (Landlord) and Tenant.

    Terms:
    {{details}}

    ____________________
    Signature (Landlord)
  `,

  'Power of Attorney': `
    Legal Document: POWER OF ATTORNEY

    I, {{name}}, appoint the following powers on {{date}}:

    {{details}}

    ____________________
    Signature
  `,

  Will: `
    Legal Document: LAST WILL & TESTAMENT

    I, {{name}}, being of sound mind on {{date}}, declare:

    {{details}}

    ____________________
    Signature
  `,

  'Legal Notice': `
    Legal Document: LEGAL NOTICE

    To: {{name}}
    Date: {{date}}

    {{details}}

    ____________________
    Sender’s Signature
  `,

  'Bail Bond': `
    IN THE COURT OF Shri _______________________________________

    Police Station : ______________________       Next date of hearing _____________
    Under Section  : ______________________       Sent to Jail on       _____________
    F.I.R. No.     : ______________________

    Bail Bond

    I, {{name}} resident of ______________________________________________
    having been arrested / detained without warrant … (rest of details)

    {{details}}

    Dated: {{date}}

    ____________________
    Signature
  `,

  'Execution Petition': `
    IN THE COURT OF ____________________________________

    _________________________________________  Decree Holder
                                    VS
    _________________________________________  Judgment Debtor

    Dated: {{date}}

    The Decree Holder prays for execution of the Decree/Order, the particulars whereof are stated below:

    1. No. of Suit:
    2. Name of Parties: {{name}}
    3. Date of Decree / Order sought to be executed:
    4. Whether an appeal was filed against the decree / order:
    5. Whether any payment has been received towards satisfaction of decree / order:
    6. Previous execution applications (dates & results):
    7. Amount of suit along-with interest as per decree / relief granted:
    8. Amount of costs (if allowed by Court):
    9. Against whom execution is sought:
    10. In what manner Court’s assistance is sought:

    {{details}}

    The Decree Holder humbly prays accordingly.

    ____________________
    Decree Holder

    Verification:
    I, {{name}}, do hereby verify that the contents of this application are true to my knowledge and belief.

    Delhi.
    Dated: {{date}}

    ____________________
    Signature of Decree Holder
    Through: Advocate

    Order:
    ____________________
  `,

  'Affidavit (Consumer Complaint)': `
    BEFORE THE HON'BLE CONSUMER DISPUTES REDRESSAL FORUM, NEW DELHI

    COMPLAINT NO._____ OF 20__

    IN THE MATTER OF:
    {{name}} AND ANR                                   COMPLAINANT(S)

    VERSUS

    __________ DEVELOPERS LTD & OTHERS                OPPOSITE PARTIES

    AFFIDAVIT

    I, {{name}}, Wife / Husband of __________________, aged about ___ years, resident
    of ______________________________, New Delhi-____, do hereby solemnly affirm and
    declare as under:

    1. That I am one of the complainants in the above matter, am fully conversant with
       the facts and circumstances of the complaint and competent to depose
       this affidavit.

    2. That I have read and understood the contents of the accompanying complaint
       filed on my behalf and state that the statements therein are true and correct
       to my personal knowledge and the submissions are true to my belief on the
       basis of legal advice received.

    {{details}}

    DEPONENT


    VERIFICATION

    I, the deponent above-named, verify that the contents of this affidavit are true
    and correct to my personal knowledge and nothing material has been concealed or
    falsely stated.

    Verified at New Delhi on this {{date}}.

    DEPONENT
  `,
}

/* ----------------------- COMPONENT ----------------------- */
function DocumentGenerator() {
  const [docType, setDocType]   = useState('Affidavit')
  const [name, setName]         = useState('')
  const [details, setDetails]   = useState('')
  const [generatedDoc, setDoc]  = useState('')
  const [error, setError]       = useState('')

  const today = useMemo(() => new Date().toLocaleDateString(), [])

  /* ----------------------- generate text ----------------------- */
  const generate = useCallback(() => {
    if (!name.trim() || !details.trim()) {
      setError('Name and details are required.')
      return
    }
    setError('')

    const tpl = TEMPLATES[docType] || TEMPLATES.Affidavit
    const filled = tpl
      .replace(/{{name}}/g,    name.trim())
      .replace(/{{details}}/g, details.trim())
      .replace(/{{date}}/g,    today)
      .split('\n')
      .map(l => l.trimEnd())
      .join('\n')
      .trim()

    setDoc(filled)
  }, [docType, name, details, today])

  /* ----------------------- clipboard ----------------------- */
  const copyToClipboard = () => navigator.clipboard.writeText(generatedDoc)

  /* ----------------------- DOCX download ----------------------- */
  const downloadDocx = async () => {
    if (!generatedDoc) return

    // Convert each line to a Word paragraph
    const paragraphs = generatedDoc.split('\n').map(line =>
      line.trim().length
        ? new Paragraph({ children: [new TextRun(line)] })
        : new Paragraph(''),
    )

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${docType.replace(/\s+/g, '_')}.docx`)
  }

  /* ----------------------- UI ----------------------- */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Legal Document Generator
        </h1>

        {/* -------- Form -------- */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Document Type</span>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              {Object.keys(TEMPLATES).map(type => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Your Full Name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="e.g. John Doe"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Details / Terms</span>
            <textarea
              rows={5}
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="Key points to include…"
            />
          </label>

          {error && <p className="text-red-600">{error}</p>}

          <button
            onClick={generate}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Generate
          </button>
        </div>

        {/* -------- Output -------- */}
        {generatedDoc && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Your Document</h2>
            <pre className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
              {generatedDoc}
            </pre>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Copy
              </button>
              <button
                onClick={downloadDocx}
                className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                Download .docx
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentGenerator