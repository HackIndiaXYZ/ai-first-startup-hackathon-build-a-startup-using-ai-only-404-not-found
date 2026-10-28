import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  meta,
  starbucks,
  tesla,
  shopify,
  carrent,
  jobit,
  tripguide,
  javascriptMastery,
  osis,
  threejs,
  sparks,
  Admin,
  shirt,
  pod,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Full Stack Developer",
    icon: web,
  },
  {
    title: "SaaS Developer",
    icon: mobile,
  },
  {
    title: "Generative AI",
    icon: backend,
  },
  {
    title: "Data Analytics",
    icon: creator,
  },
];

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Redux Toolkit",
    icon: redux,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "Next.js",
    icon: threejs,
  },
  {
    name: "git",
    icon: git,
  },
  {
    name: "figma",
    icon: figma,
  },
  {
    name: "docker",
    icon: docker,
  },
];

const experiences = [
  {
    title: "Full Stack Developer",
    company_name: "Javascipt Mastery",
    icon: javascriptMastery,
    iconBg: "#383E56",
    date: "August 2024 - Present",
    points: [
      "Developed a unique Software-as-a-Service (SaaS) application integrating AI-powered features using Next.js 14 and Convex.",
      "Implemented a text-to-multiple-voices functionality, allowing users to convert text into various synthesized voices.",
      "Collaborated with the design team to ensure a seamless and user-friendly interface for the AI features.",
      "Developed and maintained backend services to support AI functionalities, ensuring scalability and performance.",
    ],
  },
  {
    title: "Web Developer",
    company_name: "Sparks Foundation",
    icon: sparks,
    iconBg: "#E6DEDD",
    date: "March 2024 - April 2024",
    points: [
      "Assisted in the design, development, and maintenance of websites and web applications using HTML, CSS, JavaScript, and React.",
      "Collaborated with senior developers to implement responsive and user-friendly web interfaces.",
      "Participated in daily stand-up meetings and contributed to team discussions on improving website performance and user experience.",
    ],
  },
  {
    title: "Web Developer",
    company_name: "Oasis Infobyte",
    icon: osis,
    iconBg: "#383E56",
    date: "April 2024 - May 2024",
    points: [
      "Developed and maintained web applications using modern JavaScript frameworks such as React.js and Next.js.",
      "Assisted in the creation of RESTful APIs to enhance backend functionality and improve data integration.",
      "Collaborated with cross-functional teams, including designers and backend developers, to ensure seamless project delivery..",
    ],
  },
  {
    title: "Full stack Developer",
    company_name: "Web Prodigies",
    icon: meta,
    iconBg: "#E6DEDD",
    date: "Jan 2024 - Present",
    points: [
      "Developed and deployed AI-powered features for the company's SaaS platform using Next.js, MongoDB, and Node.js.",
      "Worked on both frontend and backend development to create a seamless integration of AI models into web applications.",
      "Created RESTful APIs to facilitate data exchange between the frontend and AI models, ensuring smooth integration.",
    ],
  },
];

const testimonials = [
  {
    testimonial:
      "I am extremely impressed with the 3D portfolio website developed by Nishant. The attention to detail, creativity, and technical expertise exceeded my expectations. I highly recommend Nishant for any web development project!",
    name: "Bhavesh",
    designation: "Software Developer",
    company: "Capgemini",
    image: "https://media.licdn.com/dms/image/C4E03AQGAvALU5AVH9A/profile-displayphoto-shrink_800_800/0/1629624174486?e=1723075200&v=beta&t=iYHlQN6dcdTSXevt8hsufGGxtemSNbSM-z6MSIYRgB8",
  },
  {
    testimonial:
    "Nishant developed a stunning minimalistic portfolio for me that beautifully highlights my academic and extracurricular achievements. The website is clean, easy to navigate, and perfectly captures my personal brand."

    ,
    name: "Saloni",
    designation: "Student",
    company: "Nirma University",
    image: "https://img.freepik.com/premium-photo/sticker-girl-learning-coding-fundamental-creative-design-bold-line-cute-kawaii-st_655090-455242.jpg",
  },
  {
    testimonial:
    "Working with Nishant was an exceptional experience. They demonstrated professionalism, creativity, and attention to detail throughout the project. The end result exceeded my expectations and perfectly met my needs."

    ,
    name: "Abhishek",
    designation: "Student",
    company: "Pune university",
    image: "https://t3.ftcdn.net/jpg/06/01/17/18/360_F_601171862_l7yZ0wujj8o2SowiKTUsfLEEx8KunYNd.jpg",
  },
];

const projects = [
  {
    name: "Real time Admin Dashboard",
    description:
      "Build an admin dashboard with full authentication, a homepage displaying charts and activities, a comprehensive table for companies with CRUD and search, and a Kanban board with real-time synchronization.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "Typescript",
        color: "green-text-gradient",
      },
      {
        name: "GraphQL",
        color: "pink-text-gradient",
      },
    ],
    image: Admin,
    source_code_link: "https://github.com/Nishant-chaudhari-7/Refine-Admin-Dashboard?tab=readme-ov-file",
  },
  {
    name: "3D Shirt Website",
    description:
      "Developed a dynamic T-shirt customization website featuring user-uploaded patterns and logos, displayed in a 3D view for interactive design visualization. Integrated OpenAI to generate AI-powered patterns and logos based on user prompts. Enabled users to save and share their unique T-shirt designs as downloadable images.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "Three.js",
        color: "green-text-gradient",
      },
      {
        name: "OpenAI",
        color: "pink-text-gradient",
      },
    ],
    image: shirt,
    source_code_link: "https://github.com/Nishant-chaudhari-7/3D_Shirt_Website",
  },
  {
    name: "Full Stack AI SaaS App - Podcastr",
    description:
      "Developed a unique Software-as-a-Service (SaaS) application using Next.js 14 and Convex, featuring AI-powered functionalities. Implemented text-to-multiple-voices conversion and AI-generated images based on user prompts. Ensured seamless integration and user-friendly interface for enhanced user experience.",
    tags: [
      {
        name: "nextjs-14",
        color: "blue-text-gradient",
      },
      {
        name: "convex",
        color: "green-text-gradient",
      },
      {
        name: "OpenAI",
        color: "pink-text-gradient",
      },
    ],
    image: pod,
    source_code_link: "https://github.com/Nishant-chaudhari-7",
  },
];

export { services, technologies, experiences, testimonials, projects };
