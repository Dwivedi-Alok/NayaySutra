export const LANGUAGES = [
  { 
    code: 'hi', 
    label: 'Hindi', 
    native: 'हिन्दी', 
    flag: '🇮🇳',
    dialects: [
      { code: 'hi-IN', label: 'Standard Hindi' },
      { code: 'hi-UP', label: 'Uttar Pradesh Hindi' },
      { code: 'hi-BH', label: 'Bihari Hindi' },
      { code: 'hi-RJ', label: 'Rajasthani Hindi' }
    ]
  },
  { 
    code: 'mr', 
    label: 'Marathi', 
    native: 'मराठी', 
    flag: '🇮🇳',
    dialects: [
      { code: 'mr-IN', label: 'Standard Marathi' },
      { code: 'mr-MH', label: 'Mumbai Marathi' },
      { code: 'mr-PN', label: 'Pune Marathi' }
    ]
  },
  { 
    code: 'ta', 
    label: 'Tamil', 
    native: 'தமிழ்', 
    flag: '🇮🇳',
    dialects: [
      { code: 'ta-IN', label: 'Standard Tamil' },
      { code: 'ta-LK', label: 'Sri Lankan Tamil' },
      { code: 'ta-MY', label: 'Malaysian Tamil' }
    ]
  },
  { 
    code: 'bn', 
    label: 'Bengali', 
    native: 'বাংলা', 
    flag: '🇮🇳',
    dialects: [
      { code: 'bn-IN', label: 'Indian Bengali' },
      { code: 'bn-BD', label: 'Bangladeshi Bengali' }
    ]
  },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', dialects: [{ code: 'gu-IN', label: 'Standard Gujarati' }] },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', dialects: [{ code: 'te-IN', label: 'Standard Telugu' }] },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', dialects: [{ code: 'kn-IN', label: 'Standard Kannada' }] },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', dialects: [{ code: 'ml-IN', label: 'Standard Malayalam' }] },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', dialects: [{ code: 'pa-IN', label: 'Indian Punjabi' }] },
  { code: 'ur', label: 'Urdu', native: 'اردو', flag: '🇵🇰', dialects: [{ code: 'ur-PK', label: 'Pakistani Urdu' }] }
];

export const QUICK_PHRASES = [
  { en: "I need legal assistance", category: "General" },
  { en: "Where is the nearest court?", category: "General" },
  { en: "I want to file a complaint", category: "Filing" },
  { en: "What documents do I need?", category: "Documents" },
  { en: "I need a lawyer", category: "Legal Help" },
  { en: "What are my rights?", category: "Rights" },
  { en: "I want to appeal this decision", category: "Appeal" },
  { en: "When is my next hearing?", category: "Court" },
  { en: "I need legal aid", category: "Legal Help" },
  { en: "How much are the court fees?", category: "Fees" }
];

export const LEGAL_TEMPLATES = [
  {
    id: 'affidavit',
    name: 'Affidavit',
    category: 'General',
    content: `AFFIDAVIT

I, [NAME], aged [AGE] years, [OCCUPATION], resident of [ADDRESS], do hereby solemnly affirm and declare as under:

1. That I am the deponent herein and competent to swear this affidavit.
2. That [STATEMENT_OF_FACTS].
3. That the statements made above are true to the best of my knowledge and belief.

DEPONENT

Verification:
Verified at [PLACE] on this [DATE] that the contents of this affidavit are true and correct to the best of my knowledge.`
  },
  {
    id: 'legal_notice',
    name: 'Legal Notice',
    category: 'Notices',
    content: `LEGAL NOTICE

To,
[RECIPIENT_NAME]
[RECIPIENT_ADDRESS]

Subject: Legal Notice for [SUBJECT]

Under instructions from my client [CLIENT_NAME], I hereby serve upon you the following legal notice:

1. [FACT_1]
2. [FACT_2]
3. [DEMAND/ACTION_REQUIRED]

You are hereby called upon to [SPECIFIC_ACTION] within [TIME_PERIOD] days from the receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you.

[LAWYER_NAME]
Advocate`
  },
  {
    id: 'power_attorney',
    name: 'Power of Attorney',
    category: 'Authorization',
    content: `GENERAL POWER OF ATTORNEY

Know all men by these presents that I, [PRINCIPAL_NAME], residing at [PRINCIPAL_ADDRESS], do hereby appoint [AGENT_NAME], residing at [AGENT_ADDRESS], as my lawful attorney.

POWERS:
1. To appear and represent me before any authority
2. To sign and execute documents on my behalf
3. To [SPECIFIC_POWERS]

This Power of Attorney shall remain valid until revoked by me in writing.

IN WITNESS WHEREOF, I have executed this Power of Attorney on [DATE].

PRINCIPAL: _______________`
  },
  {
    id: 'rental_agreement',
    name: 'Rental Agreement',
    category: 'Property',
    content: `RENTAL AGREEMENT

This Agreement is made on [DATE] between [LANDLORD_NAME] (Landlord) and [TENANT_NAME] (Tenant).

PROPERTY: [PROPERTY_ADDRESS]
RENT: Rs. [AMOUNT] per month
SECURITY DEPOSIT: Rs. [DEPOSIT_AMOUNT]
PERIOD: [DURATION] months from [START_DATE]

TERMS AND CONDITIONS:
1. The Tenant shall pay rent on or before [DAY] of each month
2. The Tenant shall maintain the property in good condition
3. [ADDITIONAL_TERMS]

LANDLORD: _______________     TENANT: _______________`
  }
];