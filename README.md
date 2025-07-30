# pkmdb-scraper

A Node.js web server that extracts [Let's Go Pikachu & Let's Go Eevee](https://pokemondb.net/pokedex/game/lets-go-pikachu-eevee) Pokédex from the [Pokémon Database](https://pokemondb.net).

## Getting started

1. Clone the repository
    ```bash
    git clone https://github.com/mythology27/pkmdb-scraper <project_name>
    ```

2. Install dependencies
    ```bash
    cd <project_name>
    npm install
    ```

3. Build and run the project
    ```bash
    npm start
    ```

4. Navigate to `http://localhost:3000`

## Project Structure
```
.
├── README.md
├── package-lock.json
├── package.json
└── src
    ├── app.js
    ├── config.js
    ├── controllers
    │   ├── detailController.js
    │   └── homeController.js
    ├── public
    │   ├── css
    │   │   ├── 404.css
    │   │   ├── detail.css
    │   │   └── index.css
    │   └── js
    │       ├── detail.js
    │       └── index.js
    ├── routes
    │   ├── detail.js
    │   └── index.js
    ├── utils.js
    └── views
        ├── 404.pug
        ├── detail.pug
        └── index.pug
```
