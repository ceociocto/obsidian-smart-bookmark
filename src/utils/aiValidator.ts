import { CloudAIProvider } from "../types";
import { CloudAIClientImpl } from "../api/cloudClient";

/**
 * AI configuration validator
 * Checks if AI configuration is valid and can connect
 */
export class AIConfigValidator {
	/**
	 * Validate AI configuration
	 */
	static async validate(
		provider: CloudAIProvider,
		apiKey?: string,
		baseURL?: string
	): Promise<{ valid: boolean; error?: string }> {
		// Local provider doesn't need API key
		if (provider === "local") {
			// Check if base URL is provided
			if (!baseURL) {
				return {
					valid: false,
					error: "Local provider requires API Base URL",
				};
			}

			// Try to connect to local API
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 5000);

				const headers: HeadersInit = {
					'Content-Type': 'application/json',
				};

				// Add API key if provided (some local APIs require it)
				if (apiKey) {
					headers['Authorization'] = `Bearer ${apiKey}`;
				}

				const response = await fetch(`${baseURL}/models`, {
					method: 'GET',
					signal: controller.signal,
					headers,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					return {
						valid: false,
						error: `Local API returned status ${response.status}`,
					};
				}

				return { valid: true };
			} catch (error) {
				return {
					valid: false,
					error: `Cannot connect to local API: ${error instanceof Error ? error.message : 'Unknown error'}`,
				};
			}
		}

		// OpenAI provider
		if (provider === "openai") {
			if (!apiKey || apiKey.length < 10) {
				return {
					valid: false,
					error: "OpenAI requires a valid API key",
				};
			}

			// Try to validate API key
			try {
				const client = new CloudAIClientImpl(provider, apiKey, baseURL);
				await client.analyze("https://example.com");
				return { valid: true };
			} catch (error) {
				return {
					valid: false,
					error: `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				};
			}
		}

		// Anthropic provider
		if (provider === "anthropic") {
			if (!apiKey || apiKey.length < 10) {
				return {
					valid: false,
					error: "Anthropic requires a valid API key",
				};
			}

			// Try to validate API key
			try {
				const client = new CloudAIClientImpl(provider, apiKey, baseURL);
				await client.analyze("https://example.com");
				return { valid: true };
			} catch (error) {
				return {
					valid: false,
					error: `Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				};
			}
		}

		// Custom provider
		if (provider === "custom") {
			if (!baseURL) {
				return {
					valid: false,
					error: "Custom provider requires API Base URL",
				};
			}

			if (!apiKey) {
				return {
					valid: false,
					error: "Custom provider requires an API key",
				};
			}

			// Try to connect
			try {
				const client = new CloudAIClientImpl(provider, apiKey, baseURL);
				await client.analyze("https://example.com");
				return { valid: true };
			} catch (error) {
				return {
					valid: false,
					error: `Custom API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				};
			}
		}

		return {
			valid: false,
			error: `Unknown provider: ${provider}`,
		};
	}

	/**
	 * Get configuration validation message
	 */
	static getValidationMessage(
		valid: boolean,
		error?: string,
		language: "en" | "zh" = "en"
	): string {
		if (valid) {
			return language === "zh"
				? "✅ AI 配置验证通过"
				: "✅ AI configuration validated successfully";
		}

		const prefix = language === "zh" ? "❌ AI 配置错误: " : "❌ AI configuration error: ";
		return prefix + (error || "Unknown error");
	}
}
