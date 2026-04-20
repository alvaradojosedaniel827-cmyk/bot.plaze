const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, whatsapp, bot_interest } = data;

    if (!email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email es requerido' }) };
    }

    const response = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'jtelcfoiu6l462z9ic4w2808jdm4rt44d7evx2rjdyky2tqm1kflh5byi0mbakey'
      },
      body: JSON.stringify({
        email: email,
        fields: [
          { slug: 'first_name', value: name || '' },
          { slug: 'phone_number', value: whatsapp || '' },
          { slug: 'bot_interes', value: bot_interest || 'no_seleccionado' }
        ],
        tags: [
          { tagId: 1968751 }
        ]
      })
    });

    const responseData = await response.text();
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseData);
    } catch (e) {
      jsonResponse = { raw: responseData };
    }

    if (response.status === 201 || response.status === 409 || response.status === 200) {
      console.log('Lead guardado en Systeme.io:', email, bot_interest);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Lead guardado', bot: bot_interest })
      };
    } else {
      console.error('Error Systeme.io:', response.status, responseData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ success: false, error: responseData })
      };
    }

  } catch (error) {
    console.error('Error en función:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
