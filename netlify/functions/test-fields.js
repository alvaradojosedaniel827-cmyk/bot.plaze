const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const url = 'https://api.systeme.io/api/contacts?limit=10';
    console.log('Fetching:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': 'jtelcfoiu6l462z9ic4w2808jdm4rt44d7evx2rjdyky2tqm1kflh5byi0mbakey'
      }
    });

    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', text);

    return {
      statusCode: 200,
      headers,
      body: text
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
