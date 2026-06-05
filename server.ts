import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser middleware
  app.use(express.json({ limit: '10mb' }));

  // API Route: Generate AI summary of key metrics
  app.post("/api/gemini/summary", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ 
          error: "API Key Gemini belum dikonfigurasi di server. Silakan hubungi administrator atau periksa pengaturan Secrets." 
        });
      }

      const { statsSummary } = req.body;
      
      if (!statsSummary) {
        return res.status(400).json({ error: "statsSummary is required" });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Berikut adalah ringkasan data statistik keanggotaan Persekutuan Anggota Muda (PAM) Klasis Raja Ampat saat ini:
${JSON.stringify(statsSummary, null, 2)}

Analisislah data tersebut dan berikan laporan ringkasan tren keanggotaan yang ditulis dalam Bahasa Indonesia yang profesional, formal, namun menginspirasi.
Isi laporan harus mencakup:
1. **Analisis Pertumbuhan & Anggota Baru**: Bagaimana kuantitas pertumbuhan anggota baru (berdasarkan tahun pendaftaran)?
2. **Keseimbangan Gender (PAM Putra vs Putri)**: Bagaimana distribusi gender baik secara keseluruhan maupun per lingkungan? Apakah ada dominasi salah satu gender?
3. **Analisis Distribusi Lingkungan**: Mana wilayah/lingkungan dengan basis konsentrasi anggota terbesar dan terkecil? Apa implikasi praktisnya untuk pelayanan atau koordinasi?
4. **Rekomendasi Pelayanan Taktis**: Berikan minimal 2 usulan program kerja/kegiatan pemuda yang relevan berdasarkan tren data ini (misal: jika ada ketimpangan gender atau wilayah tertentu minim anggota).

**Format Output**:
Tulis dalam Markdown yang bersih, rapi, dan dinamis dengan penataan visual yang pas (subbab tebal, poin-poin yang mudah dibaca). Gunakan sapaan yang hangat khas organisasi pemuda gerejawi PAM Klasis Raja Ampat namun tetap analitis. Berikan judul yang bersemangat di awal laporan!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah analis data dan konsultan pelayanan organisasi kepemudaan gerejawi terkemuka, khususnya spesialis PAM (Persekutuan Anggota Muda) di Klasis Raja Ampat. Berikan analisis tren terperinci, akurat, dan inspiratif berdasarkan data statistik yang diteruskan tanpa berasumsi atau mengarang data dari luar.",
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ 
        error: err.message || "Terganggu masalah saat berkomunikasi dengan asisten kecerdasan buatan Gemini." 
      });
    }
  });

  // Vite middleware setup for Development, otherwise Serve Static Files in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Start server error:", err);
});
