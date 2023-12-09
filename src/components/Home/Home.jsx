import React from "react";
import knowtifylogo from "../../assets/knowtifylogo.png";

function Home() {
  return (
    <div className="text-center mt-10">
      <img
        src={knowtifylogo}
        alt="knowtifylogo"
        className="mx-auto max-w-full h-auto mb-4"
      />

      <div className="bg-black bg-opacity-30 p-6 rounded-md">
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to Knowtify!
        </h1>
        <p className="text-lg text-white bg-black bg-opacity-30 p-6 rounded-md">
        Your go-to platform for personalized notifications and engagement.
          Knowtify empowers you to connect with your audience through targeted
          and effective messages.
        </p>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-white mb-2">Key Features:</h2>
          <div className="text-lg text-white bg-black bg-opacity-30 p-6 rounded-md">
            <p>
              Integrated EMR (Electronic Medical Record)
            </p>
            <p>
              Dynamic Calendar
            </p>
            <p>
            ""
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
