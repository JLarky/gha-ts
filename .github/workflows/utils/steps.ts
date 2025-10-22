import {
  checkout as checkoutAction,
  CheckoutOptions,
  setupNode as setupNodeAction,
  SetupNodeOptions,
} from "@jlarky/gha-ts/actions";
import { Step } from "@jlarky/gha-ts/workflow-types";

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

export function checkoutInstallMiseAndBun(): Step[] {
  return [
    checkout(),
    installMise(),
    {
      name: "Bun install",
      run: "bun install",
    },
  ];
}

export function installNode(options?: SetupNodeOptions): Step {
  return { name: "Install Node.js", ...setupNodeAction(options) };
}

export function installDeno(options?: { "deno-version"?: string }): Step {
  return {
    name: "Install Deno",
    uses: "denoland/setup-deno@v2",
    with: options,
  };
}
