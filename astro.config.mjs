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
      description: 'GitOps-first Kubernetes cluster management CLI',
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
            { label: 'Why Hyve', link: '/docs/why-hyve' },
            { label: 'Quickstart', link: '/docs/quickstart' },
            { label: 'Installation', link: '/docs/installation' },
            { label: 'Configuration', link: '/docs/configuration' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Modules', link: '/docs/concepts/modules' },
            { label: 'Clusters', link: '/docs/concepts/clusters' },
            { label: 'Templates', link: '/docs/concepts/templates' },
            { label: 'Workflows', link: '/docs/concepts/workflows' },
            { label: 'Resources', link: '/docs/concepts/resources' },
            { label: 'Repositories', link: '/docs/concepts/repositories' },
            { label: 'GitOps', link: '/docs/concepts/gitops' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Git Management', link: '/docs/guides/git-management' },
            { label: 'Cluster Management', link: '/docs/guides/cluster-management' },
            { label: 'Workflow Management', link: '/docs/guides/workflow-management' },
            { label: 'Resource Management', link: '/docs/guides/resource-management' },
            { label: 'Template Management', link: '/docs/guides/template-management' },
            { label: 'Kubeconfig Management', link: '/docs/guides/kubeconfig-management' },
            { label: 'CI/CD', link: '/docs/guides/cicd' },
            { label: 'ArgoCD', link: '/docs/guides/argocd' },
            { label: 'Server Mode', link: '/docs/guides/server-mode' },
          ],
        },
        {
          label: 'CLI Reference',
          items: [
            { label: 'Overview', link: '/docs/cli/overview' },
            { label: 'cluster', link: '/docs/cli/cluster' },
            { label: 'module', link: '/docs/cli/module' },
            { label: 'template', link: '/docs/cli/template' },
            { label: 'workflow', link: '/docs/cli/workflow' },
            { label: 'git', link: '/docs/cli/git' },
            { label: 'serve', link: '/docs/cli/serve' },
            { label: 'tui', link: '/docs/cli/tui' },
          ],
        },
        {
          label: 'More',
          items: [
            { label: 'Sample Repo', link: 'https://github.com/cbridges1/hyve-sample-repo' },
            { label: 'Hyve Studio', link: 'https://github.com/cbridges1/hyve-studio' },
          ],
        },
      ],
    }),
  ],
});
