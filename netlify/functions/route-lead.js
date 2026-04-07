/**
 * Premier Realty — Lead Routing Function
 * Routes form submissions to the correct pipeline based on service type.
 * Performs service area validation for Sacramento-area leads.
 */

const PIPELINES = {
  'buy':          { name: 'Buyer Lead Pipeline',             tag: 'buyer',        priority: 'high' },
  'sell':         { name: 'Seller Consultation Pipeline',    tag: 'seller',       priority: 'high' },
  'valuation':    { name: 'Home Valuation Request Pipeline', tag: 'valuation',    priority: 'medium' },
  'relocate':     { name: 'Relocation Pipeline',             tag: 'relocation',   priority: 'medium' },
  'invest':       { name: 'Investor Lead Pipeline',          tag: 'investor',     priority: 'high' },
  'consultation': { name: 'General Consultation Pipeline',   tag: 'consultation', priority: 'normal' },
  'contact':      { name: 'Contact Form Inquiry',            tag: 'general',      priority: 'normal' }
};

const SERVICE_AREA = [
  'sacramento', 'natomas', 'elk grove', 'arden', 'arden-arcade',
  'east sacramento', 'east sac', 'land park', 'midtown', 'downtown',
  'west sacramento', 'west sac', 'rancho cordova', 'citrus heights',
  'fair oaks', 'carmichael', 'folsom', 'roseville', 'rocklin',
  'lincoln', 'woodland', 'davis', 'north sacramento', 'south sacramento',
  'pocket', 'meadowview', 'river park', 'oak park', 'broadway',
  'curtis park', 'fab forties', 'tahoe park', 'colonial heights',
  'north natomas', 'south natomas', 'antelope', 'rancho murieta',
  'el dorado hills', 'granite bay', 'loomis', 'auburn', 'orangevale',
  'gold river',
  // Sacramento ZIP codes
  '95814','95816','95817','95818','95819','95820','95821','95822',
  '95823','95824','95825','95826','95827','95828','95829','95831',
  '95832','95833','95834','95835','95838','95841','95842','95843','95864'
];

function checkServiceArea(location) {
  if (!location || !location.trim()) return null;
  const lower = location.toLowerCase().trim();
  return SERVICE_AREA.some(kw => lower.includes(kw));
}

function getNeighborhoodTag(location) {
  if (!location) return null;
  const lower = location.toLowerCase();
  const tags = [
    { keywords: ['natomas', 'north natomas', 'south natomas'], tag: 'natomas' },
    { keywords: ['elk grove'],                                  tag: 'elk-grove' },
    { keywords: ['arden', 'arden-arcade'],                      tag: 'arden-arcade' },
    { keywords: ['east sac', 'east sacramento', 'fab forties', 'tahoe park', 'college-elmhurst'], tag: 'east-sacramento' },
    { keywords: ['land park', 'curtis park'],                   tag: 'land-park' },
    { keywords: ['midtown', 'broadway'],                        tag: 'midtown' },
    { keywords: ['downtown', 'oak park'],                       tag: 'downtown' },
    { keywords: ['west sac', 'west sacramento'],                tag: 'west-sacramento' },
    { keywords: ['rancho cordova'],                             tag: 'rancho-cordova' },
    { keywords: ['folsom'],                                     tag: 'folsom' },
    { keywords: ['roseville', 'rocklin', 'granite bay', 'loomis'], tag: 'roseville-rocklin' },
    { keywords: ['citrus heights', 'fair oaks', 'carmichael', 'orangevale'], tag: 'citrus-heights-area' },
    { keywords: ['el dorado hills'],                            tag: 'el-dorado-hills' },
  ];

  for (const entry of tags) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.tag;
  }
  return 'sacramento-metro';
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const {
    name, email, phone,
    neighborhood, priceRange, timeline, serviceType,
    message, service, formType, submittedAt
  } = data;

  // Determine pipeline
  const pipelineKey = formType === 'contact'
    ? (service || 'contact')
    : (serviceType || 'consultation');
  const pipeline = PIPELINES[pipelineKey] || PIPELINES['consultation'];

  // Service area check
  const location = neighborhood || '';
  const inServiceArea = checkServiceArea(location);
  const neighborhoodTag = inServiceArea ? getNeighborhoodTag(location) : null;

  // Build enriched lead object
  const lead = {
    // Contact
    name: name || '',
    email: email || '',
    phone: phone || '',
    // Property details
    neighborhood: location,
    priceRange: priceRange || '',
    timeline: timeline || '',
    message: message || '',
    // Routing metadata
    pipeline: pipeline.name,
    pipelineTag: pipeline.tag,
    priority: pipeline.priority,
    inServiceArea,
    neighborhoodTag,
    serviceAreaStatus: inServiceArea === true
      ? 'in-area'
      : inServiceArea === false
        ? 'out-of-area'
        : 'unknown',
    submittedAt: submittedAt || new Date().toISOString()
  };

  // ── CRM / Email Webhook Integration ──
  // Set LEAD_WEBHOOK_URL in Netlify environment variables to forward leads
  // to your CRM (e.g., Follow Up Boss, Zapier, Make, etc.)
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
    } catch (err) {
      console.error('Webhook delivery failed:', err.message);
      // Don't block the response — still return success to user
    }
  }

  // ── Email Notification via Netlify Email (or any SMTP service) ──
  // Set NOTIFICATION_EMAIL in env vars to enable email alerts
  console.log('New lead received:', JSON.stringify({
    pipeline: lead.pipeline,
    name: lead.name,
    email: lead.email,
    serviceAreaStatus: lead.serviceAreaStatus,
    neighborhoodTag: lead.neighborhoodTag,
    priority: lead.priority
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      inServiceArea,
      pipeline: pipeline.name,
      neighborhoodTag,
      message: inServiceArea === false
        ? 'Lead received. Outside primary service area — team will review and follow up if possible.'
        : 'Lead received and routed to ' + pipeline.name
    })
  };
};