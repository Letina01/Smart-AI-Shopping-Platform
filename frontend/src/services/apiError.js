export function getApiErrorMessage(error, options = {}) {
    const {
        fallbackMessage = 'Something went wrong. Please try again.',
        networkMessage = 'Unable to connect to the server',
        unauthorizedMessage = 'You are not authorized to perform this action',
        forbiddenMessage = 'You are not allowed to perform this action',
        badRequestMessage = 'The request could not be processed',
        notFoundMessage = 'The requested resource was not found',
        serverMessage = 'The server encountered an error. Please try again.',
        authMessage,
    } = options;

    const status = error?.response?.status;
    const responseData = error?.response?.data;
    const responseMessage = typeof responseData === 'string'
        ? responseData
        : responseData?.message;

    if ((status === 401 || status === 403) && authMessage) {
        return authMessage;
    }

    if (responseMessage) {
        return responseMessage;
    }

    if (!error?.response) {
        return networkMessage;
    }

    if (status === 400) {
        return badRequestMessage;
    }
    if (status === 401) {
        return unauthorizedMessage;
    }
    if (status === 403) {
        return forbiddenMessage;
    }
    if (status === 404) {
        return notFoundMessage;
    }
    if (status >= 500) {
        return serverMessage;
    }

    return fallbackMessage;
}

export function getAuthErrorMessage(error) {
    const responseData = error?.response?.data;
    const responseMessage = typeof responseData === 'string'
        ? responseData
        : responseData?.message;
    const combinedMessage = `${responseMessage || ''} ${error?.message || ''}`.toLowerCase();

    if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        combinedMessage.includes('bad credentials') ||
        combinedMessage.includes('invalid access')
    ) {
        return 'Incorrect or invalid password';
    }

    return getApiErrorMessage(error, {
        fallbackMessage: 'Login failed. Please try again.',
    });
}
