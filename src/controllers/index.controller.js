const fs = require('fs-extra')
const path = require('path')
const cheerio = require('cheerio')
const xml2js = require('xml2js')
const { readXml } = require('../helpers/utils')
const config = require('../configs/app.config')

let pokedex = []
let pokedict = {}
const sourceUrl = config.crawl.sourceUrl
const pokedexPath = config.crawl.pokedexPath
const xmlPath = path.join(__dirname, '..', '/data/pokedex.xml')

fs.open(xmlPath, 'r', async (err, fd) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.log('Pokedex is not found, starting to crawl!!')
            await fs.promises.mkdir(path.join(__dirname, '..', 'data'), { recursive: true })
            await crawlPokedex()
        }
    }
    readXml(xmlPath, getPokedex)
})

const crawlPokedex = async () => {
    const res = await fetch(sourceUrl + pokedexPath)
    const body = await res.text()
    let pokedex = [
        /*{
            id: '#001',
            name: 'bulbasaur',
            url: '/pokedex/bulbasaur',
            img: 'https://img.pokemondb.net/sprites/lets-go-pikachu-eevee/normal/bulbasaur.png',
            types: {
                type: [
                    {
                        '_': 'grass',
                        '$': '/type/grass'
                    },
                    {
                        '_': 'poison',
                        '$': '/type/poison'
                    }
                ]
            }
        }*/
    ]
    const _ = cheerio.load(body)
    const data = _('.infocard ')

    for (var i = 0; i < data.length; i++) {
        let pokemon = {}
        const pdata = data.eq(i).find('span[class*=infocard-lg-data]')
        pokemon['id'] = pdata.find('small').eq(0).text()
        pokemon['name'] = pdata.find('a[class=ent-name]').eq(0).text()
        pokemon['url'] = pdata.find('a[class=ent-name]').attr('href')
        pokemon['img'] = data.eq(i).find('span[class*=infocard-lg-img] img').attr('src')
        const types = pdata.find('a[class*=itype]')
        let typeList = []
        for (var j = 0; j < types.length; j++) {
            let type = {}
            type['_'] = types.eq(j).text()
            type['$'] = { url: types.eq(j).attr('href') }
            typeList.push(type)
        }
        pokemon['types'] = { 'type': typeList }
        pokedex.push({'pokemon': pokemon})
    }

    const writeToFile = new Promise(resolve => {
        const builder = new xml2js.Builder()
        const xml = builder.buildObject({ 'pokedex': pokedex })
        const writeStream = fs.createWriteStream(xmlPath)
        writeStream.cork()
        writeStream.write(xml)
        process.nextTick(() => writeStream.uncork())
        writeStream.on('finish', () => {
            console.log('Successfully crawled the pokedex!')
            resolve()
        })
        writeStream.end()
    })
    await writeToFile
}

const getPokedex = (rawPokedex) => {
    for (var i = 0; i < rawPokedex['pokedex']['pokemon'].length; i++) {
        let pokemon = {}
        pokemon['id'] = rawPokedex['pokedex']['pokemon'][i]['id'][0]
        pokemon['name'] = rawPokedex['pokedex']['pokemon'][i]['name'][0]
        pokemon['url'] = sourceUrl + rawPokedex['pokedex']['pokemon'][i]['url'][0]
        pokemon['img'] = rawPokedex['pokedex']['pokemon'][i]['img'][0]
        pokemon['types'] = rawPokedex['pokedex']['pokemon'][i]['types'][0]['type'].map(function(t) {
            return { 'type_name': t['_'], 'type_url': sourceUrl + t['$']['url'] }
        })
        pokedex.push(pokemon)
        pokedict[pokemon['name'].toLowerCase()] = pokemon
    }
}

const getHomepage = (req, res) => {
    req.session.pokedict = pokedict
    return res.render('index.pug', { pokedex: pokedex })
}

module.exports = {
    getHomepage
}