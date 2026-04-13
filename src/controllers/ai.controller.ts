import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/database';

export const generateSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A search query is required.'
      });
    }

    // Try finding exact DB matches for an immediate fast response without AI overhead
    const dbResults = await prisma.medicine.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { manufacturer: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, name: true, manufacturer: true },
      take: 2,
    });

    const apiKey = process.env.GEMINI_API_KEY;
    let aiSuggestions: string[] = [];

    // Fallback to static rules engine if no API key provided
    if (!apiKey) {
      aiSuggestions = [
        `Consider ${query} alternative forms`,
        `Ask a pharmacist about ${query}`,
        `Check correct dosage for ${query}`
      ];
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a medical suggestion AI for MediStore. The user searched for "${query}". 
        Provide exactly 3 concise, highly relevant search suggestions related to this medicine/health query. 
        Only the terms, separated by commas, no extra text.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        aiSuggestions = responseText
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .slice(0, 3);
      } catch (aiError) {
        console.error('Gemini API Error:', aiError);
        // Silent fallback
        aiSuggestions = [`Related items to ${query}`];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        exactMatches: dbResults,
        aiSuggestions,
      }
    });

  } catch (error) {
    next(error);
  }
};
