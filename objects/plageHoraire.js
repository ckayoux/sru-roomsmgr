const weekday = require(__dirname+"/weekDays")
const Horaire = require(__dirname+"/horaire")

var plageHoraire = function(j, hdebut, hfin) {
    this.jour = weekday.getByCode(j)
    if (this.jour === undefined) this.jour = j
    this.debut = new Horaire(hdebut[0], hdebut[1])
    this.fin = new Horaire(hfin[0], hfin[1])
}

// retourne une chaine de caractère qui représente une plage horaire (jour de la semaine et horaires et début et de fin
plageHoraire.prototype.toString = function () {
    return `plageHoraire { jour: ${this.jour.brightGreen}, debut: ${this.debut}, fin: ${this.fin}}`
}

plageHoraire.prototype.duree= function () {
    let val= parseFloat( this.fin.heure,10)-parseFloat(this.debut.heure,10)
    return val
}

// retourne vrai si il y a une intersection entre les plages horaires, sinon faux
plageHoraire.prototype.intersection = function (autrePlageHoraire) {
    if (this.jour === autrePlageHoraire.jour) {
        if (this.fin.equals(autrePlageHoraire.fin) || this.debut.equals(autrePlageHoraire.debut) ||
        (this.debut.apres(autrePlageHoraire.debut) && this.debut.avant(autrePlageHoraire.fin)) ||
            (this.fin.apres(autrePlageHoraire.debut) && this.fin.avant(autrePlageHoraire.fin)) ||
            (autrePlageHoraire.debut.apres(this.debut) && autrePlageHoraire.debut.avant(this.fin)) ||
            (autrePlageHoraire.fin.apres(this.debut) && autrePlageHoraire.fin.avant((this.fin))))
            return true
    }
    return false
}

module.exports = plageHoraire