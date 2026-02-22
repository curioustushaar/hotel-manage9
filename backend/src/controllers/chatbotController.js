const KNOWLEDGE_BASE = require('../chatbot/knowledgeBase');

// ─── OpenRouter config ───────────────────────────────────────────────
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

// ─── Button intent map ───────────────────────────────────────────────
const BUTTON_INTENTS = {
    'Make Reservation': 'Explain in detail how to make a hotel room reservation using Bireena Atithi. Cover the complete step-by-step process for both guests and hotel staff, all required fields, booking statuses, and available options.',
    'Order Food': 'Explain how food ordering works in Bireena Atithi in detail. Cover the QR code ordering process, KOT system, waiter flow, and in-room dining steps.',
    'Pricing Information': 'Give a detailed breakdown of all Bireena Atithi subscription plans — Basic (₹19,999/month), Professional (₹14,999/month), and Enterprise (Custom). List prices, features, limits, and which hotel type each plan suits best.',
    'Table Booking': 'Explain how table booking and restaurant management works in Bireena Atithi. Include table statuses, complete waiter workflow, KOT process, and billing.',
    'About Bireena Atithi': 'Tell me everything about Bireena Atithi – what the company does, its history, mission, key features, team members, and how it helps hotels.',
};

// ─── System prompt ───────────────────────────────────────────────────
const buildSystemPrompt = () => `
You are Advika AI, the intelligent virtual assistant of Bireena Atithi – a Smart Hotel & KOT Management Software by Bireena Info Tech.

YOUR PERSONALITY:
- Professional, warm, and SaaS-friendly
- Clear, structured replies using short paragraphs and bullet points
- Always helpful, never fabricates information

STRICT RULES:
1. ONLY use information from the Knowledge Base below. Never invent anything.
2. If user says "hi", "hii", "hello", "hey", "namaste" or any greeting → respond with a warm welcome message as Advika AI.
3. For step-by-step questions → use numbered steps clearly.
4. For feature questions → explain: What it does, How it works, Why it is useful.
5. For pricing → list all 3 plans with prices and features clearly.
6. For demo requests → ask for: Name, Email, Phone Number, Hotel Name, Number of Rooms.
7. If query is completely unrelated to hotel management → politely redirect.
8. Respond in the same language the user writes in (Hindi or English).
9. Format responses clearly with line breaks between sections.

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}
`;

// ─── POST /api/chatbot/chat ──────────────────────────────────────────
const chatWithAdvika = async (req, res) => {
    try {
        const { message, isButton } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, error: 'Message is required.' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: 'OpenRouter API key not configured.',
            });
        }

        // Enrich prompt for predefined button clicks
        const userPrompt = isButton && BUTTON_INTENTS[message]
            ? BUTTON_INTENTS[message]
            : `User Query: "${message}"\n\nAnswer using only the Bireena Atithi knowledge base.`;

        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://bireenaatithi.com',
                'X-Title': 'Advika AI – Bireena Atithi',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.3,
                max_tokens: 700,
            }),
        });

        const data = await response.json();

        if (data.choices && data.choices[0]?.message?.content) {
            return res.json({
                success: true,
                reply: data.choices[0].message.content.trim(),
            });
        }

        // Log unexpected response shape for debugging
        console.error('[Advika AI] Unexpected response:', JSON.stringify(data));
        return res.status(500).json({
            success: false,
            error: data.error?.message || 'Unexpected response from AI.',
        });

    } catch (error) {
        console.error('[Advika AI Error]', error.message);
        return res.status(500).json({
            success: false,
            error: 'Advika AI is temporarily unavailable. Please try again.',
        });
    }
};

module.exports = { chatWithAdvika };
