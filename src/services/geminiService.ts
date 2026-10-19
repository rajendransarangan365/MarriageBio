import { BiodataState } from '../types/biodata';

interface GeminiPolishOptions {
  apiKey?: string;
  tone: 'traditional' | 'modern' | 'bilingual';
  rawInput: string;
  field: 'aboutCandidate' | 'partnerExpectations';
  biodata: BiodataState;
}

export async function polishBioWithGemini(options: GeminiPolishOptions): Promise<string> {
  const { apiKey, tone, rawInput, field, biodata } = options;

  const toneGuidelines = {
    traditional: `மரபுசார்ந்த, ஆன்மீகமும் பண்பாடும் நிறைந்த கண்ணியமான தூய தமிழ் நடை. மரியாதைக்குரிய சொற்களைப் பயன்படுத்தவும். (எ.கா: "இறைவனின் திருவருளால்", "நற்குணங்களும் நல்லொழுக்கமும் கொண்ட", "குடும்பப் பெருமையும் பாரம்பரியமும் போற்றும்").`,
    modern: `இன்றைய தலைமுறைக்கு ஏற்ற, தெளிவான, யதார்த்தமான நாகரீக தமிழ் நடை. தொழில் வளர்ச்சி, பரஸ்பர புரிதல் மற்றும் சமத்துவ சிந்தனையை முன்னிறுத்தவும்.`,
    bilingual: `முக்கிய விவரங்களை அழகிய தமிழிலும், தொழில் மற்றும் கல்வி விவரங்களை தெளிவான ஆங்கிலத்திலும் (Bilingual format) நேர்த்தியாகக் கலந்த நடை.`,
  }[tone];

  const fieldPrompt =
    field === 'aboutCandidate'
      ? `வரன்/மணமகள் பற்றிய சுயவிவரக் குறிப்பு (About the Candidate / Profile Summary):
பின்னணி:
- பாலினம்: ${biodata.gender === 'groom' ? 'வரன் (ஆண் / Groom)' : 'மணமகள் (பெண் / Bride)'}
- கல்வி: ${biodata.qualification}
- பணி & நிறுவனம்: ${biodata.occupation}, ${biodata.companyName}
- குடும்பம்: தந்தை ${biodata.fatherName} (${biodata.fatherOccupation}), தாய் ${biodata.motherName} (${biodata.motherOccupation})
- பயனர் உள்ளீடு / குறிப்புகள்: "${rawInput}"`
      : `வாழ்க்கைத் துணை பற்றிய எதிர்பார்ப்புகள் (Partner Expectations):
பின்னணி:
- பயனர் உள்ளீடு / குறிப்புகள்: "${rawInput}"
- கோரும் தகுதிகள்: குடும்ப பாசம், புரிதல், கல்வி மற்றும் நற்பண்புகள்.`;

  const systemInstruction = `You are an expert Tamil Matrimonial Bio-Data writer (தமிழ் திருமண வரன் விபரம் தயாரிக்கும் நிபுணர்).
Rewrite the given raw notes into an exquisite, culturally respectful, attractive matrimonial description suitable for a formal Tamil Bio-Data.
Rules:
1. Follow this tone: ${toneGuidelines}
2. Strictly DO NOT include emojis. Use professional, poetic, and respectful punctuation.
3. Keep it within 3 to 5 impactful sentences.
4. Return ONLY the polished text without any meta-commentary, introductory greetings, or quotation marks.`;

  // If API key is provided, invoke Gemini API
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemInstruction}\n\n${fieldPrompt}` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Gemini API call failed');
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        return generatedText.trim().replace(/^"|"$/g, '');
      }
    } catch (err: any) {
      console.warn('Gemini API online request error:', err.message);
      // Fallback to intelligent local template synthesizer
    }
  }

  // High-fidelity fallback synthesizer (works offline or when API key isn't provided)
  await new Promise((resolve) => setTimeout(resolve, 600));

  const isGroom = biodata.gender === 'groom';
  const person = isGroom ? 'வரன்' : 'மணமகள்';
  const qualification = biodata.qualification || 'பட்டதாரி';
  const occupation = biodata.occupation || 'நிறுவனப் பணியாளர்';
  const location = biodata.workLocation || 'சென்னை';

  if (field === 'aboutCandidate') {
    if (tone === 'traditional') {
      return `${person} ${qualification} பயின்று, ${location}யில் ${occupation} ஆக சிறப்பாகப் பணியாற்றி வருகிறார். பெரியோர்களை மதிக்கும் நற்பண்பும், ஆன்மீக ஈடுபாடும், கலாச்சார விழுமியங்களும் கொண்ட அன்பான குடும்பப் பின்னணியில் வளர்ந்தவர். குடும்பத்தின் மீது மிகுந்த பாசமும் பொறுப்புணர்வும் கொண்ட நற்குணமுடையவர்.`;
    } else if (tone === 'modern') {
      return `${person} ${qualification} முடித்து, ${occupation} ஆக தனது துறையில் முனைப்புடன் இயங்கி வருகிறார். நவீன சிந்தனையும், குடும்ப விழுமியங்களை மதிக்கும் பக்குவமும் கொண்டவர். ஆரோக்கியமான வாழ்க்கை முறை மற்றும் புதிய அனுபவங்களை நேசிக்கும் நேர்மறையான எண்ணமுடையவர்.`;
    } else {
      return `${person} holds a degree in ${qualification} and is currently working as ${occupation} in ${location}. Known for strong family values, professional dedication, and a harmonious balance between contemporary mindset and rich Tamil cultural traditions.`;
    }
  } else {
    // partnerExpectations
    if (tone === 'traditional') {
      return `குடும்பப் பண்பாடும், பெரியோர்களை மதிக்கும் நற்பண்புகளும் கொண்ட நற்குடும்பத்து ${isGroom ? 'பட்டதாரிப் பெண்' : 'பட்டதாரி இளைஞர்'} வரன் எதிர்பார்க்கப்படுகிறது. பரஸ்பர அன்பும், ஜாதகப் பொருத்தமும் முதன்மையாகக் கருதப்படுகிறது.`;
    } else if (tone === 'modern') {
      return `நல்ல கல்வித் தகுதியும், பரஸ்பர புரிதலுடன் குடும்ப வாழ்க்கையை மகிழ்ச்சியாக வழிநடத்தும் முதிர்ச்சியும் கொண்ட வாழ்க்கைத்துணை விரும்பப்படுகிறார். தொழில்சார் நோக்கங்களுக்கு மதிப்பளிக்கும் பண்பு வரவேற்கப்படுகிறது.`;
    } else {
      return `Looking for a well-educated, culturally grounded ${isGroom ? 'graduate bride' : 'well-settled groom'} who values family bonding, mutual respect, and companionship. Horoscope compatibility is preferred.`;
    }
  }
}
