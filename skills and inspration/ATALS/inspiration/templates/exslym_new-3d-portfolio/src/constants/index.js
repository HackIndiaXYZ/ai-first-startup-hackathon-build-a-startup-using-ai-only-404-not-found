export const navLinks = [
  {
    id: 1,
    name: 'Home',
    href: '#home',
  },
  {
    id: 2,
    name: 'About',
    href: '#about',
  },
  {
    id: 3,
    name: 'Work',
    href: '#work',
  },
  {
    id: 4,
    name: 'Contact',
    href: '#contact',
  },
];

export const myProjects = [
  {
    title: '3D Developer Portfolio — Showing skills',
    desc: "An outstanding and impressive 3D Portfolio website with levitating developer's work space, animated project cards, amazing contact form and a lot of 3D animated elements.",
    subdesc:
      'Built as a unique frontend app with React, Tailwind CSS, Three JS, Framer Motion and parallax effects, which is designed for demonstrating skills.',
    href: 'https://exslym.github.io/My-Portfolio-3D/',
    texture: '/textures/project/project1.mp4',
    logo: '/assets/project-logo1.png',
    logoStyle: {
      backgroundColor: '#13202F',
      border: '0.2px solid #17293E',
      boxShadow: '0px 0px 60px 0px #2F6DB54D',
    },
    spotlight: '/assets/spotlight.png',
    tags: [
      {
        id: 1,
        name: 'React',
        path: '/assets/react.svg',
      },
      {
        id: 2,
        name: 'TailwindCSS',
        path: 'assets/tailwindcss.png',
      },
      {
        id: 3,
        name: 'ThreeJS',
        path: '/assets/threejs.svg',
      },
      {
        id: 4,
        name: 'Framer Motion',
        path: '/assets/framer.png',
      },
    ],
  },
  {
    title: 'LiveDoc — Real-Time Google Docs Clone',
    desc: 'LiveDoc is a powerful collaborative app that elevates the capabilities of real-time document editing. As an enhanced version of Google Docs, It supports millions of collaborators simultaneously, ensuring that every change is captured instantly and accurately.',
    subdesc:
      'With LiveDoc, users can experience the future of collaboration, where multiple contributors work together in real time without any lag, by using Next.js and Liveblocks newest features.',
    href: 'https://exs-live-docs.vercel.app/',
    texture: '/textures/project/project2.mp4',
    logo: '/assets/project-logo2.png',
    logoStyle: {
      backgroundColor: '#13202F',
      border: '0.2px solid #17293E',
      boxShadow: '0px 0px 60px 0px #2F6DB54D',
    },
    spotlight: '/assets/spotlight.png',
    tags: [
      {
        id: 1,
        name: 'NextJS',
        path: '/assets/nextjs.svg',
      },
      {
        id: 2,
        name: 'React',
        path: '/assets/react.svg',
      },
      {
        id: 3,
        name: 'TailwindCSS',
        path: 'assets/tailwindcss.png',
      },
      {
        id: 4,
        name: 'TypeScript',
        path: '/assets/typescript.png',
      },
    ],
  },

  {
    title: 'EXS Startups — Your Startups Directory',
    desc: 'A NextJS 15 platform where entrepreneurs can submit their startup ideas for virtual pitch competitions, browse other pitches, and gain exposure through a clean minimalistic design for a smooth user experience.',
    subdesc:
      ' This project showcases the latest features of NextJS 15, React 19, including NextJS Form for seamless client-side form submissions, and Server Component HMR Cache for faster development.',
    href: 'https://ex-directory.vercel.app/',
    texture: '/textures/project/project3.mp4',
    logo: '/assets/exs-logo.png',
    logoStyle: {
      backgroundColor: '#13202F',
      border: '0.2px solid #17293E',
      boxShadow: '0px 0px 60px 0px #2F6DB54D',
    },
    spotlight: '/assets/spotlight.png',
    tags: [
      {
        id: 1,
        name: 'NextJS',
        path: '/assets/nextjs.svg',
      },
      {
        id: 2,
        name: 'React',
        path: '/assets/react.svg',
      },
      {
        id: 3,
        name: 'TailwindCSS',
        path: 'assets/tailwindcss.png',
      },
      {
        id: 4,
        name: 'TypeScript',
        path: '/assets/typescript.png',
      },
    ],
  },
  {
    title: 'Eventlify — Platform for Managing Events',
    desc: 'A Fullstack Events App with NextJS, React, Typescript, TailwindCSS and Stripe.',
    subdesc:
      'Built on NextJS, the events application stands as a comprehensive, full-stack platform for managing events. It serves as a hub, spotlighting diverse events taking place globally. Featuring seamless payment processing through Stripe, you have the capability to purchase tickets for any event or even initiate and manage your own events.',
    href: 'https://eventlify-exs.vercel.app/',
    texture: '/textures/project/project4.mp4',
    logo: '/assets/project-logo4.png',
    logoStyle: {
      backgroundColor: '#13202F',
      border: '0.2px solid #17293E',
      boxShadow: '0px 0px 60px 0px #2F6DB54D',
    },
    spotlight: '/assets/spotlight.png',
    tags: [
      {
        id: 1,
        name: 'NextJS',
        path: '/assets/nextjs.svg',
      },
      {
        id: 2,
        name: 'React',
        path: '/assets/react.svg',
      },
      {
        id: 3,
        name: 'TailwindCSS',
        path: 'assets/tailwindcss.png',
      },
      {
        id: 4,
        name: 'TypeScript',
        path: '/assets/typescript.png',
      },
    ],
  },
  {
    title: 'Tiny 3D World — Animated Portfolio',
    desc: 'An outstanding animated 3D Developer Portfolio website with levitating island and flying models using 3D-graphics and animations with React, R3F, R3D and Tailwind CSS.',
    subdesc:
      'Built with React, React Three Fiber, React Three Drei, Tailwind CSS and EmailJS. It is an animated portfolio website with 3D graphics.',
    href: 'https://exslym.github.io/Tiny-World-3D/',
    texture: '/textures/project/project5.mp4',
    logo: '/assets/project-logo5.png',
    logoStyle: {
      backgroundColor: '#13202F',
      border: '0.2px solid #17293E',
      boxShadow: '0px 0px 60px 0px #2F6DB54D',
    },
    spotlight: '/assets/spotlight.png',
    tags: [
      {
        id: 1,
        name: 'React',
        path: '/assets/react.svg',
      },
      {
        id: 2,
        name: 'ThreeJS',
        path: '/assets/threejs.svg',
      },
      {
        id: 3,
        name: 'TailwindCSS',
        path: 'assets/tailwindcss.png',
      },
    ],
  },
];

export const calculateSizes = (isSmall, isMobile, isTablet) => {
  return {
    deskScale: isSmall ? 0.05 : isMobile ? 0.06 : 0.065,
    deskPosition: isMobile ? [0.5, -4.5, 0] : [0.25, -5.5, 0],
    cubePosition: isSmall ? [4, -5, 0] : isMobile ? [5, -5, 0] : isTablet ? [5, -5, 0] : [9, -5.5, 0],
    reactLogoPosition: isSmall ? [3, 4, 0] : isMobile ? [5, 4, 0] : isTablet ? [5, 4, 0] : [12, 3, 0],
    ringPosition: isSmall ? [-5, 7, 0] : isMobile ? [-10, 10, 0] : isTablet ? [-12, 10, 0] : [-24, 10, 0],
    targetPosition: isSmall ? [-5, -10, -10] : isMobile ? [-9, -10, -10] : isTablet ? [-11, -7, -10] : [-13, -13, -10],
  };
};

export const workExperiences = [
  {
    id: 1,
    name: 'NextJS',
    pos: 'Fullstack Developer',
    duration: '2022 - Present',
    title:
      'NextJS is my go-to framework for building fast, dynamic web applications. It simplifies development with server-side rendering and static site generation, ensuring optimal performance and seamless user experiences.',
    icon: '/assets/nextjs.svg',
    animation: 'clapping',
  },
  {
    id: 2,
    name: 'ThreeJS',
    pos: 'Frontend Developer',
    duration: '2022 - Present',
    title:
      'ThreeJS is my trusted library for creating 3D web experiences. It brings complex visualizations to life, enabling interactive and immersive designs directly in the browser with ease.',
    icon: '/assets/threejs.svg',
    animation: 'salute',
  },
  {
    id: 3,
    name: 'React',
    pos: 'Frontend Developer',
    duration: '2019 - 2024',
    title:
      'React is my preferred library for building dynamic user interfaces. Its component-based architecture and efficient rendering make creating interactive, high-performing applications seamless and intuitive.',
    icon: '/assets/react.svg',
    animation: 'clapping',
  },
  {
    id: 4,
    name: 'Figma',
    pos: 'Frontend Developer',
    duration: '2019 - 2022',
    title:
      'Figma is my collaborative design platform of choice. I utilize it to work seamlessly with team members and clients, facilitating real-time feedback and design iterations. Its cloud-based.',
    icon: '/assets/figma.svg',
    animation: 'victory',
  },
];
