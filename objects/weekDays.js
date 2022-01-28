const weekDays = {
    map : new Map([
        ["D", "dimanche"],
        ["L", "lundi"],
        ["MA", "mardi"],
        ["ME", "mercredi"],
        ["J", "jeudi"],
        ["V", "vendredi"],
        ["S", "samedi"]
    ]),

    getByCode : function (code) {
        return this.map.get(code.toUpperCase())
    },

    contains : function (jour) {
        return Array.from(this.map.values()).includes(jour.toLowerCase())
    },

    getByDate : function(date) {
        return Array.from(this.map.values())[date.getDay()]
    }
}

module.exports = weekDays
