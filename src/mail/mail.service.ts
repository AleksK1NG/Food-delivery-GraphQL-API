import { Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import * as FormData from 'form-data';
import got from 'got';

@Injectable()
export class MailService {
  private logger = new Logger('MailService');
  constructor(@Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions) {}

  private async sendEmail(subject: string, template: string, emailVars: EmailVar[], to = 'address@gmail.com') {
    const form = new FormData();

    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', template);

    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));

    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`,
        },
        body: form,
      });
    } catch (e) {
      this.logger.error(e.message, e.trace);
    }
  }

  sendVerificationEmail(email: string, code: string, to?: string) {
    this.sendEmail(
      'Verify Your Email',
      'verify-email',
      [
        { key: 'code', value: code },
        { key: 'username', value: email },
      ],
      to,
    );
  }
}
