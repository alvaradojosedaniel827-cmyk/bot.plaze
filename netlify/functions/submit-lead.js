const fetch = require('node-fetch');

const ACCOUNTS = {
  buy: {
    apiKey: '9vjgxc2goy61xcy0g2c4evfzqu7pv6mvz52n7s4pxk0yqcq7ku8d4c4ok7aj4ib8',
    tagId: 1968751
  },
  star: {
    apiKey: '798dvis3ocpb3wkq0wn60u6cts5ejidm4bejefoerve68qhuzbn03esz0m4zru1v',
    tagId: 1975406
  }
};

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const data = JSON.parse(event.body);
    const { name, email, whatsapp, bot_interest } = data;

    if (!email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email requerido' }) };
    }

    var account = ACCOUNTS[bot_interest] || ACCOUNTS.buy;

    console.log('Enviando lead a Systeme.io:', email, 'Bot:', bot_interest, 'Account:', bot_interest || 'buy');

    var response = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': account.apiKey
      },
      body: JSON.stringify({
        email: email,
        fields: [
          { slug: 'first_name', value: name || '' },
          { slug: 'phone_number', value: whatsapp || '' }
        ],
        tags: [
          { tagId: account.tagId }
        ]
      })
    });

    var responseText = await response.text();
    console.log('Systeme.io response:', response.status, responseText);

    if (response.status === 201 || response.status === 409 || response.status === 200) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, bot: bot_interest })
      };
    } else {
      console.error('Error Systeme.io:', response.status, responseText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, error: responseText })
      };
    }

  } catch (error) {
    console.error('Error en función:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
