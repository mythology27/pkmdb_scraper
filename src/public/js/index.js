function searchplz() {
    var pokemons = document.getElementsByName('pokemon')
    var pokedict = {}

    for (var i = 0; i < pokemons.length; i++) {
        var pokemon_name = document.getElementById(`pokemon${i}`).innerHTML.toLowerCase()
        pokedict[pokemon_name] = i
    }
    var search_box = document.getElementById('searchbox')
    var search = search_box.value.trim()
    var keys = Object.keys(pokedict)
    var filtered_keys = keys.filter(key => !key.includes(search))
    console.log(`you searched: ${search}`)
    console.log(pokedict)
    for (var i = 0; i < keys.length; i++) {
        if (filtered_keys.includes(keys[i]))
            pokemons[parseInt(pokedict[keys[i]])].style.display = 'none'
        else
            pokemons[parseInt(pokedict[keys[i]])].style.display = 'block'
    }
}
