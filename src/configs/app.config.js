require('dotenv').config()

const config = {}
config.web = {}
config.crawl = {}

config.web.port = process.env.PORT || 3000
config.crawl.sourceUrl = 'https://pokemondb.net'
config.crawl.pokedexPath = '/pokedex/game/lets-go-pikachu-eevee'

module.exports = config