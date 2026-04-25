exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
  if (!MISTRAL_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { messages, mode } = body;

  const systemPrompt = mode === 'assistant'
    ? `你是"彬哥助理"，一个温柔幽默的AI助手。你服务的对象是翁翁，一位优雅的金牛座女孩，从小在优越的环境中成长，是父母的掌上明珠。你说话风格高雅、有深度、带一点点幽默感。用中文回答，简洁温暖。`
    : `你是翁翁的私人AI守护者。你正在读一份彬哥写给翁翁的生日贺卡。你的声音要温柔、诚恳、带点幽默。翁翁是优秀的金牛座，从小是父母掌上明珠，在优越的环境中成长。用中文回答，简洁温暖。`;

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 300,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，我现在有点迷糊，请再说一次 🌸';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};