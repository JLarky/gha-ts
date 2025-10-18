import {
  checkout as checkoutAction,
  CheckoutOptions,
} from "../../../src/actions";
import { Step } from "../../../src/workflow-types";

export function checkout(options?: CheckoutOptions): Step {
  return {
    name: "checkout",
    ...checkoutAction(options),
    uses: "actions/checkout@v5",
  };
}

export function installPkl(): Step {
  return {
    name: "Install pkl",
    uses: "pkl-community/setup-pkl@v0",
    with: {
      "pkl-version": "0.26.1",
    },
  };
}

export function installMise(): Step {
  return {
    name: "Install mise",
    uses: "jdx/mise-action@v3",
  };
}

export function checkoutAndInstallPkl(): Step[] {
  return [checkout(), installPkl()];
}

export function checkoutAndInstallMise(): Step[] {
  return [checkout(), installMise()];
}
