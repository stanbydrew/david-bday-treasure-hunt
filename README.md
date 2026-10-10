# david-bday-treasure-hunt

Vânătoare de comori pentru ziua lui David. Site static, mobile-first, în română.
HTML + CSS + JavaScript simplu — fără framework, fără build, fără backend, fără bază de date.

## Cum rulezi local

```bash
npx serve .
```

Apoi deschide linkul afișat (de obicei `http://localhost:3000`).
`Ctrl+C` oprește serverul.

Poți și doar să dai dublu-click pe `index.html` — merge și așa, inclusiv salvarea progresului.

### Testare pe telefon (aceeași rețea Wi-Fi)

Pornește `npx serve .` pe PC, află IP-ul local al PC-ului și deschide pe telefon
`http://<IP-UL-PC-ULUI>:3000`. Dacă nu se încarcă, acceptă cererea Windows Firewall.

## Structura

| Fișier | Ce face |
| --- | --- |
| `index.html` | Cele trei ecrane: start, nivel, final |
| `style.css` | Tema negru & galben, layout mobile-first |
| `script.js` | Nivelurile, verificarea răspunsurilor, progresul |
| `assets/` | Pozele, clipurile și fundalul |
| `tools/make-hash.js` | Generează hash-uri pentru răspunsuri noi |

## Cum funcționează

- **6 locații.** Fiecare are text-indiciu, poză și clip video (se dă play manual).
- **Progresul se salvează** în `localStorage`, pe telefonul/browserul jucătorului.
  Închide tabul, revine și continuă de unde a rămas.
- **Hint-urile** sunt ascunse până apasă pe „Hint?".
- **Răspunsurile sunt stocate ca hash-uri SHA-256**, nu în clar, ca să nu le vadă
  cineva care deschide codul paginii.
- **Verificarea e iertătoare**: ignoră majuscule, spații, diacritice și cratime;
  `7,5` și `7.5` sunt amândouă corecte.

## Cum schimbi un răspuns

Răspunsurile sunt hash-uite, deci nu le poți edita direct. Generează hash-ul nou:

```bash
node tools/make-hash.js "raspuns" "varianta2" "varianta3"
```

Copiază rezultatul în câmpul `answers` al ghicitorii respective din `script.js`.

## Cum schimbi textele sau nivelurile

Totul e în tabloul `LEVELS` din `script.js`. Fiecare nivel are:
`title`, `intro`, `clue`, `photo`, `video`, `rewardIntro` și `riddles`.
Logica jocului nu trebuie atinsă ca să adaugi sau să modifici niveluri.

> Notă: locația 6 folosește intenționat `assets/location1.mp4`, același clip ca locația 1.

## Deploy gratuit

Site static, deci merge oriunde. Cloudflare Pages sau Netlify, conectat la acest repo:

- **Build command:** (lasă gol)
- **Output / publish directory:** `/` (rădăcina)

Fiecare `git push` redeployează automat.
