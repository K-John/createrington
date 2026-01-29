import React from "react";
import { useParams } from "react-router-dom";
import styles from "./ServerDetail.module.scss";

export const ServerDetail: React.FC = () => {
  const { serverId } = useParams();
  
  return (
    <div className={styles.container}>
      <h1>Server {serverId}</h1>
      <p>Server detail page coming soon...</p>
    </div>
  );
};
