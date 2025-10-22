import { NextRequest, NextResponse } from 'next/server';


jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data) => ({
            json: async () => data,
            status: data.status || 200,
        })),
    },
}));

import { POST } from '../route';

global.fetch = jest.fn();

describe('Action Network API Route', () => {
    const mockEnv = {
        ACTION_NETWORK_FORM_ID: 'test-form-id',
        ACTION_NETWORK_API_KEY: 'test-api-key',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        process.env.ACTION_NETWORK_FORM_ID = mockEnv.ACTION_NETWORK_FORM_ID;
        process.env.ACTION_NETWORK_API_KEY = mockEnv.ACTION_NETWORK_API_KEY;
    })

    afterEach(() => {
        jest.restoreAllMocks();
    })

    const createMockRequest = (body: any): NextRequest => {
        return {
            json: async () => body,
        } as NextRequest;
    }

    it('should submit data to Action Network with correct headers', async () => {
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ success: true }),
        });

        const requestBody = {
            person: {
                given_name: 'Demo',
                family_name: 'User',
                email_addresses: [{ address: 'test@example.com', status: 'subscribed' }],
                custom_fields: {
                    'Sign-Up_E-Newsletter': '1',
                },
            },
            triggers: { autoresponse: { enabled: true } },
        };

        const req = createMockRequest(requestBody);

        await POST(req)

        expect(mockFetch).toHaveBeenCalledWith(
            `https://actionnetwork.org/api/v2/forms/${mockEnv.ACTION_NETWORK_FORM_ID}/submissions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'OSDI-API-Token': mockEnv.ACTION_NETWORK_API_KEY,
                },
                body: JSON.stringify(requestBody),
            }
        );
    });

    it('should return success response when Action Network returns ok', async () => {
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ id: 'submission-123' }),
        });

        const requestBody = {
            person: {
                email_addresses: [{ address: 'test@example.com', status: 'subscribed' }],
            },
        };

        const req = createMockRequest(requestBody);
        const response = await POST(req);
        const responseData = await response.json();

        expect(responseData.success).toBe(true);
        expect(responseData.status).toBe(200);
    });

    
})