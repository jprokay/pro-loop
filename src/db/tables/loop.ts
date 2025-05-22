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
  tags?: string[] = []; // Add tags array
}

type AddLoopProps = {
  loopName: string;
  startMinute: number;
  startSecond: number;
  endMinute: number;
  endSecond: number;
  videoId: string;
  videoName: string;
  tags?: string[]; // Add optional tags property
};

export async function addLoop(props: AddLoopProps) {
  return await db.loops.add({ ...props });
}

export async function updateTags(id: number, tags: string[]) {
  return await db.loops
    .where("id")
    .equals(id)
    .modify((loop) => {
      loop.tags = [];
      tags.forEach((tag) => loop.tags!.push(tag));
      console.log("Loop tags: ", loop.tags);
      return true;
    });
}

export async function updateLoop(id: number, props: AddLoopProps) {
  return await db.loops.update(id, { ...props });
}
