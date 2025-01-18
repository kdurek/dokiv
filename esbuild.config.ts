import esbuild from "esbuild";

try {
  esbuild
    .build({
      entryPoints: {
        server: "src/server/index.ts",
      },
      bundle: true,
      platform: "node",
      format: "esm",
      target: "node22",
      outExtension: { ".js": ".mjs" },
      minify: true,
      // sourcemap: true,
      outdir: "dist",
      tsconfig: "tsconfig.server.json",
      packages: "external",
    })
    .catch(() => {
      return process.exit(1);
    });
} catch (error) {
  console.log(error);
}
