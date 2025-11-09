import { ctx as baseCtx } from "./context-generated";
import { makeFragmentTree, type FragmentTree } from "./expr-core";
import type { EventPayload } from "./events-generated";

export const ctx = Object.assign({}, baseCtx, {
  /**
   * Direct push event payload alias (root of github.event for push).
   * https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#push
   */
  get pushEvent(): FragmentTree<EventPayload<"push">> {
    return makeFragmentTree<EventPayload<"push">>("github.event");
  },
  /**
   * Direct pull_request payload alias (github.event.pull_request).
   * https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request
   */
  get prEvent(): FragmentTree<EventPayload<"pull_request">["pull_request"]> {
    return makeFragmentTree<EventPayload<"pull_request">["pull_request"]>(
      "github.event.pull_request",
    );
  },
  /**
   * Direct workflow_dispatch event alias (github.event).
   * Inputs are under .inputs.
   * https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch
   */
  get workflowDispatchEvent(): FragmentTree<EventPayload<"workflow_dispatch">> {
    return makeFragmentTree<EventPayload<"workflow_dispatch">>("github.event");
  },
  /**
   * Direct repository_dispatch event alias (github.event).
   * Custom payload is under .client_payload.
   * https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#repository_dispatch
   */
  get repositoryDispatchEvent(): FragmentTree<
    EventPayload<"repository_dispatch">
  > {
    return makeFragmentTree<EventPayload<"repository_dispatch">>(
      "github.event",
    );
  },
});

export * from "./expr-core";
export { fn } from "./context-generated";
