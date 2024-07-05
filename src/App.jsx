import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css'; 

const API_KEY = import.meta.env.VITE_API_KEY;

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [fetchedData, setFetchedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const handleInputChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!prompt.trim()) return;

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
      setLoading(true); // Start loader

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      console.log(text, "text");
      setGeneratedText(text);

      const postData = async () => {
        const data = {
          timestamp: new Date().toISOString(),
          prompt: prompt,
          post: text
        };

        const response = await fetch("https://sheetdb.io/api/v1/dtw679iteai9q", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        });

        if (!response.ok) {
          throw new Error('Failed to post data');
        }

        await response.json();
        getData();
      };

      await postData();
      setPrompt(''); // Clear the input
    } catch (error) {
      console.error('Error generating content or posting data:', error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const getData = async () => {
    try {
      setLoading(true); // Start loader

      const response = await fetch('https://sheetdb.io/api/v1/dtw679iteai9q');
      const data = await response.json();
      setFetchedData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    // Scroll to bottom when fetchedData changes
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [fetchedData]);

  return (
    <div className="container">
      <h1>Post Generator ✍</h1>
      {loading && <div className="loader"><p>Loading...</p> 
      <p>Please scroll down 👇, to see latest result.</p>
      </div>}
      <div className="content">
        <ul className="data-list" ref={listRef}>
          {fetchedData.map((item, index) => (
            <li key={index}>
              <strong><span style={{ backgroundColor: 'white' }}>👉</span></strong>  {item.post} <br />
            </li>
          ))}
        </ul>
      </div>
      <div className="form-container">
        <form className="input-form" onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={handleInputChange}
            placeholder="Enter prompt here...!"
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default App;
