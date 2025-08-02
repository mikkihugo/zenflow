/**
 * Data Protection & Encryption Framework
 */

import crypto from 'crypto';

export class DataProtection {
  static encrypt(text, key) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  static decrypt(encryptedData, key) {
    const algorithm = 'aes-256-gcm';
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  static hash(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }
  
  static generateSalt(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
  
  static secureCompare(a, b) {
    return crypto.timingSafeEqual(
      Buffer.from(a, 'utf8'),
      Buffer.from(b, 'utf8')
    );
  }
}

export class SecureStorage {
  constructor(encryptionKey) {
    this.key = encryptionKey;
  }
  
  store(key, data) {
    const encrypted = DataProtection.encrypt(JSON.stringify(data), this.key);
    // Store encrypted data (implementation depends on storage backend)
    return encrypted;
  }
  
  retrieve(key, encryptedData) {
    const decrypted = DataProtection.decrypt(encryptedData, this.key);
    return JSON.parse(decrypted);
  }
}
