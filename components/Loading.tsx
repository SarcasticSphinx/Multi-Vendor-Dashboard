import React from "react";
import { PropagateLoader } from "react-spinners";

const Loading = () => {
  const color = "var(--secondary)";
  const loading = true;
  //   const override = {};

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      <PropagateLoader
      className="absolute top-1/2 left-1/2"
        color={color}
        loading={loading}
        // cssOverride={override}
        size={30}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Loading;
