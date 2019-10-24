/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const webSiteName = 'web'
const projectName = 'qio'

// List of projects/orgs using your project for the users page.
const users = [
  {
    // caption: 'User1',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/${name}/img/image.jpg'.
    // image: `/${projectName}/${webSiteName}/img/undraw_open_source.svg`,
    // infoLink: 'https://www.facebook.com',
    // pinned: true
  }
]

const siteConfig = {
  title: 'QIO', // Title for your website.
  tagline: 'An effect management library',
  url: `https://tusharmath.com/${projectName}`, // Your website URL
  baseUrl: `/${projectName}/${webSiteName}/`, // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/${name}/',

  // Used for publishing and more
  projectName: `${webSiteName}`,
  organizationName: 'tusharmath',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    // {doc: 'getting-started', label: 'Getting Started'},
    // {doc: 'doc4', label: 'API'},
    // {page: 'help', label: 'Help'},
    {doc: 'benchmarks', label: 'Benchmarks'},
    {href: 'https://github.com/tusharmath/qio', label: 'Github'}
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  // headerIcon: 'img/favicon.ico',
  footerIcon: 'img/favicon.ico',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#444bb1',
    secondaryColor: '#0a3e2f'
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  fonts: {
    myFont: ['Lora', 'Serif']
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} tusharmath.com`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default'
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  // docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/${name}',

  stylesheets: [
    'https://fonts.googleapis.com/css?family=Lora:400,700&display=swap'
  ]
}

module.exports = siteConfig
