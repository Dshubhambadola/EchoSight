import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            try {
                this.genAI = new GoogleGenerativeAI(apiKey);
                this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            } catch (error) {
                console.error("Failed to initialize Gemini AI", error);
            }
        } else {
            console.warn('GEMINI_API_KEY is not set. AI features will be disabled.');
        }
    }

    async generateSummary(context: string): Promise<string> {
        if (!this.model) {
            return "AI Service is not configured (missing GEMINI_API_KEY). Please add it to your .env file.";
        }

        const prompt = `
      You are a social media analyst helper for "EchoSight".
      Analyze the following data summary and provide a concise, 3-sentence executive summary 
      highlighting the key trends, dominant sentiment, and top influencers.
      Do not use markdown formatting like bolding or headers, just plain text or simple bullet points if necessary.
      
      Data Context:
      ${context}
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error('Error generating AI summary:', error);
            return `Failed to generate summary: ${error.message || JSON.stringify(error)}`;
        }
    }
}
