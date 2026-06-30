import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import { componentTagger } from "lovable-tagger";

const SITEMAP_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
] as const;

function seoBuildPlugin(): Plugin {
  let outDir = "dist";

  return {
    name: "seo-build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    transformIndexHtml(html) {
      const siteUrl = process.env.VITE_SITE_URL?.replace(/\/$/, "");
      if (!siteUrl) return html;
      return html
        .replace(
          "</head>",
          `    <link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />\n  </head>`
        )
        .replace(/content="\/new_rebrand\/bg\.jpg"/g, `content="${siteUrl}/new_rebrand/bg.jpg"`);
    },
    closeBundle() {
      const siteUrl = process.env.VITE_SITE_URL?.replace(/\/$/, "");
      if (!siteUrl) return;

      const lastmod = new Date().toISOString().split("T")[0];
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_PAGES.map(
  (page) => `  <url>
    <loc>${siteUrl}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
).join("\n")}
</urlset>
`;

      writeFileSync(path.join(outDir, "sitemap.xml"), sitemap, "utf-8");

      const robotsSrc = readFileSync(path.join("public", "robots.txt"), "utf-8");
      const sitemapLine = `Sitemap: ${siteUrl}/sitemap.xml`;
      const robots = robotsSrc.includes("Sitemap:")
        ? robotsSrc.replace(/Sitemap:.*/m, sitemapLine)
        : `${robotsSrc.trimEnd()}\n\n${sitemapLine}\n`;

      writeFileSync(path.join(outDir, "robots.txt"), robots, "utf-8");
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    seoBuildPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
