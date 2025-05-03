export default function getAccountCookieValue() {
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];

    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }

    if (cookie.startsWith('account=')) {
      return cookie.substring('account='.length, cookie.length);
    }
  }
  
  return undefined;
}