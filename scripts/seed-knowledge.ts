import { config } from "dotenv";
config({ path: ".env.local" });

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const knowledgeDocs = [
  {
    category: "Admissions",
    title: "Admission Requirements & Process",
    content:
      "Handahamy Educational Institute accepts children aged 18 months to 5 years. Parents can apply online through the Admissions page on our website. Required documents include the child’s birth certificate copy, immunization/vaccination record, and two passport-sized photographs. Applications are reviewed within 2–3 working days.",
  },
  {
    category: "Programs & Classes",
    title: "Age Groups & Class Programs",
    content:
      "We offer three core early childhood programs: Playgroup (1.5 – 2.5 years), Toddler Joy (2.5 – 3.5 years), and Preschool / Kindergarten Prep (3.5 – 5 years). Each class is capped at 15–20 students with a certified lead educator and trained assistant.",
  },
  {
    category: "Hours & Schedule",
    title: "School Hours & Care Timings",
    content:
      "Regular nursery sessions run Monday through Friday from 8:00 AM to 12:00 PM. Extended afternoon daycare is available until 4:30 PM for working parents. Drop-off opens at 7:45 AM.",
  },
  {
    category: "Fees & Payments",
    title: "Tuition Fees & Online Payment",
    content:
      "Tuition fees are billed per term or monthly in LKR. Parents can look up outstanding invoices using their child’s Admission Number (e.g., HDM-0241) on our website’s Payments page and pay securely online by card via Stripe.",
  },
  {
    category: "Health & Safety",
    title: "Safety, Meals & Allergies",
    content:
      "All classrooms feature child-safe equipment, CCTV-monitored common areas, and strict authorized pick-up verification. Parents should pack a healthy nut-free snack and water bottle; any food allergies or medical notes recorded during admission are strictly monitored by class teachers.",
  },
  {
    category: "Contact",
    title: "Administration Contact Details",
    content:
      "For campus tours, urgent inquiries, or direct assistance, parents can reach the Handahamy Educational Institute administration desk Monday to Friday between 8:00 AM and 4:00 PM or visit the institute office in person.",
  },
];

async function seed() {
  console.log("Clearing old knowledge entries...");
  await supabase.from("nursery_knowledge").delete().neq("id", 0);

  for (const doc of knowledgeDocs) {
    const res = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: `${doc.title}: ${doc.content}`,
      config: {
        outputDimensionality: 768,
      },
    });

    const embedding = res.embeddings?.[0]?.values;
    if (!embedding) {
      console.error(`Failed to embed: ${doc.title}`);
      continue;
    }

    const { error } = await supabase.from("nursery_knowledge").insert({
      category: doc.category,
      title: doc.title,
      content: doc.content,
      embedding,
    });

    if (error) {
      console.error(`Insert error for ${doc.title}:`, error.message);
    } else {
      console.log(`Seeded: ${doc.title}`);
    }
  }

  console.log("Knowledge base seeding complete.");
}

seed();
