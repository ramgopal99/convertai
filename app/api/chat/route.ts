import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Add this function to get company settings
async function getCompanySettings() {
    try {
        const settings = await prisma.companySettings.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        return settings;
    } catch (error) {
        console.error('Failed to fetch company settings:', error);
        return null;
    }
}

// Function to extract lead information from message
async function extractLeadInfo(message: string) {
    const extractionPrompt = `
Extract contact information from the following message. Return a JSON object with these fields:
- name: Full name if present (or null)
- email: Email address if present (or null)
- phone: Phone number if present (or null)
- company: Company name if present (or null)

Message: "${message}"

Respond only with valid JSON. If a field is not found, set it to null.`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: extractionPrompt }],
            temperature: 0,
            max_tokens: 150,
        });

        const response = completion.choices[0].message.content;
        return response ? JSON.parse(response) : null;
    } catch (error) {
        console.error('Info extraction error:', error);
        return null;
    }
}

export async function POST(request: Request) {
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }

    try {
        const { message, leadInfo } = await request.json();
        let leadId: string | null = null;

        // Get company settings
        const companySettings = await getCompanySettings();
        
        // Create dynamic prompt using company settings
        const createSystemPrompt = (hasLeadInfo: boolean) => {
            if (!companySettings) {
                return hasLeadInfo ? 
                    "You are a friendly and professional AI assistant. Focus on understanding requirements and providing solutions." :
                    "You are a friendly AI assistant. Please collect visitor information including name, email, and phone.";
            }

            const template = companySettings.promptTemplate
                .replace('{companyName}', companySettings.companyName)
                .replace('{description}', companySettings.description)
                .replace('{services}', companySettings.services.join(', '))
                .replace('{caseStudies}', companySettings.caseStudies.join('\n'))
                .replace('{specialOffers}', companySettings.specialOffers.join('\n'));

            return template;
        };

        // Update existing lead check
        if (leadInfo?.previousMessages?.length > 0) {
            const lastMessage = leadInfo.previousMessages[leadInfo.previousMessages.length - 1];
            if (lastMessage.leadId) {
                leadId = lastMessage.leadId;
                const existingLead = await prisma.lead.findUnique({
                    where: { id: leadId || undefined }
                });
                if (existingLead) {
                    const messages = [
                        { 
                            role: "system", 
                            content: createSystemPrompt(
                                !!(leadInfo?.email && leadInfo?.name && leadInfo?.phone)
                            )
                        },
                        ...leadInfo.previousMessages || [],
                        { role: "user", content: message }
                    ];

                    const completion = await openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
                        temperature: 0.7,
                        max_tokens: 150,
                    });

                    const aiResponse = completion.choices[0].message.content || '';

                    // Use existing lead, proceed to conversation
                    const conversation = await prisma.conversation.create({
                        data: {
                            leadId: leadId,
                            message: message,
                            response: aiResponse, // Use AI response instead of message
                            timestamp: new Date(),
                        }
                    });
                    const conversationId = conversation.id;
                    
                    return NextResponse.json({
                        response: aiResponse, // Return AI response instead of message
                        leadCollected: true,
                        leadId: leadId,
                        conversationId: conversationId
                    }, {
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'POST, OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                        }
                    });
                }
            }
        }

        // Extract information from the message
        const extractedInfo = await extractLeadInfo(message);
        
        // Merge extracted info with provided leadInfo
        const mergedLeadInfo = {
            email: leadInfo?.email || extractedInfo?.email || '',
            name: leadInfo?.name || extractedInfo?.name || '',
            phone: leadInfo?.phone || extractedInfo?.phone || '',
            company: leadInfo?.company || extractedInfo?.company || '',
            requirements: leadInfo?.requirements || ''
        };

        // First, try to find existing lead
        const existingLead = await prisma.lead.findFirst({
            where: {
                OR: [
                    { email: { not: '', equals: mergedLeadInfo.email?.trim() } },
                    { phone: { not: '', equals: mergedLeadInfo.phone?.trim() } }
                ]
            }
        });

        // Save or update lead information if we have any contact details
        if (mergedLeadInfo.email || mergedLeadInfo.phone || mergedLeadInfo.name) {
            try {
                const sanitizedData = {
                    email: mergedLeadInfo.email?.toLowerCase().trim() || '',
                    name: mergedLeadInfo.name?.trim() || '',
                    phone: mergedLeadInfo.phone?.replace(/[^\d+]/g, '').trim() || '',
                    company: mergedLeadInfo.company?.trim() || '',
                    requirements: mergedLeadInfo.requirements?.trim() || '',
                    updatedAt: new Date()
                };

                if (existingLead) {
                    const updatedLead = await prisma.lead.update({
                        where: { id: existingLead.id },
                        data: sanitizedData
                    });
                    leadId = updatedLead.id;
                } else {
                    const newLead = await prisma.lead.create({
                        data: {
                            ...sanitizedData,
                            createdAt: new Date()
                        }
                    });
                    leadId = newLead.id;
                }
            } catch (dbError) {
                console.error('Database Error:', dbError);
            }
        }

        // Modify system message based on collected information
        const systemMessage = createSystemPrompt(
            !!(leadInfo?.email && leadInfo?.name && leadInfo?.phone)
        );

        const messages = [
            { role: "system", content: systemMessage }
        ];

        // Add previous messages if available
        if (leadInfo?.previousMessages && Array.isArray(leadInfo.previousMessages)) {
            // Ensure we only include valid messages
            const validMessages = leadInfo.previousMessages.filter((msg: { role: string; content: string }) => 
                msg && typeof msg === 'object' && 
                (msg.role === 'user' || msg.role === 'assistant') && 
                typeof msg.content === 'string'
            );
            messages.push(...validMessages);
        }

        // Add current message
        messages.push({ role: "user", content: message });

        // Get AI completion
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
            temperature: 0.7,
            max_tokens: 150,
        });

        const aiResponse = completion.choices[0].message.content || '';

        // Save the conversation regardless of lead existence
        const timestamp = new Date();
        let conversationId = null;

        try {
            const conversation = await prisma.conversation.create({
                data: {
                    leadId: leadId || undefined,  // This will properly handle null/undefined leadId
                    message: message,
                    response: aiResponse,
                    timestamp: timestamp
                }
            });
            conversationId = conversation.id;
        } catch (dbError) {
            console.error('Failed to save conversation:', dbError);
        }

        return NextResponse.json({
            response: aiResponse,
            leadCollected: !!(mergedLeadInfo.email || mergedLeadInfo.phone || mergedLeadInfo.name),
            leadId: leadId, // Add leadId to response
            extractedInfo: extractedInfo,
            conversationId: conversationId
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}