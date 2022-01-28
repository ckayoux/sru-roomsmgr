

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
describe("Vérification des spécifications au niveau syntaxique avec jeux de données corrects :", function(){
	
	

	beforeAll(function() {
		this.analyzer = new parser(logger,false,false)
		this.getParsedCreneaux = (data) => {
			this.analyzer.parse(data)
			return this.analyzer.parsedCreneaux
		}
		this.resetAnalyzer = () => {
			this.analyzer.parsedCreneaux=[]
		}

		this.cruDataCreneauxDoubles = `+MATH02
		1,D1,P=25,H=MA 13:00-14:00,F1,S=B210/L 16:00-18:00,F1,S=B210//
		1,D2,P=25,H=V 13:00-14:00,F1,S=B210/J 14:00-16:00,F1,S=B210//
		1,D3,P=25,H=MA 14:00-16:00,F1,S=B210/ME 18:00-19:00,F1,S=B210//
		1,T1,P=28,H=ME 10:00-12:00,F2,S=A208//
		`
		this.cruDataCreneauxDoublesSimplifies= `+MATH02
		1,D1,P=25,H=MA 13:00-14:00,F1,S=B210//
		1,D1,P=25,H=L 16:00-18:00,F1,S=B210//
		1,D2,P=25,H=V 13:00-14:00,F1,S=B210//
		1,D2,P=25,H=J 14:00-16:00,F1,S=B210//
		1,D3,P=25,H=MA 14:00-16:00,F1,S=B210//
		1,D3,P=25,H=ME 18:00-19:00,F1,S=B210//
		1,T1,P=28,H=ME 10:00-12:00,F2,S=A208//
		`

	});
	
    it("€ SPEC1 : Parser un fichier cru contenant des créneaux doubles", function(){
		var action = new actions(logger,this.getParsedCreneaux(this.cruDataCreneauxDoublesSimplifies))
		decompositionEnCreneauxSimples = action.parsedCreneaux
		this.resetAnalyzer()
		var action = new actions(logger,this.getParsedCreneaux(this.cruDataCreneauxDoublesSimplifies))
		creneauxDoubles = action.parsedCreneaux
		expect(decompositionEnCreneauxSimples).toEqual(creneauxDoubles)
		this.resetAnalyzer()
	});
});
