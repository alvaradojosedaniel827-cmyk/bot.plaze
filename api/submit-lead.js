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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    var data = req.body;
    var name = data.name;
    var email = data.email;
    var whatsapp = data.whatsapp;
    var bot_interest = data.bot_interest;

    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    var account = ACCOUNTS[bot_interest] || ACCOUNTS.buy;

    console.log('Enviando lead a Systeme.io:', email, 'Bot:', bot_interest);

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
      return res.status(200).json({ success: true, bot: bot_interest });
    } else {
      console.error('Error Systeme.io:', response.status, responseText);
      return res.status(200).json({ success: false, error: responseText });
    }

  } catch (error) {
    console.error('Error en función:', error);
    return res.status(200).json({ success: false, error: error.message });
  }
};
