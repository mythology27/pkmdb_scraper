const fs = require('fs-extra')
const path = require('path')
const cheerio = require('cheerio')
const xml2js = require('xml2js')
const { readXml, value2barchartRank } = require('../helpers/utils')
const config = require('../configs/app.config')

const sourceUrl = config.crawl.sourceUrl


const getPokemon = (rawPokemon, pokemons) => {
    let pokemon = {}
    let properties = [
		'name', 'img', 'id', 'types', 'species', 'height', 
    	'weight', 'abilities', 'ev', 'catch_rate', 'base_friendship',
    	'base_exp', 'growth_rate', 'egg', 'gender', 'egg_cycles',
    	'hp', 'hp_bar_rank', 'hp_bar', 'hp_min', 'hp_max',
        'atk', 'atk_bar_rank', 'atk_bar', 'atk_min', 'atk_max',
        'dfs', 'dfs_bar_rank', 'dfs_bar', 'dfs_min', 'dfs_max',
    	'sp_atk', 'sp_atk_bar_rank', 'sp_atk_bar', 'sp_atk_min', 'sp_atk_max',
    	'sp_dfs', 'sp_dfs_bar_rank', 'sp_dfs_bar', 'sp_dfs_min', 'sp_dfs_max',
        'spd', 'spd_bar_rank', 'spd_bar', 'spd_min', 'spd_max', 'total', 'evols'
    ]
    for (var i = 0; i < properties.length; i++) {
        if (properties[i] === 'types') {
            pokemon[properties[i]] = rawPokemon['pokemon'][properties[i]][0]['type'].map(function(t) {
                return { 'type_name': t['_'], 'type_url': sourceUrl + t['$']['url'] }
            })
        } else if (properties[i] === 'evols') {
            if (rawPokemon['pokemon'].hasOwnProperty('evols')) {
                pokemon[properties[i]] = rawPokemon['pokemon'][properties[i]][0]['evol'].map(function(t) {
                    return { 'name': t['_'], 'url': t['$']['url'], 'url_img': t['$']['url_img'] }
                })
            } else {
                pokemon[properties[i]] = []
            }
        } else {
            pokemon[properties[i]] = rawPokemon['pokemon'][properties[i]][0]
        }
    }
    pokemons[pokemon['name'].toLowerCase()] = pokemon
    return pokemons
}


const crawlPokemon = async (url, path) => {
    const res = await fetch(url)
    const body = await res.text()

    let pokemon = {
        /*
            id: 001,
            name: 'Bulbasaur',
            img: '',
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
            },
            species: 'Seed Pokemon',
            height: '2′04″ (0.7 m)',
            weight: '15.2 lbs (6.9 kg)',
            abilities: 'Overgrow',
            ev: '1 Special Attack',
            catch_rate: '45 (5.9% with PokéBall, full HP)',
            base_friendship: '70 (normal)',
            base_exp: '64',
            growth_rate: 'Medium Slow'
            egg: 'grass, monster'
            gender: '87.5% male, 12.5% female',
            egg_cycles: '20 (4,884–5,140 steps)',
            hp: '45',
            hp_min: '200',
            hp_max: '294',
            atk: '49',
            atk_min: '92',
            atk_max: '216',
            dfs: '49',
            dfs_min: '92',
            dfs_max: '216',
            spatk: '65',
            spatk_min: '121',
            spatk_max: '251',
            spdfs: '65',
            spdfs_min: '121',
            spdfs_max: '251',
            spd: '45',
            spd_min: '85',
            spd_max: '207',
            total: '318'
        */
    }
    const pkm = cheerio.load(body)
    pokemon['name'] = pkm('h1').text()
    pokemon['img'] = pkm('a[rel=lightbox] img').attr('src')
    pokemon['id'] = pkm('th:contains("National №")').next().eq(0).text()
    const types = pkm('th:contains("Type")').eq(0).nextAll().find('a')
    let type_list = []
    for (var i = 0; i < types.length; i++) {
        let type = {}
        type['_'] = types.eq(i).text()
        type['$'] = { url: types.eq(i).attr('href') }
        type_list.push(type)
    }
    pokemon['types'] = { 'type': type_list }
    pokemon['species'] = pkm('th:contains("Species")').next().eq(0).text()
    pokemon['height'] = pkm('th:contains("Height")').next().eq(0).text()
    pokemon['weight'] = pkm('th:contains("Weight")').next().eq(0).text()
    pokemon['abilities'] = pkm('th:contains("Abilities")').next().eq(0).find('span a').text()
    pokemon['ev'] = pkm('th:contains("EV yield")').next().eq(0).text().trim()
    pokemon['catch_rate'] = pkm('th:contains("Catch rate")').next().eq(0).text()
    pokemon['base_friendship'] = pkm('th:contains("Base Friendship")').next().eq(0).text()
    pokemon['base_exp'] = pkm('th:contains("Base Exp")').next().eq(0).text()
    pokemon['growth_rate'] = pkm('th:contains("Growth Rate")').next().eq(0).text()
    pokemon['egg'] = pkm('th:contains("Egg Groups")').next().eq(0).text().trim()
    pokemon['gender'] = pkm('th:contains("Gender")').next().eq(0).text()
    pokemon['egg_cycles'] = pkm('th:contains("Egg cycles")').next().eq(0).text().trim()
    const hp = pkm('th:contains("HP")').eq(0).nextAll()
    pokemon['hp'] = hp.eq(0).text()
    pokemon['hp_bar_rank'] = value2barchartRank(pokemon['hp'])
    pokemon['hp_bar'] = hp.eq(1).find('div').attr('style')
    pokemon['hp_min'] = hp.eq(2).text()
    pokemon['hp_max'] = hp.eq(3).text()
    const atk = pkm('th:contains("Attack")').eq(0).nextAll()
    pokemon['atk'] = atk.eq(0).text()
    pokemon['atk_bar_rank'] = value2barchartRank(pokemon['atk'])
    pokemon['atk_bar'] = atk.eq(1).find('div').attr('style')
    pokemon['atk_min'] = atk.eq(2).text()
    pokemon['atk_max'] = atk.eq(3).text()
    const dfs = pkm('th:contains("Defense")').eq(0).nextAll()
    pokemon['dfs'] = dfs.eq(0).text()
    pokemon['dfs_bar_rank'] = value2barchartRank(pokemon['dfs'])
    pokemon['dfs_bar'] = dfs.eq(1).find('div').attr('style')
    pokemon['dfs_min'] = dfs.eq(2).text()
    pokemon['dfs_max'] = dfs.eq(3).text()
    const spatk = pkm('th:contains("Sp. Atk")').eq(0).nextAll()
    pokemon['sp_atk'] = spatk.eq(0).text()
    pokemon['sp_atk_bar_rank'] = value2barchartRank(pokemon['sp_atk'])
    pokemon['sp_atk_bar'] = spatk.eq(1).find('div').attr('style')
    pokemon['sp_atk_min'] = spatk.eq(2).text()
    pokemon['sp_atk_max'] = spatk.eq(3).text()
    const spdfs = pkm('th:contains("Sp. Def")').eq(0).nextAll()
    pokemon['sp_dfs'] = spdfs.eq(0).text()
    pokemon['sp_dfs_bar_rank'] = value2barchartRank(pokemon['spdfs'])
    pokemon['sp_dfs_bar'] = spdfs.eq(1).find('div').attr('style')
    pokemon['sp_dfs_min'] = spdfs.eq(2).text()
    pokemon['sp_dfs_max'] = spdfs.eq(3).text()
    const spd = pkm('th:contains("Speed")').eq(0).nextAll()
    pokemon['spd'] = spd.eq(0).text()
    pokemon['spd_bar_rank'] = value2barchartRank(pokemon['spd'])
    pokemon['spd_bar'] = spd.eq(1).find('div').attr('style')
    pokemon['spd_min'] = spd.eq(2).text()
    pokemon['spd_max'] = spd.eq(3).text()
    pokemon['total'] = pkm('td[class*=cell-total]').eq(0).text()
    const evolsImg = pkm('span[class=infocard-lg-img]')
    const evolsName = pkm('span[class*=infocard-lg-data] a[class=ent-name]')
    let evolList = []
    if (evolsImg.length != 0) {
        for (var i = 0; i < evolsImg.length; i++) {
            let evol = {}
            evol['_'] = evolsName.eq(i).text()
            evol['$'] = { url: evolsName.eq(i).attr('href'), url_img: evolsImg.eq(i).find('img').attr('src') }
            evolList.push(evol)
        }
        pokemon['evols'] = { 'evol': evolList }
    }

    const writeToFile = new Promise(resolve => {
        const builder = new xml2js.Builder()
        const xml = builder.buildObject({ 'pokemon': pokemon })
        const writeStream = fs.createWriteStream(path)
        writeStream.cork()
        writeStream.write(xml)
        process.nextTick(() => writeStream.uncork())
        writeStream.on('finish', () => {
            console.log(pokemon['name'] + "'s information is saved!")
            resolve()
        })
        writeStream.end()
    })
    await writeToFile
}


const getDetail = async (req, res) => {
	const pokemonName = req.params.pokemonName
	if (!req.session.pokemons) {
		req.session.pokemons = {}
	}
    if (!req.session.pokemons.hasOwnProperty(pokemonName)) {
        const xmlPath = path.join(__dirname, '..', '/data/' + pokemonName + '.xml')
        const readFromFile = new Promise(resolve => {
            fs.open(xmlPath, 'r', async (err, fd) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        if (typeof req.session.pokedict == 'undefined') {
                            console.log('Redirecting to home...')
                            res.redirect('/')
                        } else if (req.session.pokedict.hasOwnProperty(pokemonName)) {
                            console.log(pokemonName + "'s info is not found, starting to crawl!!")
                            await crawlPokemon(req.session.pokedict[pokemonName]['url'], xmlPath)
                        } else {
                            console.log(pokemonName + "'s info is not found")
                            res.locals.homeUrl = req.protocol + '://' + req.get('host')
                            res.locals.crtUrl = res.locals.homeUrl + req.originalUrl
                            return res.render('404.pug')
                        }
                    }
                }
                readXml(xmlPath, (data) => {
                    req.session.pokemons = getPokemon(data, req.session.pokemons)
                    resolve()
                })
            })
        })
        await readFromFile
    }
	return res.render('detail.pug', { pokemon: req.session.pokemons[pokemonName] })
}

module.exports = {
	getDetail
}