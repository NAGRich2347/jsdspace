import React from 'react';
import api from '../services/api';
export default function Login() {
  // Converted from main-login.html
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form action="/rest/login" method="post" className="space-y-2">
        <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" required />
        <input name="password" type="password" placeholder="Password" className="w-full p-2 border rounded" required />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
      </form>
    </div>
  );
}