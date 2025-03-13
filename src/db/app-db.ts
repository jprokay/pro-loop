import Dexie, { EntityTable } from "dexie";
import Loops from "./tables/loop";

export default class AppDB extends Dexie {
  loops!: EntityTable<Loops, "id">;

  constructor() {
    super("ProLoopsDB");
    this.version(1).stores({
      loops: "++id, videoId, loopName",
    });
    this.loops.mapToClass(Loops);
  }
}
