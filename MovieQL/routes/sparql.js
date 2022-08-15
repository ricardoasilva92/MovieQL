var express = require('express');
var router = express.Router();

var SparqlClient = require('sparql-client-2');
var SPARQL =  SparqlClient.SPARQL

var endpoint = 'http://192.168.56.1:7200/repositories/movies_imdb'
var myupdateEndpoint = 'http://192.168.56.1:7200/repositories/movies_imdb/statements'

var url = require('url')

var persons = require('../public/autocompletes/persons.json')
var persons_toPug = Object.keys(persons)

var genres = require('../public/autocompletes/genres.json')
var genres_toPug = Object.keys(genres)

var countries = require('../public/autocompletes/countries.json')
var countries_toPug = Object.keys(countries)

var mpaa = require('../public/autocompletes/mpaa.json')
var mpaa_toPug = Object.keys(mpaa)

var studios = require('../public/autocompletes/studios.json')
var studios_toPug = Object.keys(studios)

var movies = require('../public/autocompletes/movies.json')
var movies_toPug = Object.keys(movies)


var client = new SparqlClient(endpoint, {
  updateEndpoint: myupdateEndpoint,
  defaultParameters: { format: 'json' }
  }).register({
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    clav: 'http://jcr.di.uminho.pt/m51-clav#',
    owl: 'http://www.w3.org/2002/07/owl#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    noInferences: 'http://www.ontotext.com/explicit',
	cin: 'http://miei.di.uminho.pt/prc2018/hollywood#',
	xsd: 'http://www.w3.org/2001/XMLSchema#'
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('front');
});


router.get('/explore', function(req, res, next) {
	
	//se tiver parametros
	if(Object.keys(req.query).length !== 0 ){
		//PARAMETRO MOVIE
		if(req.query.myMovie){
			var movie_name = req.query.myMovie;
			var query = "select ?s where{ \n" +  
				"?s rdf:type cin:Movie . \n" +
				"?s cin:name \"" + movie_name + "\"}  \n" 
			client.query(query)
				.execute()
				//qres - query response
				.then((qres)=>{
					console.log("\n\n" + JSON.stringify(qres));
					var uri = qres.results.bindings[0].s.value
					var titleId = uri.split("#")[1]
					res.redirect("/title/" + titleId)
				})
				.catch((err)=>{
					console.log("ERRO: " + err);
			});
		}
		if(req.query.myPerson){
			var person_name = req.query.myPerson;
			var query = "select ?s where{ \n" +  
				"?s rdf:type cin:Person . \n" +
				"?s cin:name \"" + person_name + "\"}  \n" 
			client.query(query)
				.execute()
				//qres - query response
				.then((qres)=>{
					console.log("\n\n" + JSON.stringify(qres));
					var uri = qres.results.bindings[0].s.value
					var personId = uri.split("#")[1]
					res.redirect("/person/" + personId)
				})
				.catch((err)=>{
					console.log("ERRO: " + err);
			});
		}
		if(req.query.myGenre){
			var genre_name = req.query.myGenre;
			var query = "select ?s where{ \n" +  
				"?s rdf:type cin:Genre . \n" +
				"?s cin:name \"" + genre_name + "\"}  \n" 
			client.query(query)
				.execute()
				//qres - query response
				.then((qres)=>{
					console.log("\n\n" + JSON.stringify(qres));
					var uri = qres.results.bindings[0].s.value
					var genreId = uri.split("#")[1]
					res.redirect("/genre/" + genreId)
				})
				.catch((err)=>{
					console.log("ERRO: " + err);
			});
		}
		if(req.query.myMpaa){
			var mpaa_name = req.query.myMpaa;
			var query = "select ?s where{ \n" +  
				"?s rdf:type cin:MPAA_Rating . \n" +
				"?s cin:name \"" + mpaa_name + "\"}  \n" 
			client.query(query)
				.execute()
				//qres - query response
				.then((qres)=>{
					console.log("\n\n" + JSON.stringify(qres));
					var uri = qres.results.bindings[0].s.value
					var mpaaId = uri.split("#")[1]
					res.redirect("/mpaa/" + mpaaId)
				})
				.catch((err)=>{
					console.log("ERRO: " + err);
			});
		}
		if(req.query.myCountry){
			var country_name = req.query.myCountry;
			var query = "select ?s where{ \n" +  
				"?s rdf:type cin:Country . \n" +
				"?s cin:name \"" + country_name + "\"}  \n" 
			client.query(query)
				.execute()
				//qres - query response
				.then((qres)=>{
					console.log("\n\n" + JSON.stringify(qres));
					var uri = qres.results.bindings[0].s.value
					var countryId = uri.split("#")[1]
					res.redirect("/country/" + countryId)
				})
				.catch((err)=>{
					console.log("ERRO: " + err);
			});
		}
		if(req.query.myStudio){
			var studio_name = req.query.myStudio;
			var query = "select ?s where{ \n" +  
				"?s rdf:type cin:Studio . \n" +
				"?s cin:name \"" + studio_name + "\"}  \n" 
			client.query(query)
				.execute()
				//qres - query response
				.then((qres)=>{
					console.log("\n\n" + JSON.stringify(qres));
					var uri = qres.results.bindings[0].s.value
					var studioId = uri.split("#")[1]
					res.redirect("/studio/" + studioId)
				})
				.catch((err)=>{
					console.log("ERRO: " + err);
			});
		}
		
	}

	//array com o nome de todos os filmes
	else {
		var query = "select ?nome  ?rating ?poster where{ \n" +
					"?s rdf:type cin:Movie .      \n" +
					"?s cin:premiereYear \"2018\"^^xsd:integer .  \n" +
					"?s cin:name ?nome . \n" +
					"?s cin:rating_IMD ?rating .\n " +
					"?s cin:poster ?poster }" +

					" order by DESC(?rating) \n" +
					"limit 10 "

		client.query(query)
		.execute()
		.then((qres)=>{
			var resList = qres.results.bindings
			var top = {}
			for(i=0;i<resList.length;i++){
				top[resList[i].nome.value] = {}
				top[resList[i].nome.value].rating = resList[i].rating.value
				top[resList[i].nome.value].poster = resList[i].poster.value
			
			}
			console.log("\n\n" + JSON.stringify(top));
			res.render("explore",{movies_fromServer: movies_toPug,
									persons_fromServer: persons_toPug,
									countries_fromServer: countries_toPug,
									genres_fromServer: genres_toPug,
									mpaa_fromServer: mpaa_toPug,
									studios_fromServer: studios_toPug,
									top10:top
								})
						
					})
				}
	});
  


//WOKENNBECH -> QUERIES SPARQL
router.get('/workbench', function(req, res, next) {
	var workb = true;
	res.render('workbench',{movies_fromServer: movies_toPug,
		persons_fromServer: persons_toPug,
		countries_fromServer: countries_toPug,
		genres_fromServer: genres_toPug,
		mpaa_fromServer: mpaa_toPug,
		studios_fromServer: studios_toPug,
		workb:workb
	})
  });
//req - request object
//res - response object
//next - middleware function in the application’s request-response cycle


//pagina com title
router.get('/title/:id', function(req, res, next) {
	var id = req.params.id
	var query = "select ?property  ?value ?name \n" +  
				"where { \n" +
				"cin:" + id + "  ?property  ?value .  \n" +
				"OPTIONAL { \n" + 
				"?value cin:name ?name .}}" 
	//executar query
	client.query(query)
		.execute()
		.then((qres)=>{
			var resList = qres.results.bindings
			var infoTitle = putStruturedResult_Movies(resList)
			res.render("title",{dataTitle: infoTitle,
				movies_fromServer: movies_toPug,
				persons_fromServer: persons_toPug,
				countries_fromServer: countries_toPug,
				genres_fromServer: genres_toPug,
				mpaa_fromServer: mpaa_toPug,
				studios_fromServer: studios_toPug})
		})
		.catch((err)=>{
			console.log("ERRO: " + err);
	});
	


});


//pagina com human
router.get('/person/:id', function(req, res, next) {
	var id = req.params.id
	var query = "select ?property  ?value ?name \n" +  
				"where { \n" +
				"cin:" + id + "  ?property  ?value .  \n" +
				"OPTIONAL { \n" + 
				"?value cin:name ?name .}}" 
	//executar query
	client.query(query)
		.execute()
		//qres - query response
		.then((qres)=>{
			//console.log("\n\n" + JSON.stringify(qres));
			//res.json(qres);
			
			//array with the important info
			var resList = qres.results.bindings
			
			//info to send client
			var infoPerson = putStruturedResult_Person(resList)
			console.log(JSON.stringify(infoPerson))

			res.render("person",{dataPerson: infoPerson,
				movies_fromServer: movies_toPug,
				persons_fromServer: persons_toPug,
				countries_fromServer: countries_toPug,
				genres_fromServer: genres_toPug,
				mpaa_fromServer: mpaa_toPug,
				studios_fromServer: studios_toPug})
		})
		.catch((err)=>{
			console.log("ERRO: " + err);
	});
	
});


//pagina com genre
router.get('/genre/:id', function(req, res, next) {
	var id = req.params.id
	var query = "select ?property  ?value ?name \n" +  
				"where { \n" +
				"cin:" + id + "  ?property  ?value .  \n" +
				"OPTIONAL { \n" + 
				"?value cin:name ?name .}}" 
	//executar query
	client.query(query)
		.execute()
		//qres - query response
		.then((qres)=>{
			
			//array with the important info
			var resList = qres.results.bindings
			
			//info to send client
			var infoGenre = putStruturedResult_Genre(resList)
			
			console.log(JSON.stringify(infoGenre))

			res.render("genre",{dataGenre: infoGenre,
				movies_fromServer: movies_toPug,
				persons_fromServer: persons_toPug,
				countries_fromServer: countries_toPug,
				genres_fromServer: genres_toPug,
				mpaa_fromServer: mpaa_toPug,
				studios_fromServer: studios_toPug})
		})
		.catch((err)=>{
			console.log("ERRO: " + err);
	});
	
});

//pagina mpaa
router.get('/mpaa/:id', function(req, res, next) {
	var id = req.params.id
	var query = "select ?property  ?value ?name \n" +  
				"where { \n" +
				"cin:" + id + "  ?property  ?value .  \n" +
				"OPTIONAL { \n" + 
				"?value cin:name ?name .}}" 
	//executar query
	client.query(query)
		.execute()
		//qres - query response
		.then((qres)=>{
			
			//array with the important info
			var resList = qres.results.bindings
			
			//info to send client
			var infoMpaa = putStruturedResult_Mpaa(resList)

			res.render("mpaa",{dataMpaa: infoMpaa,
				movies_fromServer: movies_toPug,
				persons_fromServer: persons_toPug,
				countries_fromServer: countries_toPug,
				genres_fromServer: genres_toPug,
				mpaa_fromServer: mpaa_toPug,
				studios_fromServer: studios_toPug})
		})
		.catch((err)=>{
			console.log("ERRO: " + err);
	});
	
});

//pagina languages
router.get('/language/:id', function(req, res, next) {
	var id = req.params.id
	var query = "select ?property  ?value ?name \n" +  
				"where { \n" +
				"cin:" + id + "  ?property  ?value .  \n" +
				"OPTIONAL { \n" + 
				"?value cin:name ?name .}}" 
	//executar query
	client.query(query)
		.execute()
		//qres - query response
		.then((qres)=>{
			
			//array with the important info
			var resList = qres.results.bindings
			
			//info to send client
			var infoLang = putStruturedResult_Lang(resList)
			
			//console.log(JSON.stringify(infoLang))

			res.render("language",{dataLang: infoLang,
				movies_fromServer: movies_toPug,
				persons_fromServer: persons_toPug,
				countries_fromServer: countries_toPug,
				genres_fromServer: genres_toPug,
				mpaa_fromServer: mpaa_toPug,
				studios_fromServer: studios_toPug})
		})
		.catch((err)=>{
			console.log("ERRO: " + err);
	});
	
});

//pagina studio
router.get('/studio/:id', function(req, res, next) {
	var id = req.params.id
	var query = "select ?property  ?value ?name \n" +  
				"where { \n" +
				"cin:" + id + "  ?property  ?value .  \n" +
				"OPTIONAL { \n" + 
				"?value cin:name ?name .}}" 
	//executar query
	client.query(query)
		.execute()
		//qres - query response
		.then((qres)=>{
			
			//array with the important info
			var resList = qres.results.bindings
			
			//info to send client
			var infoStudio = putStruturedResult_Studio(resList)
			
			//console.log(JSON.stringify(infoLang))

			res.render("studio",{dataStudio: infoStudio,
				movies_fromServer: movies_toPug,
				persons_fromServer: persons_toPug,
				countries_fromServer: countries_toPug,
				genres_fromServer: genres_toPug,
				mpaa_fromServer: mpaa_toPug,
				studios_fromServer: studios_toPug})
		})
		.catch((err)=>{
			console.log("ERRO: " + err);
	});
	
});

router.get('/country/:id', function(req, res, next) {
	var id = req.params.id
	var query = "select ?property  ?value ?name \n" +  
				"where { \n" +
				"cin:" + id + "  ?property  ?value .  \n" +
				"OPTIONAL { \n" + 
				"?value cin:name ?name .}}" 
	//executar query
	client.query(query)
		.execute()
		//qres - query response
		.then((qres)=>{
			
			//array with the important info
			var resList = qres.results.bindings
			
			//info to send client
			var infoCountry = putStruturedResult_Country(resList)
			
			//console.log(JSON.stringify(infoLang))

			res.render("country",{dataCountry: infoCountry,
				movies_fromServer: movies_toPug,
				persons_fromServer: persons_toPug,
				countries_fromServer: countries_toPug,
				genres_fromServer: genres_toPug,
				mpaa_fromServer: mpaa_toPug,
				studios_fromServer: studios_toPug})
		})
		.catch((err)=>{
			console.log("ERRO: " + err);
	});
	
});





router.post('/workbench', function(req, res, next) {
	var query = req.body.intext;
	client.query(query)
		.execute()
		.then((qres)=>{
			console.log("\n\n" + JSON.stringify(qres));
			res.json(qres);
		})
		.catch((err)=>{
			console.log("ERRO: " + err);
			//res.json({})
	});
});

module.exports = router;





//___________FUNÇÔES



function putStruturedResult_Movies(resList){

	var result = {}
	
	//possible multiple values
	result.type = []
	result.studio = []
	result.writers = []
	result.directors = []
	result.actors = []
	result.genres = []
	result.languages = []
	result.countries = []
	result.mpaa_rated = []

	for(i=0;i<resList.length;i++){
		//name of property (ex. fromContry)
		uriProperty = resList[i].property.value
		property = uriProperty.slice(uriProperty.indexOf('#')+1)	
		
		//value of property (ex. cntry87_USA)
		uriValue = resList[i].value.value
		value = uriValue.slice(uriValue.indexOf('#')+1)	
		
		//if exists, retrive the name (ex. "united States of America")
		if(resList[i].name){
			uriName = 	resList[i].name.value
			name = uriName.slice(uriName.indexOf('#')+1)
		}

		if(property == "type")
			result.type.push(value)

		if(property == "fromCountry"){
			aux = {}
			aux.id = value
			aux.val = name
			result.countries.push(aux)
			
		}

		if(property == "fromStudio"){
			aux = {}
			aux.id = value
			aux.val = name
			result.studio.push(aux)
		}
		
		if(property == "hasActor"){
			aux = {}
			aux.id = value
			aux.val = name
			result.actors.push(aux)
		}

		if(property == "hasDirector"){
			aux = {}
			aux.id = value
			aux.val = name
			result.directors.push(aux)
		}

		if(property == "hasWriter"){
			aux = {}
			aux.id = value
			aux.val = name
			result.writers.push(aux)
		}
		
		if(property == "hasLanguage"){
			aux = {}
			aux.id = value
			aux.val = name
			result.languages.push(aux)
		}

		if(property == "hasGenre"){
			aux = {}
			aux.id = value
			aux.val = name
			result.genres.push(aux)
		}

		if(property == "mpaa_rated"){
			aux = {}
			aux.id = value
			aux.val = name
			result.mpaa_rated.push(aux)
		}

		//properties para persons
		

		//dataproperties
		if(property == "name")
			result.name = value
	
		if(property == "poster")
			result.poster = value

		if(property == "numVotes")
			result.numVotes = value

		if(property == "runtime")
			result.runtime = value

		if(property == "plot")
			result.plot = value
		
		if(property == "boxOffice")
			result.boxOffice = value
			
		if(property == "website")
			result.website = value
			
		if(property == "premiereYear")
			result.premiereYear = value
		
		if(property == "rating_RT")
			result.rating_RT = value
		
		if(property == "rating_IMD")
			result.rating_IMD = value
		
		if(property == "rating_META")
			result.rating_META = value
		
	}

	return result
}


function putStruturedResult_Person(resList){
	//relations possible for a Person
	//OBJECT PROPERTIES: isActorIn, isWriterOf, isDirectorOf, knownFor
	//Data PROPERTIES: name, birthYear, deathYear, sex

	var result = {}
	
	//possible multiple values
	result.type = []
	result.isActorIn = []
	result.isWriterOf = []
	result.isDirectorOf = []
	result.knownFor = []

	for(i=0;i<resList.length;i++){
		//name of property (ex. isActorIn)
		uriProperty = resList[i].property.value
		property = uriProperty.slice(uriProperty.indexOf('#')+1)	
		
		//value of property (ex. tt0068646)
		uriValue = resList[i].value.value
		value = uriValue.slice(uriValue.indexOf('#')+1)	
		
		//if exists, retrieve the name (ex. "The Godfather")
		if(resList[i].name){
			uriName = 	resList[i].name.value
			name = uriName.slice(uriName.indexOf('#')+1)
		}

		if(property == "type")
			result.type.push(value)

		if(property == "isActorIn"){
			aux = {}
			aux.id = value
			aux.val = name
			result.isActorIn.push(aux)
			
		}

		if(property == "isWriterOf"){
			aux = {}
			aux.id = value
			aux.val = name
			result.isWriterOf.push(aux)
		}
		
		if(property == "isDirectorOf"){
			aux = {}
			aux.id = value
			aux.val = name
			result.isDirectorOf.push(aux)
		}

		if(property == "knownFor"){
			aux = {}
			aux.id = value
			aux.val = name
			result.knownFor.push(aux)
		}

		

		

		//dataproperties
		if(property == "name")
			result.name = value

	
		if(property == "birthYear")
			result.birthYear = value

		if(property == "deathYear")
			result.deathYear = value

		if(property == "sex")
			result.sex = value
		
		
		
	}

	return result
}


function putStruturedResult_Genre(resList){

	var result = {}
	
	//possible multiple values
	result.type = []
	result.isGenreOf = []

	for(i=0;i<resList.length;i++){
		//name of property (ex. isActorIn)
		uriProperty = resList[i].property.value
		property = uriProperty.slice(uriProperty.indexOf('#')+1)	
		
		//value of property (ex. tt0068646)
		uriValue = resList[i].value.value
		value = uriValue.slice(uriValue.indexOf('#')+1)	
		
		//if exists, retrieve the name (ex. "The Godfather")
		if(resList[i].name){
			uriName = 	resList[i].name.value
			name = uriName.slice(uriName.indexOf('#')+1)
		}

		if(property == "type")
			result.type.push(value)

		if(property == "isGenreOf"){
			aux = {}
			aux.id = value
			aux.val = name
			result.isGenreOf.push(aux)
			
		}
		
		//dataproperties
		if(property == "name")
			result.name = value
				
	}

	return result
}

function putStruturedResult_Mpaa(resList){

	var result = {}
	
	//possible multiple values
	result.type = []
	result.mpaa_rateOf = []

	for(i=0;i<resList.length;i++){
		//name of property (ex. isActorIn)
		uriProperty = resList[i].property.value
		property = uriProperty.slice(uriProperty.indexOf('#')+1)	
		
		//value of property (ex. tt0068646)
		uriValue = resList[i].value.value
		value = uriValue.slice(uriValue.indexOf('#')+1)	
		
		//if exists, retrieve the name (ex. "The Godfather")
		if(resList[i].name){
			uriName = resList[i].name.value
			name = uriName.slice(uriName.indexOf('#')+1)
		}

		if(property == "type")
			result.type.push(value)

		if(property == "mpaa_rateOf"){
			aux = {}
			aux.id = value
			aux.val = name
			result.mpaa_rateOf.push(aux)
			
		}
		
		//dataproperties
		if(property == "name")
			result.name = value
				
	}

	return result
}

function putStruturedResult_Lang(resList){

	var result = {}
	
	//possible multiple values
	result.type = []
	result.isLanguageOf = []

	for(i=0;i<resList.length;i++){
		//name of property (ex. isActorIn)
		uriProperty = resList[i].property.value
		property = uriProperty.slice(uriProperty.indexOf('#')+1)	
		
		//value of property (ex. tt0068646)
		uriValue = resList[i].value.value
		value = uriValue.slice(uriValue.indexOf('#')+1)	
		
		//if exists, retrieve the name (ex. "The Godfather")
		if(resList[i].name){
			uriName = resList[i].name.value
			name = uriName.slice(uriName.indexOf('#')+1)
		}

		if(property == "type")
			result.type.push(value)

		if(property == "isLanguageOf"){
			aux = {}
			aux.id = value
			aux.val = name
			result.isLanguageOf.push(aux)
			
		}
		
		//dataproperties
		if(property == "name")
			result.name = value
				
	}

	return result
}

function putStruturedResult_Studio(resList){
	var result = {}
	
	//possible multiple values
	result.type = []
	result.studioOf = []

	for(i=0;i<resList.length;i++){
		//name of property (ex. isActorIn)
		uriProperty = resList[i].property.value
		property = uriProperty.slice(uriProperty.indexOf('#')+1)	
		
		//value of property (ex. tt0068646)
		uriValue = resList[i].value.value
		value = uriValue.slice(uriValue.indexOf('#')+1)	
		
		//if exists, retrieve the name (ex. "The Godfather")
		if(resList[i].name){
			uriName = resList[i].name.value
			name = uriName.slice(uriName.indexOf('#')+1)
		}

		if(property == "type")
			result.type.push(value)

		if(property == "studioOf"){
			aux = {}
			aux.id = value
			aux.val = name
			result.studioOf.push(aux)
			
		}
		
		//dataproperties
		if(property == "name")
			result.name = value
				
	}

	return result
}


function putStruturedResult_Country(resList){
	var result = {}
	
	//possible multiple values
	result.type = []
	result.isCountryOf = []

	for(i=0;i<resList.length;i++){
		//name of property (ex. isActorIn)
		uriProperty = resList[i].property.value
		property = uriProperty.slice(uriProperty.indexOf('#')+1)	
		
		//value of property (ex. tt0068646)
		uriValue = resList[i].value.value
		value = uriValue.slice(uriValue.indexOf('#')+1)	
		
		//if exists, retrieve the name (ex. "The Godfather")
		if(resList[i].name){
			uriName = resList[i].name.value
			name = uriName.slice(uriName.indexOf('#')+1)
		}

		if(property == "type")
			result.type.push(value)

		if(property == "isCountryOf"){
			aux = {}
			aux.id = value
			aux.val = name
			result.isCountryOf.push(aux)
			
		}
		
		//dataproperties
		if(property == "name")
			result.name = value
				
	}

	return result
}