'use client';
   import { useState } from 'react';

   export default function Home() {
     const [url, setUrl] = useState('');
     const [result, setResult] = useState('');

     const shorten = async () => {
       const res = await fetch('http://localhost:3001/shorten', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ url }),
       });
       const data = await res.json();
       setResult(data.shortUrl);
     };

     return (
       <main className="flex flex-col items-center justify-center min-h-screen gap-4">
         <h1 className="text-3xl font-bold">🔗 Link Shortener</h1>
         <input
           className="border p-2 rounded w-80"
           placeholder="https://deine-lange-url.de"
           value={url}
           onChange={(e) => setUrl(e.target.value)}
         />
         <button
           className="bg-blue-500 text-white px-4 py-2 rounded"
           onClick={shorten}
         >
           Kürzen
         </button>
         {result && <p>Dein Link: <a href={result} className="text-blue-500">{result}</a></p>}
       </main>
     );
   }