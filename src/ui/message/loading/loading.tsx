import React from "react";
import { Message } from "../message";
import "./loading.css";

export const Loading: React.FC = () => {
  const loadingContent = (
    <div className="loading-content">
      <h3>Loading...</h3>
      <div className="loading-spinner" />
      <p>Initializing game...</p>
    </div>
  );

  return <Message content={loadingContent} />;
};

export default Loading;
