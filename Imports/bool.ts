import { isly } from "isly"

export type bool = 1 | 0
export const bool = isly.union<bool, 1, 0>(isly.number(1), isly.number(0))
