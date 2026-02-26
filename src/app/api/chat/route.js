import { NextResponse } from 'next/server';

const RESPONSES = [
    {
        intro: "Based on what you've described, this could be contact dermatitis — an inflammatory reaction caused by direct contact with an irritant or allergen.",
        points: [
            "Avoid the suspected irritant (soaps, detergents, jewellery, plants).",
            "Apply a cool, damp cloth to soothe the area for 15–20 minutes.",
            "Over-the-counter hydrocortisone cream 1% can reduce inflammation.",
            "If symptoms worsen or spread, please consult a dermatologist promptly.",
        ],
    },
    {
        intro: "Your symptoms are consistent with mild eczema (atopic dermatitis), a chronic condition causing dry, itchy, and inflamed skin.",
        points: [
            "Moisturise the affected area at least twice daily with a fragrance-free cream.",
            "Use lukewarm water instead of hot water when bathing.",
            "Avoid scratching — it can break the skin and cause infection.",
            "Antihistamines may help relieve itching; consult your GP for a prescription if needed.",
        ],
    },
    {
        intro: "The description you've given suggests this may be a fungal skin infection (tinea), which is common in warm, moist areas of the body.",
        points: [
            "Keep the area clean and dry — fungi thrive in moisture.",
            "Apply an over-the-counter antifungal cream such as clotrimazole twice daily.",
            "Wear loose, breathable clothing to reduce moisture build-up.",
            "If there's no improvement after 2 weeks, a GP visit is recommended for a stronger treatment.",
        ],
    },
    {
        intro: "This looks like it could be an allergic reaction or urticaria (hives), often triggered by food, medication, or environmental allergens.",
        points: [
            "Try to identify and avoid the potential trigger (new food, detergent, medication).",
            "A non-drowsy antihistamine such as loratadine can provide quick relief.",
            "Cool compresses can help reduce redness and itching.",
            "Seek emergency care immediately if you experience difficulty breathing or swelling of the face.",
        ],
    },
    {
        intro: "Your symptoms may indicate rosacea, a chronic skin condition that causes redness and visible blood vessels, primarily on the face.",
        points: [
            "Use a gentle, non-abrasive cleanser and avoid rubbing the skin.",
            "Apply SPF 30+ sunscreen daily — sun exposure is a major trigger.",
            "Common triggers include spicy food, alcohol, and extreme temperatures; keep a trigger diary.",
            "A dermatologist can prescribe topical or oral medications to manage flare-ups effectively.",
        ],
    },
];

export async function POST(request) {
    const { message } = await request.json();

    const response = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

    return NextResponse.json({ response });
}
