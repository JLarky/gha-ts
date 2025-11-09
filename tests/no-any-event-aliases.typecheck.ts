import { ctx } from "../src/context";

// Type-level helpers to detect `any`
type IsAny<T> = 0 extends (1 & T) ? true : false;
type ExpectFalse<T extends false> = T;

// Ensure event alias roots are not `any`
type _root_push_not_any = ExpectFalse<IsAny<typeof ctx.pushEvent>>;
type _root_pr_not_any = ExpectFalse<IsAny<typeof ctx.prEvent>>;
type _root_wd_not_any = ExpectFalse<IsAny<typeof ctx.workflowDispatchEvent>>;
type _root_rd_not_any = ExpectFalse<IsAny<typeof ctx.repositoryDispatchEvent>>;

// Ensure common push payload paths are not `any`
type _push_ref_not_any = ExpectFalse<IsAny<typeof ctx.pushEvent.ref>>;
type _push_head_commit_not_any = ExpectFalse<
  IsAny<typeof ctx.pushEvent.head_commit>
>;
type _push_head_commit_id_not_any = ExpectFalse<
  IsAny<typeof ctx.pushEvent.head_commit.id>
>;
type _push_pusher_email_not_any = ExpectFalse<
  IsAny<typeof ctx.pushEvent.pusher.email>
>;

// Ensure PR payload paths are not `any`
type _pr_number_not_any = ExpectFalse<IsAny<typeof ctx.prEvent.number>>;
type _pr_head_ref_not_any = ExpectFalse<IsAny<typeof ctx.prEvent.head.ref>>;
type _pr_base_ref_not_any = ExpectFalse<IsAny<typeof ctx.prEvent.base.ref>>;

// Ensure dispatch payload containers are not `any`
type _wd_inputs_not_any = ExpectFalse<
  IsAny<typeof ctx.workflowDispatchEvent.inputs>
>;
type _rd_client_payload_not_any = ExpectFalse<
  IsAny<typeof ctx.repositoryDispatchEvent.client_payload>
>;


