import type { UserConfig } from "vite";
import * as vpr from "vite-plugin-react";
import path from "path";
import * as fs from "fs";

const basePath = path.join(__dirname, "src");

module.exports = {
  jsx: "react",
  plugins: [vpr],
  resolvers: [
    {
      alias: {
        "/@app/": path.join(__dirname, "app"),
        "/@content/": basePath,
      },
    },
  ],
  configureServer: ({ app, resolver }) => {
    app.use(async (ctx, next) => {
      if (ctx.path === "/proxy-module" && ctx.query.path) {
        const actualModulePath = ctx.query.path;
        const resolvedFilePath = resolver.requestToFile(actualModulePath);
        if (!fs.existsSync(resolvedFilePath)) {
          ctx.status = 404;
          return;
        }
        ctx.body = `export { default } from "${actualModulePath}";
export * from "${actualModulePath}";`;
        ctx.type = "js";
      }
      return next();
    });
  },
} as UserConfig;
