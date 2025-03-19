import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function analyzeLeadWithGPT(conversations: { message: string; response: string; timestamp?: Date }[]) {
    try {
        // Extract only user messages for analysis
        const userMessages = conversations.map(conv => conv.message).join('\n');

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Analyze these user messages and score the lead potential. Look for:
                    1. Project requirements mentioned
                    2. Technical details shared
                    3. Timeline indicators
                    4. Budget mentions
                    5. Contact information shared
                    
                    Return JSON with:
                    {
                        "score": number (0-100),
                        "interest": "Cold/Warm/Medium/Hot",
                        "messageInsights": {
                            "projectScope": string,
                            "technicalNeeds": string,
                            "timeframe": string,
                            "budgetIndication": string
                        },
                        "reasoning": string
                    }`
                },
                {
                    role: "user",
                    content: userMessages
                }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(completion.choices[0].message.content || '{}');
        return {
            score: analysis.score || 0,
            interest: analysis.interest || 'Cold',
            messageInsights: analysis.messageInsights || {
                projectScope: 'Not specified',
                technicalNeeds: 'Not specified',
                timeframe: 'Not specified',
                budgetIndication: 'Not specified'
            },
            reasoning: analysis.reasoning || ''
        };
    } catch (error) {
        console.error('GPT Analysis Error:', error);
        return {
            score: 0,
            interest: 'Cold',
            messageInsights: {
                projectScope: 'Analysis failed',
                technicalNeeds: 'Analysis failed',
                timeframe: 'Analysis failed',
                budgetIndication: 'Analysis failed'
            },
            reasoning: 'Analysis failed'
        };
    }
}

export async function GET() {
    try {
        const leads = await prisma.lead.findMany({
            include: {
                conversations: {
                    select: {
                        id: true,  // Add id to selection
                        message: true,
                        response: true,
                        timestamp: true
                    },
                    orderBy: {
                        timestamp: 'asc'
                    }
                }
            }
        });

        const scoredLeads = await Promise.all(leads.map(async lead => {
            if (lead.conversations.length === 0) {
                return {
                    ...lead,
                    id: lead.id, // Ensure lead ID is included
                    score: 0,
                    interest: 'New',
                    messageInsights: {
                        projectScope: 'No conversations yet',
                        technicalNeeds: 'No conversations yet',
                        timeframe: 'No conversations yet',
                        budgetIndication: 'No conversations yet'
                    },
                    reasoning: 'No conversations to analyze'
                };
            }

            const { score, interest, messageInsights, reasoning } = await analyzeLeadWithGPT(lead.conversations);
            
            const messageCount = lead.conversations.length;
            const lastMessageTime = lead.conversations[lead.conversations.length - 1]?.timestamp;
            const firstMessageTime = lead.conversations[0]?.timestamp;
            
            const engagementDuration = lastMessageTime && firstMessageTime 
                ? Math.round((lastMessageTime.getTime() - firstMessageTime.getTime()) / (1000 * 60))
                : 0;

            return {
                ...lead,
                id: lead.id, // Ensure lead ID is included
                conversations: lead.conversations.map(conv => ({
                    ...conv,
                    id: conv.id // Ensure conversation ID is included
                })),
                score,
                interest,
                messageInsights,
                reasoning,
                engagement: {
                    messageCount,
                    durationMinutes: engagementDuration,
                    lastActivity: lastMessageTime
                },
                closeChance: `${score}%`
            };
        }));

        scoredLeads.sort((a, b) => (b.score || 0) - (a.score || 0));

        return NextResponse.json(scoredLeads);
    } catch (error) {
        console.error('Failed to fetch leads:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leads' },
            { status: 500 }
        );
    }
}
