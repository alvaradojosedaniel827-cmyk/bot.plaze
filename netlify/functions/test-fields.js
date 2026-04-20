const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch('https://api.systeme.io/api/contacts?limit=1', {
      method: 'GET',
      headers: {
        'X-API-Key': 'jtelcfoiu6l462z9ic4w2808jdm4rt44d7evx2rjdyky2tqm1kflh5byi0mbakey'
      }
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
