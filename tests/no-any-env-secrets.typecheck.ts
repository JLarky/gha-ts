import { ctx } from "../src/context";

type IsAny<T> = 0 extends 1 & T ? true : false;
type ExpectFalse<T extends false> = T;

// Roots should not be any
type _env_root_not_any = ExpectFalse<IsAny<typeof ctx.env>>;
type _secrets_root_not_any = ExpectFalse<IsAny<typeof ctx.secrets>>;
type _vars_root_not_any = ExpectFalse<IsAny<typeof ctx.vars>>;

// Arbitrary keys should not be any
type _env_key_not_any = ExpectFalse<IsAny<typeof ctx.env.MY_VAR>>;
type _secrets_key_not_any = ExpectFalse<IsAny<typeof ctx.secrets.GITHUB_TOKEN>>;
type _vars_key_not_any = ExpectFalse<IsAny<typeof ctx.vars.MY_ORG_VAR>>;
