import { getMergeRequestApprovals } from "./gitlab";

async function main() {
  console.log(await getMergeRequestApprovals(12));
}

main();
