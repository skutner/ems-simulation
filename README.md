# EMS Simulation

Simulator EMS pentru o baterie de stocare la scară utilitară (BESS) care face arbitraj pe PZU (Piața pentru Ziua Următoare, OPCOM) la rezoluție de 15 minute.

- Optimizare pe toată ziua prin programare dinamică pe starea de încărcare (SoC).
- Pierderile în baterie: randamentul dus-întors se împarte egal între încărcare și descărcare (η = √RTE).
- Tarifele reglementate (TL, servicii de sistem, distribuție, certificate verzi, cogenerare) se plătesc pe toată energia extrasă din rețea; TG se plătește pe energia injectată.
- Limită de cicluri pe zi, cost de degradare, consum pentru servicii interne.
- Prețuri sintetice de exemplu sau prețuri reale lipite (format românesc sau englezesc, lei sau EUR).

Valorile tarifelor sunt ilustrative. Verificați ordinele ANRE în vigoare.

Pagina este un singur fișier static: `index.html`. Testul motorului de calcul:

```
node test/engine-test.js index.html
```
