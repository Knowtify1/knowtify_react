import React from "react";

// IndividualCard component to represent each group member
const IndividualCard = ({ name, role, image, description }) => (
  <div className="group bg-gray-100 p-4 rounded-md mr-4 transition duration-300 ease-in-out hover:bg-opacity-75">
    <img src={image} alt={name} className="mb-2 rounded-full w-16 h-16 object-cover" />
    <h2 className="text-lg font-bold">{name}</h2>
    <p>{role}</p>
    <p className="hidden group-hover:block">{description}</p>
  </div>
);

function About() {
  // Group members data
  const groupMembers = [
    { name: "Andre Timmango", role: "Role: Developer", image: "url_to_image1.jpg", description: "Short background about Andre." },
    { name: "Jamie Jaime", role: "Role: Designer", image: "url_to_image2.jpg", description: "Short background about Jamie." },
    { name: "Marjorie Soposop", role: "Role: Content Writer", image: "url_to_image3.jpg", description: "Short background about Marjorie." },
  ];

  return (
    <div>
      <article>
        <h1 className="text-3xl font-bold mb-4 text-center">About Us</h1>

        <div className="flex justify-center">
          {/* Render each group member using the IndividualCard component */}
          {groupMembers.map((member, index) => (
            <IndividualCard key={index} {...member} />
          ))}
        </div>
      </article>
    </div>
  );
}

export default About;
