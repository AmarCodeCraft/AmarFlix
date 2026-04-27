/**
 * Local fallback movie data.
 *
 * When the backend is running and connected to MongoDB, the app will
 * fetch from /api/videos instead. This file provides a seamless
 * offline/development fallback so the UI always renders.
 *
 * Each movie includes a `videoUrl` field which directly points to
 * an S3, Cloudinary, or any other CDN streaming URL.
 */
export const movies = [
  {
    id: 1,
    _id: "local_1",
    title: "The Matrix",
    description:
      "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
    thumbnail:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    videoUrl:
      "https://v.ftcdn.net/17/55/42/50/700_F_1755425048_sIjnfC3i6GICrGwm3PkEyae2PtqDvB6e_ST.mp4",

    category: "Trending",
  },
  {
    id: 2,
    _id: "local_2",
    title: "Inception",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
    thumbnail:
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",

    category: "Trending",
  },
  {
    id: 3,
    _id: "local_3",
    title: "Interstellar",
    description:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked with piloting a spacecraft to find a new home for humanity.",
    thumbnail:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",

    category: "Latest",
  },
  {
    id: 4,
    _id: "local_4",
    title: "Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests of his ability to fight injustice.",
    thumbnail:
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",

    category: "Recommended",
  },
  {
    id: 5,
    _id: "local_5",
    title: "Avengers",
    description:
      "Earth's mightiest heroes must come together to stop a threat that no single hero could face alone.",
    thumbnail:
      "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",

    category: "Trending",
  },
  {
    id: 6,
    _id: "local_6",
    title: "John Wick",
    description:
      "An ex-hit-man comes out of retirement to track down the gangsters who destroyed everything he held dear.",
    thumbnail:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",

    category: "Latest",
  },
  {
    id: 7,
    _id: "local_7",
    title: "Dune",
    description:
      "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset in the galaxy.",
    thumbnail:
      "https://images.unsplash.com/photo-1547234935-80c7145ec969?w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",

    category: "Recommended",
  },
  {
    id: 8,
    _id: "local_8",
    title: "Oppenheimer",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    thumbnail:
      "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",

    category: "Latest",
  },
];
