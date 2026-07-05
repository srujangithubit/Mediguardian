import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto.scryptSync(process.env.ENCRYPTION_SECRET || 'secret-key', 'salt', 32);
  private readonly sensitiveFields = ['medicalNotes', 'ssn']; // Fields to encrypt

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // 1. Encrypt incoming data before hitting controllers/DB
    if (request.body && typeof request.body === 'object') {
      this.processObject(request.body, 'encrypt');
    }

    // 2. Decrypt outgoing data sent back to the client
    return next.handle().pipe(
      map(data => {
        if (data) {
          if (data.success && data.data) {
            this.processObject(data.data, 'decrypt');
          } else {
            this.processObject(data, 'decrypt');
          }
        }
        return data;
      }),
    );
  }

  private processObject(obj: any, action: 'encrypt' | 'decrypt') {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.processObject(item, action));
    } else if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        if (this.sensitiveFields.includes(key) && typeof value === 'string') {
          obj[key] = action === 'encrypt' ? this.encrypt(value) : this.decrypt(value);
        } else if (typeof value === 'object') {
          this.processObject(value, action);
        }
      }
    }
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    if (!text.includes(':')) return text;
    try {
      const [ivHex, encryptedHex] = text.split(':');
      if (!ivHex || !encryptedHex) return text;
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      return text;
    }
  }
}
