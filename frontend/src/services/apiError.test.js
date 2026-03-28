import { getApiErrorMessage, getAuthErrorMessage } from './apiError';

describe('apiError helpers', () => {
    test('returns auth-specific message for invalid credentials', () => {
        const error = {
            response: {
                status: 401,
                data: {
                    message: 'Incorrect or invalid password',
                },
            },
        };

        expect(getAuthErrorMessage(error)).toBe('Incorrect or invalid password');
    });

    test('returns network message when no response is available', () => {
        const error = {
            message: 'Network Error',
        };

        expect(getApiErrorMessage(error)).toBe('Unable to connect to the server');
    });

    test('returns backend validation message when present', () => {
        const error = {
            response: {
                status: 400,
                data: {
                    message: 'UPI ID is required',
                },
            },
        };

        expect(getApiErrorMessage(error)).toBe('UPI ID is required');
    });
});
