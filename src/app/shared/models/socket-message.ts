import { environment } from '../../../environments/environment';

export class SocketMessage {
  public from?: string = environment.name;
  public subject?: string = 'message';
  public body: any;
}
