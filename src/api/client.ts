const normalizeBaseUrl = (value: string | undefined): string => {
	if (!value || value.trim().length === 0) {
		throw new Error(
			'NEXT_PUBLIC_API_URL no está configurada. Añádela al archivo .env con la URL base de la API.',
		);
	}

	const sanitized = value.trim();
	return sanitized.endsWith('/') ? sanitized : `${sanitized}/`;
};

export const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

export interface ApiRequestOptions extends RequestInit {
	/** Si es true, no aplicará cabeceras JSON por defecto */
	skipJsonHeaders?: boolean;
}

export class ApiError<T = unknown> extends Error {
	public readonly status: number;
	public readonly payload: T | null;

	constructor(message: string, status: number, payload: T | null = null) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.payload = payload;
	}
}

const defaultHeaders = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
};

const findFirstString = (value: unknown): string | null => {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			const result = findFirstString(item);
			if (result) {
				return result;
			}
		}
		return null;
	}

	if (value && typeof value === 'object') {
		for (const key of Object.keys(value as Record<string, unknown>)) {
			const result = findFirstString((value as Record<string, unknown>)[key]);
			if (result) {
				return result;
			}
		}
	}

	return null;
};

const resolveErrorMessage = (payload: unknown, fallback: string): string => {
	if (!payload || typeof payload !== 'object') {
		return fallback;
	}

	const data = payload as Record<string, unknown>;
	const directMessage = data.detail ?? data.error ?? data.message;

	if (typeof directMessage === 'string') {
		const trimmed = directMessage.trim();
		if (trimmed.length > 0) {
			return trimmed;
		}
	}

	if (directMessage && typeof directMessage === 'object') {
		const nested = findFirstString(directMessage);
		if (nested) {
			return nested;
		}
	}

	const nested = findFirstString(data);
	return nested ?? fallback;
};

export const apiFetch = async <TResponse = unknown>(
	path: string,
	{ skipJsonHeaders, ...options }: ApiRequestOptions = {},
): Promise<TResponse> => {
	const url = `${API_BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;

	const headers = new Headers(options.headers);
	if (!skipJsonHeaders) {
		Object.entries(defaultHeaders).forEach(([key, value]) => {
			if (!headers.has(key)) {
				headers.set(key, value);
			}
		});
	}

	const response = await fetch(url, {
		...options,
		headers,
	});

	const contentType = response.headers.get('Content-Type') ?? '';
	const isJson = contentType.includes('application/json');
	const payload = isJson ? await response.json().catch(() => null) : null;

	if (!response.ok) {
		const fallback = response.statusText || 'Error en la solicitud';
		const message = resolveErrorMessage(payload, fallback);
		throw new ApiError(message, response.status, payload);
	}

	return payload as TResponse;
};

export const withAuth = (init: RequestInit = {}): RequestInit => {
	if (typeof window === 'undefined') return init;

	const headers = new Headers(init.headers);
	const token = localStorage.getItem('pymedesk.accessToken');
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	return {
		...init,
		headers,
	};
};
