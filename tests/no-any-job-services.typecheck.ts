import { ctx } from "../src/context";

type IsAny<T> = 0 extends (1 & T) ? true : false;
type ExpectFalse<T extends false> = T;

type _job_root_not_any = ExpectFalse<IsAny<typeof ctx.job>>;
type _job_services_not_any = ExpectFalse<IsAny<typeof ctx.job.services>>;
type _job_services_key_not_any = ExpectFalse<
  IsAny<typeof ctx.job.services.redis>
>;


