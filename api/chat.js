const fetch = require('node-fetch');

const SYSTEM_PROMPT = `Eres el asistente virtual de BOT.PLAZE, una empresa que vende Expert Advisors (bots de trading automático) para MetaTrader 4 que operan oro (XAUUSD).

INFORMACIÓN DE LOS PRODUCTOS:

Boss Gold Buy:
- Opera solo en compra (BUY) en XAUUSD temporalidad M15
- Capital mínimo: $500
- Ideal para principiantes con menor riesgo
- No usa stop loss, usa distribución matemática del capital a lo largo de miles de pips
- Pago único, licencia de por vida

Boss Gold Star:
- Opera compra y venta (BUY + SELL) con sistema grid automático en XAUUSD M15
- Capital mínimo: $3,000
- Nuestro bot más popular, mayor potencial
- No usa stop loss, usa distribución matemática del capital
- Pago único, licencia de por vida
- Requiere VPS activa 24/7

SOBRE LA VPS:
- Una VPS (Servidor Privado Virtual) es una computadora remota que mantiene MetaTrader 4 y el bot funcionando 24/7
- Recomendamos VPS con Windows Server
- Proveedores recomendados: ForexVPS, Contabo, o cualquier VPS Windows
- Precio aproximado de VPS: $5-15/mes
- Pasos para configurar: 1) Contratar VPS Windows, 2) Conectarse por Escritorio Remoto, 3) Instalar MetaTrader 4, 4) Agregar el EA en la carpeta Experts, 5) Activar el bot en el gráfico XAUUSD M15

SOBRE METATRADER 4:
- Plataforma gratuita de trading
- Se descarga desde el sitio del broker
- Brokers recomendados: Vantage y EBC
- El bot se instala como un Expert Advisor (archivo .ex4)

SOBRE LA DEMO:
- Ofrecemos credenciales de una cuenta investor para que el cliente vea en tiempo real cómo opera el bot
- La cuenta investor es de solo lectura, el cliente puede ver operaciones pero no operar
- Las credenciales se envían por email después de llenar el formulario

REGLAS DE COMPORTAMIENTO:
- Responde SIEMPRE en español
- Sé amigable, profesional y breve (máximo 3-4 frases por respuesta)
- Si no sabes algo, di que un asesor humano puede ayudar y sugiere escribir al WhatsApp
- NUNCA prometas ganancias específicas ni porcentajes de rentabilidad
- NUNCA des asesoría financiera
- Si preguntan precios de la licencia, di que un asesor les dará la información personalizada por WhatsApp
- Incluye emojis de forma moderada
- Si preguntan algo que no tiene que ver con BOT.PLAZE o trading, redirige amablemente al tema
- WhatsApp de contacto: +593998958872`;

// Mensaje de respaldo cuando algo falla
var MENSAJE_ERROR = 'Lo siento, hubo un error. Por favor escríbenos al WhatsApp: +593998958872';

// Límites para que nadie pueda gastar el saldo de la API desde fuera
var ORIGENES_PERMITIDOS = ['https://botplaze.site', 'https://www.botplaze.site'];
var MAX_MENSAJES = 10;          // solo se envían los últimos 10 mensajes de la conversación
var MAX_CARACTERES = 500;       // largo máximo de cada mensaje
var MAX_PETICIONES = 20;        // peticiones por IP...
var VENTANA_MS = 10 * 60 * 1000; // ...cada 10 minutos

// Contador por IP en memoria (se reinicia cuando Vercel recicla la función; es un freno básico)
var peticionesPorIp = {};

function superaLimite(ip) {
  var ahora = Date.now();
  var registro = peticionesPorIp[ip];
  if (!registro || ahora - registro.inicio > VENTANA_MS) {
    peticionesPorIp[ip] = { inicio: ahora, total: 1 };
    return false;
  }
  registro.total++;
  return registro.total > MAX_PETICIONES;
}

// Deja solo mensajes válidos, recortados y en el orden que exige la API
function limpiarMensajes(lista) {
  if (!Array.isArray(lista)) return [];
  var limpios = lista
    .filter(function (m) {
      return m && (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' && m.content.trim();
    })
    .slice(-MAX_MENSAJES)
    .map(function (m) {
      return { role: m.role, content: m.content.slice(0, MAX_CARACTERES) };
    });
  // La conversación debe empezar con un mensaje del usuario
  while (limpios.length && limpios[0].role !== 'user') limpios.shift();
  return limpios;
}

module.exports = async function handler(req, res) {
  var origen = req.headers.origin || '';
  // En local (sin dominio de producción) se permite el mismo origen
  if (ORIGENES_PERMITIDOS.indexOf(origen) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', origen);
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Bloquea llamadas desde otros sitios web
  if (origen && ORIGENES_PERMITIDOS.indexOf(origen) === -1 && !/^http:\/\/localhost(:\d+)?$/.test(origen)) {
    return res.status(403).json({ success: false, message: MENSAJE_ERROR });
  }

  var ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconocida';
  if (superaLimite(ip)) {
    return res.status(429).json({
      success: false,
      message: 'Has enviado muchos mensajes seguidos. Escríbenos al WhatsApp: +593998958872'
    });
  }

  if (!process.env.CLAUDE_API_KEY) {
    console.error('Falta la variable de entorno CLAUDE_API_KEY');
    return res.status(200).json({ success: false, message: MENSAJE_ERROR });
  }

  try {
    var data = req.body || {};
    var messages = limpiarMensajes(data.messages);
    if (!messages.length) {
      return res.status(400).json({ success: false, message: MENSAJE_ERROR });
    }

    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    var result = await response.json();

    if (result.content && result.content[0]) {
      return res.status(200).json({
        success: true,
        message: result.content[0].text
      });
    } else {
      console.error('Error Claude API:', JSON.stringify(result));
      return res.status(200).json({
        success: false,
        message: 'Lo siento, hubo un error. Por favor escríbenos al WhatsApp: +593998958872'
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(200).json({
      success: false,
      message: 'Lo siento, hubo un error. Por favor escríbenos al WhatsApp: +593998958872'
    });
  }
};
