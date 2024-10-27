import { FiolinJsGlobal } from "./types";

// You can't replace the global shared object, since it's a shared reference,
// but it's tedious to reset things between invocations.
export function resetShared(shared: FiolinJsGlobal) {
  shared.inFileName = null;
  shared.outFileName = null;
  shared.argv = null;
}
