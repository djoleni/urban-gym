URBAN GYM NIS - biznis sajt (staticki frontend)

Pokretanje: otvori index.html (za najbolji rezultat preko lokalnog servera, npr. "python3 -m http.server").
Hosting: iskopiraj ceo folder na bilo koji staticki hosting (Netlify, Vercel, Cloudflare Pages, klasican hosting).

Struktura:
  index.html      - sadrzaj i SEO podaci (schema.org)
  css/style.css   - dizajn (boje i mere su u :root na vrhu)
  js/main.js      - interakcije (hero prekidac, status radnog vremena, cenovnik, galerija)
  assets/img      - optimizovane fotografije i logo
  assets/fonts    - Big Shoulders Display i Manrope (lokalno, bez Google Fonts)

Cene: u index.html, sekcija #cenovnik, atributi data-m (muskarci) i data-f (zene).
Pre objave: dodati og:image i pravi domen (canonical), proveriti cene i telefon.
