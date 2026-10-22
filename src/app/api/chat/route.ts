import { NextRequest, NextResponse } from 'next/server';
import { getAllServices } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const services = await getAllServices();
    const serviceCatalog = services
      .map(
        (s) =>
          `• ${s.name}: ₹${s.price.toLocaleString('en-IN')} (Duration: ${s.duration} mins)`
      )
      .join('\n');

    const systemPrompt = `You are "Lumi", the friendly, knowledgeable AI Virtual Assistant for "Lumière Salon & Spa".
Current Live Salon Services & Pricing from our Database:
${serviceCatalog}

Salon Operational Hours: 09:00 AM to 08:00 PM (Monday to Sunday)
Location: Main Street, Bandra West, Mumbai

CRITICAL GUIDELINES:
1. ALWAYS use the real database pricing and durations listed above. Never invent or hallucinate prices or services not in the list.
2. MULTILINGUAL SUPPORT: You fluently understand and respond in English, Hindi, Hinglish (mixed Hindi-English), and Marathi (मराठी). Match the user's language and tone warmly.
3. OUT-OF-SCOPE QUESTIONS: If the user asks about home service, home delivery ("Ghar pe aate ho kya?", "Ghari yeun service milel ka?", "Do you deliver products to home?"), or unrelated services (massage parlor, car wash, cooking, medical advice), you MUST POLITELY DECLINE.
   - Example decline (Hinglish): "Maaf kijiye, humare yahan sirf salon visit services available hain. Hum home service ya home delivery provide nahi karte. Aap salon visit ke liye upar diye form se slot book kar sakte hain! 😊"
   - Example decline (Marathi): "माफ करा, आम्ही फक्त सलूनमध्ये सेवा देतो. घरी येऊन सेवा किंवा होम डिलिव्हरी उपलब्ध नाही. सलून भेटीसाठी तुम्ही वर दिलेल्या फॉर्ममधून अपॉइंटमेंट बुक करू शकता! 😊"
   - Example decline (English): "We apologize, but we only offer in-salon services and do not provide home visits or home delivery. You are welcome to book an appointment for a salon visit! 😊"
4. Keep answers concise, clear, and helpful. Always encourage the customer to select their preferred service and book their slot on this page.`;

    // Try Gemini if API key is provided and valid
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const chatContents: any[] = [];

        if (Array.isArray(history)) {
          for (const h of history.slice(-6)) {
            chatContents.push({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }],
            });
          }
        }
        chatContents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: chatContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.4,
          },
        });

        const reply = response.text?.trim();
        if (reply) {
          return NextResponse.json({
            success: true,
            reply,
            source: 'gemini',
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to local NLP engine:', geminiError.message);
      }
    }

    // Intelligent Multilingual Fallback NLP Engine
    const reply = generateSmartFallbackReply(message, services);
    return NextResponse.json({
      success: true,
      reply,
      source: 'local-engine',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Chat service error' },
      { status: 500 }
    );
  }
}

function generateSmartFallbackReply(
  userMsg: string,
  services: { name: string; price: number; duration: number }[]
): string {
  const q = userMsg.toLowerCase().trim();

  // 1. Check for out-of-scope queries (Home delivery, home service, non-salon)
  const outOfScopePatterns = [
    'home',
    'delivery',
    'ghar',
    'ghari',
    'visit home',
    'deliver',
    'bahar',
    'swiggy',
    'zomato',
    'car',
    'bike',
    'food',
    'khana',
    'hotel',
    'loan',
    'doctor',
    'medicine',
  ];

  if (outOfScopePatterns.some((pattern) => q.includes(pattern))) {
    if (q.includes('ghari') || q.includes('yeun') || q.includes('ahe ka') || q.includes('karta ka')) {
      return 'माफ करा, आम्ही फक्त सलूनमध्ये सेवा देतो. घरी येऊन सेवा किंवा होम डिलिव्हरी उपलब्ध नाही. सलूनमध्ये येण्यासाठी तुम्ही वरून सोयीस्कर वेळ बुक करू शकता! 😊✂️';
    }
    return 'Maaf kijiye! Humare yahan sirf salon visit services available hain. Hum home service ya delivery provide nahi karte. Salon visit ke liye aap upar diye form se easily appointment book kar sakte hain! 😊✨';
  }

  // 2. Greetings
  if (
    /^(hi|hii|hello|hey|namaste|kem cho|kasa ahes|kay mhanto|good morning|good evening|good afternoon)/i.test(
      q
    )
  ) {
    if (q.includes('kasa') || q.includes('namaskar')) {
      return 'नमस्कार! Lumière Salon मध्ये आपले स्वागत आहे. मी आपली कशी मदत करू शकतो? तुम्ही हेअरकट, हेअर स्पा, फेशिअल किंवा ब्रायडल मेकअपचे दर आणि वेळ विचारू शकता. ✨';
    }
    return 'Namaste! Welcome to Lumière Salon & Spa ✨ Main aapki kya sahayata kar sakta hoon? Aap services, pricing, timing ya booking ke baare me pooch sakte hain.';
  }

  // 3. Salon Timings
  if (
    q.includes('timing') ||
    q.includes('time') ||
    q.includes('kab khula') ||
    q.includes('open') ||
    q.includes('close') ||
    q.includes('vel') ||
    q.includes('kadhi') ||
    q.includes('hours')
  ) {
    if (
      !services.some((s) => q.includes(s.name.toLowerCase())) &&
      (q.includes('salon') || q.includes('dukan') || q.includes('open') || q.includes('timing'))
    ) {
      return 'Hamara salon har din (Monday to Sunday) subah 09:00 AM se raat 08:00 PM tak khula rehta hai. Aap apna manpasand time slot booking form me chun sakte hain! ⏰';
    }
  }

  // 4. Specific service queries
  for (const s of services) {
    const sNameLower = s.name.toLowerCase();
    const matchesService =
      q.includes(sNameLower) ||
      (sNameLower.includes('haircut') && (q.includes('baal') || q.includes('cut') || q.includes('kesh'))) ||
      (sNameLower.includes('beard') && (q.includes('daadi') || q.includes('trim') || q.includes('shave'))) ||
      (sNameLower.includes('facial') && (q.includes('face') || q.includes('glowing') || q.includes('chehra'))) ||
      (sNameLower.includes('bridal') && (q.includes('shaadi') || q.includes('dulhan') || q.includes('lagna') || q.includes('makeup')));

    if (matchesService) {
      if (q.includes('kay') || q.includes('kiti') || q.includes('ahe') || q.includes('vel')) {
        return `आमच्याकडे ${s.name} चे दर ₹${s.price.toLocaleString('en-IN')} आहेत आणि अंदाजे ${s.duration} मिनिटे लागतात. तुम्ही आताच अपॉइंटमेंट बुक करू शकता! 💇‍♀️`;
      }

      if (q.includes('kitna') || q.includes('kya rate') || q.includes('paisa') || q.includes('charge') || q.includes('lagta')) {
        return `${s.name} ka charge ₹${s.price.toLocaleString('en-IN')} hai aur isme lagbhag ${s.duration} minutes lagte hain. Slot book karne ke liye form me service select karein! ✂️✨`;
      }

      return `${s.name} is priced at ₹${s.price.toLocaleString('en-IN')} with an estimated duration of ${s.duration} minutes. You can select it in the booking form above!`;
    }
  }

  // 5. General pricing or service list
  if (
    q.includes('price') ||
    q.includes('rate') ||
    q.includes('cost') ||
    q.includes('services') ||
    q.includes('menu') ||
    q.includes('charges') ||
    q.includes('suchi') ||
    q.includes('list')
  ) {
    const list = services
      .map((s) => `• ${s.name}: ₹${s.price} (${s.duration} min)`)
      .join('\n');
    return `Ye rahe hamare sabhi services aur unke exact charges:\n\n${list}\n\nAapko inme se kya karwana hai? Form me select karke apna slot book karein! 🌟`;
  }

  // 6. Default helpful response
  return `Humare salon me Haircut (₹200), Beard Trim (₹100), Hair Spa (₹800), Facial (₹500), aur Bridal Makeup (₹5000) available hain. Timings: 09:00 AM - 08:00 PM. Kisi bhi service ki timing ya booking ke baare me poochne ke liye message karein! 😊`;
}
