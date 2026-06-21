import { workflowRouter } from "./src/routes/workflows.ts";
import { modelRouter } from "./src/routes/models.ts";

function dump(name: string, r: any) {
  console.log("==", name, "==");
  console.log("typeof:", typeof r);
  console.log("has stack:", "stack" in r, "| is array:", Array.isArray(r.stack));
  for (const layer of r.stack) {
    const route = layer.route;
    if (route) {
      console.log("  route path:", route.path, "| methods:", Object.keys(route.methods));
    } else {
      console.log("  non-route layer name:", layer.name);
    }
  }
}
dump("workflowRouter", workflowRouter);
dump("modelRouter", modelRouter);
