import React, { useState, useMemo, useCallback } from 'react'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import { 
  DocumentTextIcon,
  SparklesIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'

/* -------------------------- TEMPLATES -------------------------- */
const TEMPLATES = {
  Affidavit: {
    icon: '📜',
    description: 'Legal sworn statement for various purposes',
    fields: ['name', 'age', 'address', 'purpose', 'details'],
    template: `
      AFFIDAVIT

      I, {{name}}, aged {{age}} years, resident of {{address}}, do hereby solemnly affirm and declare as under:

      Purpose: {{purpose}}

      {{details}}

      I state that the above facts are true to the best of my knowledge and belief.

      Place: {{city}}
      Date: {{date}}

      ____________________
      {{name}}
      (Deponent)
    `
  },

  'Rental Agreement': {
    icon: '🏠',
    description: 'Standard rental/lease agreement between landlord and tenant',
    fields: ['landlordName', 'tenantName', 'propertyAddress', 'rent', 'duration', 'details'],
    template: `
      RENTAL AGREEMENT

      This Rental Agreement is entered into on {{date}} between:

      LANDLORD: {{landlordName}}
      TENANT: {{tenantName}}

      PROPERTY: {{propertyAddress}}
      MONTHLY RENT: ₹{{rent}}
      DURATION: {{duration}} months

      TERMS AND CONDITIONS:
      {{details}}

      ____________________          ____________________
      Landlord Signature            Tenant Signature
    `
  },

  'Power of Attorney': {
    icon: '⚖️',
    description: 'Authorize someone to act on your behalf',
    fields: ['principalName', 'agentName', 'powers', 'duration', 'details'],
    template: `
      POWER OF ATTORNEY

      I, {{principalName}}, hereby appoint {{agentName}} as my attorney-in-fact to act in my place and stead for the following purposes:

      POWERS GRANTED:
      {{powers}}

      DURATION: {{duration}}

      Additional Terms:
      {{details}}

      Executed on: {{date}}

      ____________________
      {{principalName}}
      (Principal)
    `
  },

  'Legal Notice': {
    icon: '⚠️',
    description: 'Formal legal notice to inform or warn',
    fields: ['senderName', 'recipientName', 'recipientAddress', 'subject', 'details'],
    template: `
      LEGAL NOTICE

      To,
      {{recipientName}}
      {{recipientAddress}}

      Subject: {{subject}}

      Date: {{date}}

      Dear Sir/Madam,

      Under instructions from my client {{senderName}}, I hereby serve upon you the following legal notice:

      {{details}}

      You are hereby called upon to comply with the above within 15 days from the receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you.

      ____________________
      Advocate for {{senderName}}
    `
  }
}

/* ----------------------- COMPONENT ----------------------- */
function DocumentGenerator() {
  const [docType, setDocType] = useState('Affidavit')
  const [formData, setFormData] = useState({})
  const [generatedDoc, setDoc] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState({})
  const [copied, setCopied] = useState(false)

  const today = useMemo(() => new Date().toLocaleDateString('en-IN'), [])
  const currentTemplate = TEMPLATES[docType]

  // Initialize form data when template changes
  React.useEffect(() => {
    const initialData = {}
    currentTemplate.fields.forEach(field => {
      initialData[field] = formData[field] || ''
    })
    setFormData(initialData)
    setDoc('')
    setError('')
  }, [docType])

  // Get AI suggestions for a field
  const getAISuggestion = async (field) => {
    setLoading(true)
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock AI suggestions based on field type
      const suggestions = {
        details: `1. The parties agree to the terms and conditions mentioned herein.
2. This agreement shall be binding upon both parties.
3. Any disputes shall be resolved through mutual discussion.
4. This document is executed in good faith.`,
        purpose: 'For submission to the concerned authorities as proof of residence/identity',
        powers: `1. To manage and operate bank accounts
2. To sign documents on my behalf
3. To represent me in legal matters
4. To make decisions regarding property matters`,
        subject: 'Notice for breach of contract and demand for compensation'
      }
      
      setAiSuggestions(prev => ({
        ...prev,
        [field]: suggestions[field] || 'AI suggestion for this field...'
      }))
    } catch (err) {
      console.error('AI suggestion error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Apply AI suggestion
  const applySuggestion = (field) => {
    if (aiSuggestions[field]) {
      setFormData(prev => ({
        ...prev,
        [field]: aiSuggestions[field]
      }))
      setAiSuggestions(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  // Generate document
  const generate = useCallback(() => {
    // Validate required fields
    const emptyFields = currentTemplate.fields.filter(field => !formData[field]?.trim())
    if (emptyFields.length > 0) {
      setError(`Please fill in: ${emptyFields.join(', ')}`)
      return
    }
    setError('')

    let filled = currentTemplate.template
    
    // Replace template variables
    Object.entries(formData).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value.trim())
    })
    
    // Add date and city
    filled = filled.replace(/{{date}}/g, today)
    filled = filled.replace(/{{city}}/g, 'New Delhi')
    
    // Clean up formatting
    filled = filled
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .join('\n\n')
      .trim()

    setDoc(filled)
  }, [currentTemplate, formData, today])

  // Copy to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedDoc)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download as DOCX
  const downloadDocx = async () => {
    if (!generatedDoc) return

    const paragraphs = generatedDoc.split('\n\n').map(para => {
      const isHeading = para === para.toUpperCase() && para.length < 50
      
      return new Paragraph({
        children: [new TextRun({
          text: para,
          bold: isHeading,
          size: isHeading ? 32 : 24
        })],
        heading: isHeading ? HeadingLevel.HEADING_1 : undefined,
        alignment: isHeading ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 200 }
      })
    })

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: paragraphs
      }]
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${docType.replace(/\s+/g, '_')}_${today}.docx`)
  }

  // Field label formatter
  const formatFieldLabel = (field) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  /* ----------------------- UI ----------------------- */
  return (
    <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6366f1] rounded-2xl mb-4">
            <DocumentTextIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Legal Document Generator
          </h1>
          <p className="text-gray-400">
            Generate professional legal documents with AI assistance
          </p>
        </div>

        <div className="bg-[#252836] rounded-2xl shadow-xl p-8">
          {/* Document Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Document Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(TEMPLATES).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setDocType(type)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    docType === type
                      ? 'border-[#6366f1] bg-[#6366f1]/10'
                      : 'border-[#2a2d3a] hover:border-[#383b47] bg-[#2a2d3a]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className={`font-semibold ${
                        docType === type ? 'text-white' : 'text-gray-300'
                      }`}>
                        {type}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
                       {currentTemplate.fields.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {formatFieldLabel(field)}
                </label>
                <div className="relative">
                  {field === 'details' || field === 'powers' ? (
                    <textarea
                      value={formData[field] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#2a2d3a] border border-[#383b47] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all"
                      placeholder={`Enter ${formatFieldLabel(field).toLowerCase()}...`}
                      rows={4}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#2a2d3a] border border-[#383b47] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all"
                      placeholder={`Enter ${formatFieldLabel(field).toLowerCase()}...`}
                    />
                  )}
                  
                  {/* AI Suggestion Button */}
                  {(field === 'details' || field === 'purpose' || field === 'powers' || field === 'subject') && (
                    <button
                      onClick={() => getAISuggestion(field)}
                      disabled={loading}
                      className="absolute right-2 top-2 p-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-all group"
                      title="Get AI suggestion"
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <SparklesIcon className="w-4 h-4 text-white" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* AI Suggestion Display */}
                {aiSuggestions[field] && (
                  <div className="mt-2 p-3 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <SparklesIcon className="w-4 h-4 text-[#6366f1] mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 mb-2">AI Suggestion:</p>
                        <p className="text-sm text-gray-400 whitespace-pre-wrap">{aiSuggestions[field]}</p>
                        <button
                          onClick={() => applySuggestion(field)}
                          className="mt-2 text-sm text-[#6366f1] hover:text-[#5558e3] font-medium"
                        >
                          Use this suggestion →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generate}
            className="w-full py-4 bg-gradient-to-r from-[#6366f1] to-[#5558e3] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#6366f1]/25 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Generate Document
          </button>

          {/* Generated Document Output */}
          {generatedDoc && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  Your Document is Ready
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-[#2a2d3a] text-gray-300 hover:bg-[#383b47] hover:text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadDocx}
                    className="px-4 py-2 bg-[#2a2d3a] text-gray-300 hover:bg-[#383b47] hover:text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download .docx
                  </button>
                </div>
              </div>

              <div className="bg-[#2a2d3a] rounded-xl p-6 border border-[#383b47]">
                <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed">
                  {generatedDoc}
                </pre>
              </div>

              {/* Additional Info */}
              <div className="mt-4 p-4 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="w-5 h-5 text-[#6366f1] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300 font-medium mb-1">Important Note:</p>
                    <p className="text-sm text-gray-400">
                      This is a template document. Please review and modify as needed. 
                      For legal validity, consider getting it notarized or consulting with a legal professional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <ScaleIcon className="w-3 h-3" />
            AI-powered document generation • Always consult a lawyer for legal advice
          </p>
        </div>
      </div>
    </div>
  )
}

export default DocumentGenerator