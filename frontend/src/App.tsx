import React from "react";
import CreateForm from "./components/CreateForm";
import LinksList from "./components/LinksList";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Shortly</h1>
        <p>Simple, fast URL shortener</p>
        <p>small and efficient</p>
      </header>
      <main className="container">
        <CreateForm />
        <LinksList />
      </main>
      <footer className="footer">Built with TypeScript, React & Express</footer>
    </div>
  );
}
