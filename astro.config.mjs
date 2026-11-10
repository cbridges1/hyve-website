// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import icon from 'astro-icon';
import { rehypeBaseLinks } from './src/plugins/rehype-base-links.mjs';

// GitHub Pages serves this as a project site at /hyve-website/, so the CI
// build (where GitHub Actions sets CI=true) needs that base path. Local
// dev/build skip it so localhost keeps working at the root.
const base = process.env.CI ? '/hyve-website' : '/';

export default defineConfig({
  site: 'https://cbridges1.github.io',
  // Note: this must stay a plain object passed to defineConfig, not the
  // (command) => ({...}) function form — that form broke Starlight's MDX
  // content-entry resolution in `astro dev`.
  base,
  markdown: {
    // Astro/Starlight only base-prefix hrefs they generate themselves
    // (sidebar nav, prev/next pagination). Any link an author writes by
    // hand in markdown prose — e.g. [Quick Start](/docs/quickstart) — is
    // left as-is, which 404s once base is non-root. This plugin fixes that
    // for every .md/.mdx page; component-authored hrefs (e.g. Card.astro)
    // are fixed separately at the component level since they render after
    // this pass.
    rehypePlugins: [rehypeBaseLinks(base)],
  },
  integrations: [
    icon(),
    starlight({
      title: 'Hyve',
      description: 'Kubernetes clusters from templates, on Cluster API and Fleet',
      favicon: '/favicon.svg',
      logo: {
        light: '/src/assets/logo-light.svg',
        dark: '/src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      customCss: ['./src/styles/custom.css'],
      social: {
        github: 'https://github.com/cbridges1/hyve',
      },
      editLink: {
        baseUrl: 'https://github.com/cbridges1/hyve-website/edit/main/',
      },
      components: {
        Header: './src/components/Header.astro',
        Hero: './src/components/Hero.astro',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Why hyve', link: '/docs/why-hyve' },
            { label: 'Quickstart', link: '/docs/quickstart' },
            { label: 'Installation', link: '/docs/installation' },
            { label: 'How hyve works', link: '/docs/how-it-works' },
          ],
        },
        {
          label: 'Running hyve',
          items: [
            { label: 'Local mode', link: '/docs/running/local-mode' },
            { label: 'Standalone install', link: '/docs/running/standalone' },
            { label: 'Replacing Rancher', link: '/docs/running/replacing-rancher' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Templates', link: '/docs/concepts/templates' },
            { label: 'Clusters', link: '/docs/concepts/clusters' },
            { label: 'Environments', link: '/docs/concepts/environments' },
            { label: 'Resources', link: '/docs/concepts/resources' },
            { label: 'Secrets', link: '/docs/concepts/secrets' },
            { label: 'Repositories', link: '/docs/concepts/repositories' },
            { label: 'Providers', link: '/docs/concepts/providers' },
            { label: 'Delivery: agents and push', link: '/docs/concepts/delivery' },
            { label: 'Users and access', link: '/docs/concepts/access' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Writing a template', link: '/docs/guides/writing-a-template' },
            { label: 'Delivering apps', link: '/docs/guides/delivering-apps' },
            { label: 'kubectl access', link: '/docs/guides/kubectl-access' },
            { label: 'The web UI', link: '/docs/guides/web-ui' },
            { label: 'Signing in with OIDC', link: '/docs/guides/oidc' },
            { label: 'hyve in CI', link: '/docs/guides/ci' },
            { label: 'Bringing in existing clusters', link: '/docs/guides/existing-clusters' },
            { label: 'Importing old templates', link: '/docs/guides/importing' },
          ],
        },
        {
          label: 'CLI Reference',
          autogenerate: { directory: 'docs/cli' },
        },
      ],
    }),
  ],
});
