// src/pages/User.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const User: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  return <h1>User Profile for User ID: {userId}</h1>;
};

export default User;