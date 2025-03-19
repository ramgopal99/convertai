import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const headersList = headers();
        const origin = (await headersList).get('origin');
        const { domain } = await request.json();

        if (!origin || !domain) {
            console.log('Auth Failed: Missing parameters', { origin, domain });
            return NextResponse.json({ 
                error: 'Missing required parameters' 
            }, { status: 400 });
        }

        const cleanRequestDomain = domain.replace(/^https?:\/\//, '').replace(/:\d+$/, '').toLowerCase();
        console.log('Checking domain:', { cleanRequestDomain, origin });

        // Allow local development domains
        if (process.env.NODE_ENV === 'development' && 
            (cleanRequestDomain.includes('localhost') || 
             cleanRequestDomain.includes('127.0.0.1'))) {
            return NextResponse.json({
                success: true,
                sessionToken: `dev-session-${Date.now()}`,
                config: {
                    theme: 'light',
                    position: 'bottom-right'
                }
            }, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }

        // Production domain check
        const domainRecord = await prisma.website.findFirst({
            where: {
                domain: cleanRequestDomain,
                isActive: true
            }
        });

        if (!domainRecord) {
            console.log('Auth Failed: Domain not found', { cleanRequestDomain });
            return NextResponse.json({ 
                error: 'Domain not authorized' 
            }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            sessionToken: `session-${Date.now()}`,
            config: {
                theme: domainRecord.theme || 'light',
                position: domainRecord.position || 'bottom-right'
            }
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    } catch (error) {
        console.error('Widget auth error:', error);
        return NextResponse.json({ 
            error: 'Authentication failed' 
        }, { status: 500 });
    }
}

export async function OPTIONS() {
    const headersList = headers();
    const origin = (await headersList).get('origin');

    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
    });
}