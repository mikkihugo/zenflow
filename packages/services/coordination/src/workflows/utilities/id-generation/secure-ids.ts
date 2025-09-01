import { randomBytes } from 'crypto';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('secure-ids');

export class SecureIdGenerator {
  private static readonly DEFAULT_LENGTH = 32;
  private static readonly ENCODING = 'hex';

  constructor() {
    logger.info('SecureIdGenerator initialized');
  }

  /**
   * Generate a secure random ID
   * @param length - Length of the ID in bytes (default: 32)
   * @returns Hex-encoded secure random string
   */
  generate(length: number = SecureIdGenerator.DEFAULT_LENGTH): string {
    try {
      const bytes = randomBytes(length);
      return bytes.toString(SecureIdGenerator.ENCODING);
    } catch (error) {
      logger.error('Failed to generate secure ID', { error });
      throw new Error('Failed to generate secure ID');
    }
  }

  /**
   * Generate a secure random ID with prefix
   * @param prefix - Prefix to add to the ID
   * @param length - Length of the random part in bytes (default: 32)
   * @returns Prefixed hex-encoded secure random string
   */
  generateWithPrefix(prefix: string, length: number = SecureIdGenerator.DEFAULT_LENGTH): string {
    const randomPart = this.generate(length);
    return `${prefix}_${randomPart}`;
  }

  /**
   * Generate a URL-safe secure ID
   * @param length - Length of the ID in bytes (default: 32)
   * @returns Base64url-encoded secure random string
   */
  generateUrlSafe(length: number = SecureIdGenerator.DEFAULT_LENGTH): string {
    try {
      const bytes = randomBytes(length);
      return bytes.toString('base64url');
    } catch (error) {
      logger.error('Failed to generate URL-safe secure ID', { error });
      throw new Error('Failed to generate URL-safe secure ID');
    }
  }
}

// Legacy class for backward compatibility
export class SecureIds extends SecureIdGenerator {
  constructor() {
    super();
    logger.warn('SecureIds is deprecated, use SecureIdGenerator instead');
  }
}
