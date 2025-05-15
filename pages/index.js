import { useState, useEffect } from 'react';
import style from '../styles/index.module.css';
import { useRouter } from "next/navigation"
import getAccountCookie from "../components/getAccountCookie"

const generateId = () => crypto.randomUUID();

export default function Page() {
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getAccountCookie();
    if (session === undefined) {
      router.push("/login")
    }

    fetch("http://localhost:8000/api/confirm-login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.code !== 0) {
        document.cookie = `account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=Lax`;
        router.push("/login")
      } else {
        fetch(`http://localhost:8000/api/quotes?session=${session}`)
        .then(res => res.json())
        .then(res => {
          if (res.code === 0) {
            setQuotes(res.data.quotes ?? [])
          } else {
            console.log("Error: " + res)
          }
        })
      }
    })
  }, []);

  const handleQuoteChange = (event) => {
    setCurrentQuote(event.target.value);
    if (error) setError('');
  };

  const handleAuthorChange = (event) => {
    setCurrentAuthor(event.target.value);
    if (error) setError('');
  };

  const handleSubmitQuote = () => {
    if (!currentQuote.trim() || !currentAuthor.trim()) {
      setError('Both quote and author fields are required.');
      return;
    }

    const newQuote = {
      id: generateId(),
      text: currentQuote.trim(),
      author: currentAuthor.trim(),
    };

    fetch("http://localhost:8000/api/quotes", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: newQuote.id,
        text: newQuote.text, 
        author: newQuote.author,
        user_session: getAccountCookie()
      })
    })
    .then(res => res.json())
    .then(res => {
      if (res.code === 0) {
        setQuotes([newQuote, ...quotes]);
        setCurrentQuote("");
        setCurrentAuthor("");
        setError("");
      } else {
        setError("An error occured.")
      }
    })
  };

  const handleDeleteQuote = (idToDelete) => {
    fetch("http://localhost:8000/api/quotes", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: idToDelete,
        user_session: getAccountCookie()
      })
    })
    .then(res => res.json())
    .then(res => {
      if (res.code === 0) {
        setQuotes(quotes.filter(quote => quote.id !== idToDelete));
      } else {
        // Handle error
      }
    })
  };

  const handleCopyQuote = (id, text, author) => {
    const quoteToCopy = `"${text}" - ${author}`;
    const textarea = document.createElement('textarea');
    textarea.value = quoteToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy quote: ', err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <div className={style.app__container}>
      <div className={style.input__section}>
        <h2 className={style.input__section_title}>Add a New Quote</h2>
        {error && <p className={style.error_message}>{error}</p>}
        
        <div className={style.input__form_fields}>
          <div className={style.form__group}>
            <label htmlFor="quote" className={style.form__label}>
              Quote
            </label>
            <textarea
              id="quote"
              value={currentQuote}
              onChange={handleQuoteChange}
              placeholder="Enter the quote here..."
              className={style.form__textarea}
            />
          </div>
          
          <div className={style.form__group}>
            <label htmlFor="author" className={style.form__label}>
              Author
            </label>
            <input
              type="text"
              id="author"
              value={currentAuthor}
              onChange={handleAuthorChange}
              placeholder="Enter the author's name..."
              className={style.form__input}
            />
          </div>
          
          <button
            onClick={handleSubmitQuote}
            className={style.submit_button}
          >
            Add Quote
          </button>
        </div>
      </div>

      <div className={style.quotes__list_section}>
        {quotes.length > 0 && (
          <h2 className={style.quotes__list_title}>Stored Quotes</h2>
        )}
        <div className={style.quote__card_container}>
          {quotes.length === 0 ? (
            <p className={style.no_quotes_message}>No quotes added yet. Add some!</p>
          ) : (
            quotes.map((quote) => (
              <div key={quote.id} className={style.quote__card}>
                <blockquote className={style.quote__text}>
                  "{quote.text}"
                </blockquote>
                <p className={style.quote__author}>- {quote.author}</p>
                <div className={style.quote__actions}>
                  <button
                    onClick={() => handleCopyQuote(quote.id, quote.text, quote.author)}
                    className={style.quote__action_button + " " + style.copy_button}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={style.button_icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copiedId === quote.id ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => handleDeleteQuote(quote.id)}
                    className={style.quote__action_button + " " + style.delete_button}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className={style.button_icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
