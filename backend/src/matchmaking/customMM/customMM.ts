import { Matchmaker, IMatchMakerOptions } from "./matchMaker";
import { MatchMakingGateway } from "../matchmaking.gateway";

interface ICustomMMOptions extends IMatchMakerOptions {}

export class CustomMM<P> extends Matchmaker<P> {
  constructor(
    resolver: (players: P[]) => void,
    getKey: (player: P) => string,
    mgateway: MatchMakingGateway,
    options?: ICustomMMOptions
  ) {
    super(resolver, getKey, mgateway, options);

    setInterval(this.FifoMatch, this.checkInterval);
  }

  private FifoMatch = (): void => {
    let players: P[];
    while (this.queue.length >= this.minMatchSize) {
      players = [];
      while (this.queue.length > 0 && players.length < this.maxMatchSize) {
        players.push(this.queue.pop() as P);
      }
      this.resolver(players);
    }
  };
}
