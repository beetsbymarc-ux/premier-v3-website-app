exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, phone, address, price, timeline, serviceType } = data;

    // 1. Workflow Tagging Logic
    const workflows = {
      "Buy a Home": "buyer-pipeline",
      "Sell My Home": "seller-pipeline",
      "Get My Home Value": "home-valuation-pipeline",
      "Relocating to Sacramento": "relocation-pipeline",
      "Investment Property": "investor-pipeline",
      "Talk to an Agent": "general-consultation-pipeline"
    };

    const workflowTag = workflows[serviceType] || "general-lead";

    // 2. Core Service Area Check
    const coreAreas = [
      "sacramento", "natomas", "elk grove", "arden-arcade", 
      "east sacramento", "land park", "midtown"
    ];
    
    const inputAddress = (address || "").toLowerCase();
    const isInsideArea = coreAreas.some(area => inputAddress.includes(area));

    // 3. Response Messages
    let message = "";
    if (isInsideArea) {
      message = `Thank you, ${name.split(' ')[0]}! We've received your request for ${serviceType}. Since you're in the ${inputAddress.split(',')[0]} area, Helen will prioritize your review and follow up within 24 hours.`;
    } else {
      message = `Thank you for reaching out, ${name.split(' ')[0]}. While Premier Realty primarily focuses on the Greater Sacramento area, we've received your request for ${serviceType} and our team will review it to see how we can best assist you.`;
    }

    // Logging for "backend" simulation
    console.log(`[LEAD RECEIVED]
      Tag: ${workflowTag}
      Interior: ${isInsideArea ? 'YES' : 'NO'}
      Data: ${JSON.stringify(data)}
    `);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        success: true, 
        message, 
        isInsideArea,
        tag: workflowTag 
      }),
    };

  } catch (error) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ success: false, error: error.message }) 
    };
  }
};
