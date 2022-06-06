import { readdir, unlink } from "fs";
import path from "path";

export function deleteContentOfDir(directory: string) {
  readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
}
