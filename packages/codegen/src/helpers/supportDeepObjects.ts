import { ParameterObject } from "./openApi3-x";

/**
 * @deprecated This is actually no longer used as with 7.0
 * (https://github.com/oazapfts/oazapfts/blob/0749939947f5bae60842322254cd109dfbee053b/packages/codegen/src/generate.ts#L1430C35-L1432)
 * This had only been applied to converted specs that are no longer handled
 * by oazapfts. Keeping this as a reminder in the codebase for now.
 * Could be moved in a swagger plugin that handles the conversion from Swagger to OpenAPI.
 *
 * Despite its name, OpenApi's `deepObject` serialization does not support
 * deeply nested objects. As a workaround we detect parameters that contain
 * square brackets and merge them into a single object.
 */
export function supportDeepObjects(params: ParameterObject[]) {
  const res: ParameterObject[] = [];
  const merged: any = {};
  params.forEach((p) => {
    const m = /^(.+?)\[(.*?)\]/.exec(p.name);
    if (!m) {
      res.push(p);
      return;
    }
    const [, name, prop] = m;
    let obj = merged[name];
    if (!obj) {
      obj = merged[name] = {
        name,
        in: p.in,
        style: "deepObject",
        schema: {
          type: "object",
          properties: {},
        },
      };
      res.push(obj);
    }
    obj.schema.properties[prop] = p.schema;
  });
  return res;
}
