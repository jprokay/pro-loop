import { Entity } from "dexie";
import type AppDB from "~/db/app-db";
import { db } from "~/db/db";
export default class Loops extends Entity<AppDB> {
  id!: number;
  videoId!: string;
  startMinute!: number;
  startSecond!: number;
  endMinute!: number;
  endSecond!: number;
  loopName!: string;
  videoName!: string;
}

type AddLoopProps = {
  loopName: string;
  startMinute: number;
  startSecond: number;
  endMinute: number;
  endSecond: number;
  videoId: string;
  videoName: string;
};

export async function addLoop(props: AddLoopProps) {
  await db.loops.add({ ...props });
}

export async function updateLoop(id: number, props: AddLoopProps) {
  await db.loops.update(id, { ...props });
}
