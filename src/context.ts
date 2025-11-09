import { ctx as baseCtx } from "./context-generated";
import { makeFragmentTree } from "./expr-core";

export const ctx = Object.assign({}, baseCtx, {
  /**
   * Direct push event payload alias (root of github.event for push).
   * https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#push
   */
  get pushEvent() {
    return makeFragmentTree("github.event");
  },
  /**
   * Direct pull_request payload alias (github.event.pull_request).
   * https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request
   */
  get prEvent() {
    return makeFragmentTree("github.event.pull_request");
  },
  /**
   * Direct workflow_dispatch event alias (github.event).
   * Inputs are under .inputs.
   * https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch
   */
  get workflowDispatchEvent() {
    return makeFragmentTree("github.event");
  },
  /**
   * Direct repository_dispatch event alias (github.event).
   * Custom payload is under .client_payload.
   * https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#repository_dispatch
   */
  get repositoryDispatchEvent() {
    return makeFragmentTree("github.event");
  },
  /**
   * Push event view. The push webhook payload lives at the root of github.event.
   * https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#push
   */
  get push() {
    return {
      get event() {
        return makeFragmentTree("github.event");
      },
    };
  },
  /**
   * Pull request event view. The pull_request payload is under github.event.pull_request.
   * https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request
   */
  get pr() {
    return {
      get event() {
        return makeFragmentTree("github.event");
      },
    };
  },
  /**
   * workflow_dispatch event view. Inputs are under github.event.inputs.
   * https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch
   */
  get workflow_dispatch() {
    return {
      get event() {
        return makeFragmentTree("github.event");
      },
    };
  },
  /**
   * repository_dispatch event view. Custom payload is under github.event.client_payload.
   * https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#repository_dispatch
   */
  get repository_dispatch() {
    return {
      get event() {
        return makeFragmentTree("github.event");
      },
    };
  },
});

export * from "./expr-core";
export { fn } from "./context-generated";
