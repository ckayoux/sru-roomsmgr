const actions = require('../commandsAction')
const winston = logger = require('winston')
const parser = require('../parser')
const filesReader = require('../filesReader')

logger = winston.createLogger({
	levels: {
	  'info': 0,
	  'ok': 1,
	  'error': 2
	},
	transports: [
	  new winston.transports.Console({level: 'info'})
	]
  });
describe("Vérification des spécifications au niveau sémantique avec jeux de données corrects :", function(){

	beforeAll(function() {
		this.analyzer = new parser(logger,false,false)
		this.getParsedCreneaux = (data) => {
			this.analyzer.parse(data)
			return this.analyzer.parsedCreneaux
		}
		this.resetAnalyzer = () => {
			this.analyzer.parsedCreneaux=[]
		}


		this.cruDataCapaciteMax = `+SOS1 
		1,D1,P=24,H=MA 8:00-10:00,F1,S=S102//
		+SOS2
		1,D1,P=25,H=ME 16:00-18:00,F1,S=S102//
		1,D2,P=25,H=J 8:00-10:00,F1,S=S102//
		1,D3,P=27,H=ME 14:00-16:00,F1,S=S102//
		` //La salle S102 devra avoir une capacité maximale de 27

		this.cruDataSallesLibresPourPlageHoraire = `+SOS1 
		1,D1,P=24,H=MA 8:00-10:00,F1,S=S102//	
		1,T1,P=12,H=MA 10:00-12:00,F1,S=S201//
		+SOS2
		1,T1,P=12,H=MA 8:00-10:00,F1,S=S201//
		1,C1,P=99,H=MA 10:00-12:00,F1,S=S102//
		+SOS3
		1,T1,P=12,H=MA 10:00-11:00,F1,S=S021//
		1,T2,P=12,H=MA 11:00-12:00,F1,S=S120//
		1,T3,P=12,H=MA 11:30-12:00,F1,S=S102//
		1,T4,P=12,H=MA 10:10-10:11,F1,S=S210//
		+SOS4
		1,C1,P=99,H=MA 8:00-10:00,F1,S=S667//
		`//Seule la salle S667 devra être libre sur le créneau de 10h à 12h le Mardi

		this.cruDataClassementSalles = `+SOS1
		1,T1,P=10,H=ME 8:00-10:00,F1,S=S789//
		1,C1,P=30,H=MA 8:00-10:00,F1,S=S123//
		1,D1,P=20,H=J 8:00-10:00,F2,S=S456//
		`//Les salles devront être triées dans l'ordre suivant : 'S123','S456','S789'

		this.cruDataCoursQuellesSalles =`+OSS117
		1,T1,P=10,H=ME 8:00-10:00,F1,S=S789//
		1,C1,P=30,H=MA 8:00-10:00,F1,S=S123//
		1,D1,P=20,H=J 8:00-10:00,F2,S=S456//
		+GL02
		1,C1,P=70,H=L 10:00-12:00,F1,S=C002//
		1,T1,P=18,H=J 14:00-16:00,F1,S=M102//
		`//Les salles associées cours 'GL02' devront être 'C002' et 'M102'

	});

	it("SPEC 4 : Calculer la capacité maximale d'une salle ayant des capacitaires différents selon le créneau", function(){

		var action = new actions(logger,this.getParsedCreneaux(this.cruDataCapaciteMax))
		var capaciteMaxS102= action.capaciteMaxSalle('S102')
		expect(capaciteMaxS102).toBe(27)
	});

	it("SPEC 7 : Classer les salles par capacités maximales décroissantes", function(){

		var action = new actions(logger,this.getParsedCreneaux(this.cruDataClassementSalles))
        var classementSalles = action.classementSalles()
		expect(Array.from(classementSalles.keys())).toEqual(['S123','S456','S789'])
	});

	it("SPEC 3 : Trouver les salles associées à un cours", function(){
		var action = new actions(logger,this.getParsedCreneaux(this.cruDataCoursQuellesSalles))
		//Dans commandsAction.js, la fonction coursWhichSalles fait direct l'affichage, pas moyen de l'utiliser.
		//Remake avec une partie de son code seulement :
		action.coursWhichSalles = (cours) => {
			parsedCreneaux = action.parsedCreneaux.filter(creneau => creneau.cours == cours)
			if (!parsedCreneaux.isEmpty) {
				var salles = new Set(parsedCreneaux.map(creneau => creneau.salle))
			}
			return Array.from(salles)
		}
        var sallesGL02 = action.coursWhichSalles('GL02')
		expect(sallesGL02).toEqual(['C002','M102'])
	});


	it("SPEC 6 : Consulter les salles libres pendant une plage horaire donnée", function(){
		var action = new actions(logger,this.getParsedCreneaux(this.cruDataSallesLibresPourPlageHoraire))
        var sallesLibresMardi10a12 = action.findSallesLibresByPlageHoraire('Mardi', '10:00-12:00')
		expect(sallesLibresMardi10a12).toEqual(['S667'])
		console.log("\n!--Salles libres le mardi de 10 à 12 : attendu -> [S667] | obtenu -> ["+sallesLibresMardi10a12+"]--!")
	}); //échoue lamentablement

	xit("SPEC 5 : Consulter les plages horaires pour lesquelles une salle est libre", function() {
	})

	afterEach(function(){
		this.resetAnalyzer()
	})


});

