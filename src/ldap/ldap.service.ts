import { Injectable, Logger } from '@nestjs/common';
import * as ldap from 'ldapjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LdapService {
  private readonly logger = new Logger(LdapService.name);
  private client: ldap.Client | null = null;

  constructor(private configService: ConfigService) {}

  /**
   * Возвращает готовый к работе LDAP-клиент.
   * Если клиент уже подключен — использует его, иначе создаёт новый и выполняет bind.
   */
  private async getClient(): Promise<ldap.Client> {
    // Если клиент уже существует и подключен, возвращаем его
    if (this.client?.connected) {
      return this.client;
    }

    // Создаём новый клиент
    this.client = ldap.createClient({
      url: this.configService.get<string>('LDAP_URL'),
      tlsOptions: { rejectUnauthorized: false }, // Для разработки (в проде должно быть true)
    });

    this.client.on('error', (err) => {
      this.logger.error(`LDAP client error: ${err.message}`);
    });

    // Выполняем аутентификацию (bind) от имени сервисной учётной записи
    return new Promise((resolve, reject) => {
      this.client!.bind(
        this.configService.get<string>('LDAP_BIND_DN'),
        this.configService.get<string>('LDAP_BIND_PW'),
        (err) => {
          if (err) {
            this.logger.error(`LDAP bind failed: ${err.message}`);
            return reject(err);
          }
          this.logger.log('LDAP bind successful');
          resolve(this.client!);
        },
      );
    });
  }

  /**
   * Выполняет поиск в LDAP-каталоге.
   */
  async search(base: string, options: ldap.SearchOptions): Promise<any[]> {
    const client = await this.getClient();
    const entries: any[] = [];

    this.logger.log(`Starting LDAP search: base="${base}", filter="${options.filter}", scope="${options.scope}"`);

    return new Promise((resolve, reject) => {
      client.search(base, options, (err, res) => {
        if (err) {
          this.logger.error(`LDAP search error: ${err.message}`);
          return reject(err);
        }

        res.on('searchEntry', (entry) => {
          const obj: any = {
            dn: entry.objectName?.toString() || '', // берём objectName как DN
          };

          // Обрабатываем атрибуты
          if (entry.attributes && Array.isArray(entry.attributes)) {
            entry.attributes.forEach((attr: any) => {
              const key = attr.type;
              const values = attr.values || [];
              // Если значение одно — берём его, иначе массив
              obj[key] = values.length === 1 ? values[0] : values;
            });
          }

          entries.push(obj);
        });

        res.on('error', (err) => {
          this.logger.error(`LDAP search stream error: ${err.message}`);
          reject(err);
        });

        res.on('end', (result) => {
          if (result?.status !== 0) {
            return reject(new Error(`LDAP search ended with status ${result?.status}`));
          }
          resolve(entries);
        });
      });
    });
  }
}