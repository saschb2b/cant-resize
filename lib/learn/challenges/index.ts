import type { Challenge } from "../types";
import { mediaQueryChallenges } from "./media-queries";
import { breakpointHooksChallenges } from "./breakpoint-hooks";
import { muiResponsiveChallenges } from "./mui-responsive";

/**
 * All challenges, combined from per-category modules.
 *
 * To add a new challenge, find the relevant category file in this directory
 * and append your challenge to its array.
 */
export const challenges: Challenge[] = [
  ...mediaQueryChallenges,
  ...breakpointHooksChallenges,
  ...muiResponsiveChallenges,
];
