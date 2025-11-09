import { ctx } from "../src/context";

type IsAny<T> = 0 extends (1 & T) ? true : false;
type ExpectFalse<T extends false> = T;

// Arrays in push payload should be typed, not any
type _commits_not_any = ExpectFalse<IsAny<typeof ctx.pushEvent.commits>>;
type _first_commit_not_any = ExpectFalse<
  IsAny<(typeof ctx.pushEvent.commits)[number]>
>;
type _first_commit_id_not_any = ExpectFalse<
  IsAny<(typeof ctx.pushEvent.commits)[number]["id"]>
>;

// Arrays in PR payload should be typed, not any
type _labels_not_any = ExpectFalse<IsAny<typeof ctx.prEvent.labels>>;
type _label_name_not_any = ExpectFalse<
  IsAny<(typeof ctx.prEvent.labels)[number]["name"]>
>;


