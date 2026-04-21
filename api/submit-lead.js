const fetch = require('node-fetch');

const BREVO_API_KEY = process.env.BREVO_API_KEY;

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
    var name = data.name || '';
    var email = data.email;
    var whatsapp = data.whatsapp || '';
    var bot_interest = data.bot_interest || 'no_seleccionado';

    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    console.log('Enviando lead a Brevo:', email, 'Bot:', bot_interest);

    var listId = bot_interest === 'star' ? 5 : 2;

    var response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: name,
          SMS: whatsapp,
          BOT_INTEREST: bot_interest.toUpperCase()
        },
        listIds: [listId],
        updateEnabled: true
      })
    });

    var responseText = await response.text();
    console.log('Brevo response:', response.status, responseText);

    if (response.status === 201 || response.status === 204 || response.status === 200) {
      return res.status(200).json({ success: true, bot: bot_interest });
    } else {
      console.error('Error Brevo:', response.status, responseText);
      return res.status(200).json({ success: false, error: responseText });
    }

  } catch (error) {
    console.error('Error en función:', error);
    return res.status(200).json({ success: false, error: error.message });
  }
};
