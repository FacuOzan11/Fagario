
import { NETWORK_CHANNEL_NAME } from '../constants';
import { Player } from '../types';

type Message = 
  | { type: 'PLAYER_UPDATE'; player: Player }
  | { type: 'PLAYER_DISCONNECT'; id: string }
  | { type: 'PLAYER_EATEN'; predatorId: string; preyId: string };

export class NetworkService {
  private channel: BroadcastChannel;
  private onMessageCallback: (msg: Message) => void;

  constructor(onMessage: (msg: Message) => void) {
    this.channel = new BroadcastChannel(NETWORK_CHANNEL_NAME);
    this.onMessageCallback = onMessage;
    this.channel.onmessage = (event) => this.onMessageCallback(event.data);
  }

  broadcastPlayerUpdate(player: Player) {
    this.channel.postMessage({ type: 'PLAYER_UPDATE', player });
  }

  broadcastDisconnect(id: string) {
    this.channel.postMessage({ type: 'PLAYER_DISCONNECT', id });
  }

  broadcastEaten(predatorId: string, preyId: string) {
    this.channel.postMessage({ type: 'PLAYER_EATEN', predatorId, preyId });
  }

  close() {
    this.channel.close();
  }
}
