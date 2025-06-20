// routes/ai.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Protect this route
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here' ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

if (!genAI) {
    console.warn("Warning: GEMINI_API_KEY is not defined or is a placeholder in .env. AI features will be disabled.");
}

// Simple in-memory cache
const suggestionCache = new Map();
const CACHE_TTL_SUGGESTIONS = 10 * 60 * 1000; // 10 minutes for suggestions
const CACHE_TTL_QUOTES = 60 * 60 * 1000; // 1 hour for quotes

// Apply auth middleware to all AI routes (user must be logged in)
router.use(auth);

// @route   POST /api/ai/suggest
// @desc    Get AI suggestions for todo title/description (overall suggestions)
// @access  Private
router.post('/suggest', async (req, res, next) => {
    if (!genAI) {
        // Return a 503 status, but let the error handler format the response
        const err = new Error('AI service is unavailable (API key not configured or invalid).');
        err.statusCode = 503;
        return next(err);
    }

    const { title, description } = req.body;
    if (!title && !description) {
        return res.status(400).json({ msg: 'Please provide title or description for suggestions.' });
    }

    const cacheKey = `suggest:${title || ''}:${description || ''}`;
    if (suggestionCache.has(cacheKey)) {
        const cachedData = suggestionCache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < CACHE_TTL_SUGGESTIONS) {
            console.log("Serving AI suggestion from cache");
            return res.json(cachedData.data);
        } else {
            suggestionCache.delete(cacheKey);
        }
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        let prompt = "Based on the following todo item, provide suggestions to improve it. Focus on making the title more specific and actionable, and the description more detailed if it's brief. Also suggest a priority (Low, Medium, High) based on keywords or context if possible.\n\n";
        if (title) prompt += `Title: "${title}"\n`;
        if (description) prompt += `Description: "${description}"\n`;
        prompt += "\nReturn your suggestions in JSON format with keys: 'suggestedTitle', 'suggestedDescription', and 'suggestedPriority'. If no change is needed for a field, you can omit it or return the original value. If the input is too vague for a specific suggestion, provide general advice for that field or an empty string for that field.";

        const generationConfig = { temperature: 0.7, topK: 1, topP: 1, maxOutputTokens: 2048 };
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const result = await model.generateContent(prompt, generationConfig, safetySettings);
        const response = result.response;

        if (response.promptFeedback && response.promptFeedback.blockReason) {
            console.error('Gemini content generation blocked for /suggest:', response.promptFeedback);
            return res.status(400).json({ msg: `Content blocked by AI safety filters: ${response.promptFeedback.blockReason}`, details: response.promptFeedback });
        }
        const suggestionsText = response.text();

        let suggestionsJson = {};
        try {
            suggestionsJson = JSON.parse(suggestionsText);
        } catch (parseError) {
            console.error("Error parsing Gemini response for /suggest as JSON:", parseError, "Raw text:", suggestionsText);
            suggestionsJson.suggestedTitle = suggestionsText.match(/suggestedTitle["']?\s*:\s*["'](.*?)["']/i)?.[1] || undefined;
            suggestionsJson.suggestedDescription = suggestionsText.match(/suggestedDescription["']?\s*:\s*["'](.*?)["']/i)?.[1] || undefined;
            suggestionsJson.suggestedPriority = suggestionsText.match(/suggestedPriority["']?\s*:\s*["'](Low|Medium|High)["']/i)?.[1] || undefined;

            if (suggestionsJson.suggestedTitle === undefined && suggestionsJson.suggestedDescription === undefined && suggestionsJson.suggestedPriority === undefined) {
               const err = new Error("AI service returned an unexpected format for /suggest.");
               err.details = suggestionsText;
               return next(err);
            }
        }

        const finalSuggestions = {
             suggestedTitle: typeof suggestionsJson.suggestedTitle === 'string' ? suggestionsJson.suggestedTitle.trim() : undefined,
             suggestedDescription: typeof suggestionsJson.suggestedDescription === 'string' ? suggestionsJson.suggestedDescription.trim() : undefined,
             suggestedPriority: ['Low', 'Medium', 'High'].includes(suggestionsJson.suggestedPriority) ? suggestionsJson.suggestedPriority : undefined,
        };
        Object.keys(finalSuggestions).forEach(key => finalSuggestions[key] === undefined && delete finalSuggestions[key]);

        if (Object.keys(finalSuggestions).length > 0) {
            suggestionCache.set(cacheKey, { data: finalSuggestions, timestamp: Date.now() });
        }
        res.json(finalSuggestions);
    } catch (error) {
        console.error('Error calling Gemini API for /suggest:', error);
        next(error);
    }
});

// @route   POST /api/ai/refine-description
// @desc    Get AI suggestions to refine a todo description
// @access  Private
router.post('/refine-description', async (req, res, next) => {
    if (!genAI) {
        const err = new Error('AI service is unavailable (API key not configured or invalid).');
        err.statusCode = 503;
        return next(err);
    }

    const { description } = req.body;
    if (!description || typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ msg: 'Please provide a valid description to refine.' });
    }

    const cacheKey = `refine-desc:${description}`;
    if (suggestionCache.has(cacheKey)) {
        const cachedData = suggestionCache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < CACHE_TTL_SUGGESTIONS) {
            console.log("Serving refined description from cache");
            return res.json(cachedData.data);
        } else {
            suggestionCache.delete(cacheKey);
        }
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Given the todo description: "${description}", provide up to 3 concise alternative phrasings or expansions that improve its clarity or detail. Return as a JSON array of strings (e.g., ["suggestion1", "suggestion2"]). If the description is already good or no specific refinement is obvious, you can return an empty array or an array containing the original description slightly improved.`;

        const generationConfig = { temperature: 0.7, topK: 1, topP: 1, maxOutputTokens: 1024 };
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const result = await model.generateContent(prompt, generationConfig, safetySettings);
        const response = result.response;

        if (response.promptFeedback && response.promptFeedback.blockReason) {
            console.error('Gemini content generation blocked for /refine-description:', response.promptFeedback);
            return res.status(400).json({ msg: `Content blocked by AI safety filters: ${response.promptFeedback.blockReason}`, details: response.promptFeedback });
        }
        const suggestionsText = response.text();

        let finalSuggestionsArray = [];
        try {
            const parsedJson = JSON.parse(suggestionsText);
            if (Array.isArray(parsedJson)) {
                finalSuggestionsArray = parsedJson.filter(s => typeof s === 'string' && s.trim().length > 0);
            } else {
                console.warn("Gemini refine-description response was valid JSON but not an array:", suggestionsText);
            }
        } catch (parseError) {
            console.error("Error parsing Gemini refine-description response as JSON:", parseError, "Raw text:", suggestionsText);
            const regex = /"(.*?)"/g;
            let match;
            while ((match = regex.exec(suggestionsText)) !== null) {
                if (match[1].trim().length > 5) finalSuggestionsArray.push(match[1].trim());
            }
        }

        const responsePayload = { suggestions: finalSuggestionsArray };
        if (finalSuggestionsArray.length > 0) {
            suggestionCache.set(cacheKey, { data: responsePayload, timestamp: Date.now() });
        }
        res.json(responsePayload);
    } catch (error) {
        console.error('Error calling Gemini API for /refine-description:', error);
        next(error);
    }
});

// @route   POST /api/ai/motivational-quote
// @desc    Get a motivational quote
// @access  Private
router.post('/motivational-quote', async (req, res, next) => {
    if (!genAI) {
        const err = new Error('AI service is unavailable (API key not configured or invalid).');
        err.statusCode = 503;
        return next(err);
    }
    const cacheKey = 'motivationalQuote';
    if (suggestionCache.has(cacheKey)) {
        const cachedData = suggestionCache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < CACHE_TTL_QUOTES) {
            console.log("Serving motivational quote from cache");
            return res.json(cachedData.data);
        } else {
            suggestionCache.delete(cacheKey);
        }
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = "Generate a short, inspiring motivational quote about productivity, achieving goals, or completing tasks. Return JSON with a single key 'quote' containing the quote as a string.";

        const generationConfig = { temperature: 0.9, maxOutputTokens: 100 };
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ];

        const result = await model.generateContent(prompt, generationConfig, safetySettings);
        const response = result.response;

        if (response.promptFeedback && response.promptFeedback.blockReason) {
            console.error('Gemini content generation blocked for /motivational-quote:', response.promptFeedback);
            return res.status(400).json({ msg: `Content blocked by AI safety filters: ${response.promptFeedback.blockReason}`, details: response.promptFeedback });
        }
        const responseText = result.response.text();

        let quoteJson = { quote: "Keep pushing forward!" };
        try {
            const parsed = JSON.parse(responseText);
            if (parsed && typeof parsed.quote === 'string' && parsed.quote.trim()) {
                quoteJson.quote = parsed.quote.trim();
            } else {
                console.warn("Gemini quote response was not in expected format. Raw:", responseText);
                const regexMatch = responseText.match(/"quote"\s*:\s*"(.*?)"/i);
                if (regexMatch && regexMatch[1]) quoteJson.quote = regexMatch[1].trim();
                else quoteJson.quote = "Stay positive and keep up the great work!";
            }
        } catch (parseError) {
            console.error("Error parsing Gemini quote response as JSON:", parseError, "Raw text:", responseText);
            const regexMatch = responseText.match(/"(.*?)"/);
            if (regexMatch && regexMatch[1] && regexMatch[1].length > 10) quoteJson.quote = regexMatch[1].trim();
        }

        suggestionCache.set(cacheKey, { data: quoteJson, timestamp: Date.now() });
        res.json(quoteJson);
    } catch (error) {
        console.error("Error fetching motivational quote from Gemini API:", error);
        next(error);
    }
});

module.exports = router;
