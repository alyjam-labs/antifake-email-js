/**
 * Configuration object containing fake email domains
 */
export interface FakeDomainConfig {
  domains: {
    [domain: string]: Record<string, any>;
  };
}

/**
 * Checks if a domain is a known fake/temporary email domain
 * @param domain - The domain name to check (e.g., "tempmail.com")
 * @param json - Optional configuration object containing fake domains. Uses built-in data if not provided
 * @returns The matched fake domain name if found, or false if not a fake domain
 */
export function isFakeDomain(
  domain: string,
  json?: FakeDomainConfig | false
): string | false;

/**
 * Checks if an email address uses a known fake/temporary email domain
 * @param email - The email address to check (e.g., "user@tempmail.com")
 * @param json - Optional configuration object containing fake domains. Uses built-in data if not provided
 * @returns The matched fake domain name if found, or false if not a fake email
 */
export function isFakeEmail(
  email: string,
  json?: FakeDomainConfig | false
): string | false;

/**
 * Checks if an email address uses plus addressing (subaddressing)
 * Plus addressing allows users to append a plus sign and tag to their email address (e.g., "user+tag@example.com")
 * @param email - The email address to check
 * @returns true if the email contains plus addressing in the local part, false otherwise
 */
export function isPlusAddressingEmail(email: any): boolean;
