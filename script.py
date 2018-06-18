#!/usr/bin/python3

import fileinput, csv, pprint, json, time, urllib.request

start_time = time.time()
pp = pprint.PrettyPrinter(indent=4)
import unidecode as ud

"""
#_______________leitura dos ficheiros tsv datasets oficiais de imdb.com_______________________
print("ler ficheiros....... %s"  % (time.time() - start_time))
#1[titleRatings] ficheiro ratings
titleRatings = open('dados/title_ratings.tsv')
readerRatings = csv.DictReader(titleRatings,delimiter='\t')

#2[titleBasic] ficheiro de informação básica
titleBasic = open('dados/title_basics.tsv',encoding="utf8")
readerBasic = csv.DictReader(titleBasic,delimiter='\t')

#3[titlePrincipals] ficheiro com informação relativa à equipa princial de um dado filme, atores, realizadores e escritores
titlePrincipal = open('dados/title_principals.tsv',encoding="utf8")
readerPrincipal = csv.DictReader(titlePrincipal,delimiter='\t')

#4[titleCrew] ficheiro com realizadores e escritores
titleCrew = open('dados/title_crew.tsv',encoding="utf8")
readerCrew = csv.DictReader(titleCrew,delimiter='\t')


#6[names] ficheiro com informação de cada pessoa, atores, realizadores, escritores, etc
humans = open('dados/name_basics.tsv',encoding="utf8")
readerHumans = csv.DictReader(humans,delimiter='\t')

print("ficheiros lidos %s"  % (time.time() - start_time))
#0 lista auxiliar com o id de todas as pessoas, actores,realizadores, escritores
humanListAux = set()


#__________________________criação dos dicionarios____________________________________
#1[titleRatings] titulos com mais de 10.000 votos (mas tem titulos que nao sao filmes)
ratings_dict = {} 
for row in readerRatings:
	if int(row['numVotes']) > 10000:
		ratings_dict[row['tconst']] = {'averageRating' : row['averageRating'],'numVotes' : row['numVotes']}
print("ratings_dict criado | %s"  % (time.time() - start_time))

#2[titleBasic] titulos que são 'movies'   key-> idFilme, Values-> 'primaryTitle','startYear','genres':[string]
basic_dict = {}
for row in readerBasic:
	if row['titleType'] == 'movie':
		basic_dict[row['tconst']] = {'primaryTitle' : row['primaryTitle'], 'startYear' : row['startYear'], 'genres' : row['genres'].split(","), 'runtimeMinutes' : row['runtimeMinutes']}
		#print(basic_dict[row['tconst']])
print("basic_dict criado | %s"  % (time.time() - start_time))

#3[titlePrincipals] apenas os atores. key -> idFilme, Value -> 'actors':ARRAY com os actor e actress, cada elemento é um ator
actor_dict = {}    
for row in readerPrincipal:
	if row['category'] == 'actor' or row['category'] == 'actress':   
		if row['tconst'] in actor_dict:  						#se este filme já existir
			actor_dict[row['tconst']]['actors'].append(row['nconst'])
		else:													
			actor_dict[row['tconst']] = {'actors' : [row['nconst']]}
print("actor_dict criado | %s"  % (time.time() - start_time))


#4[titleCrew] dicionario com REALIZADORES e ESCRITORES. key -> idFilme , value  -> directors:[string] , 'writers':[string]
crew_dict = {}  
for row in readerCrew:
	crew_dict[row['tconst']]={'directors' : row['directors'].split(","), 'writers' : row['writers'].split(",")}
print("crew_dict criado | %s"  % (time.time() - start_time))


#UNIAO de basic_dict ao ratings_dict.  
# obter dicionario onde os titulos 'movies' com mais de 10000 votos tenham os campos 'genres','primaryTitle' e 'startYear'
for key,val in basic_dict.items(): #percorre-se o basic_dict
	if key in ratings_dict:		#se o titulo de basic_dict (>10.000 votos) estiver no ratings_dict
		ratings_dict[key]['genres'] = basic_dict[key]['genres']
		ratings_dict[key]['primaryTitle'] = basic_dict[key]['primaryTitle']
		ratings_dict[key]['startYear'] = basic_dict[key]['startYear']
		ratings_dict[key]['runtimeMinutes'] = basic_dict[key]['runtimeMinutes']
print("uniao de basic_dict com ratings_dict criado | %s"  % (time.time() - start_time))				


#limpar do dicionario os titulos que tem acima de 10.000 votos, mas não são movies. Sabemos que os 'movies' tem 6 campos
for key in ratings_dict.copy():
	if len(ratings_dict[key])<6:
		del ratings_dict[key]
	else:
		#acrecentar os atores
		if key in actor_dict:
			ratings_dict[key]['primaryActors']=actor_dict[key]['actors']
			#inserir estes atores na lista de pessoas uteis
			for ator in ratings_dict[key]['primaryActors']:
				humanListAux.add(ator)
		#adicionar os realizadores e escritores
		if key in crew_dict:
			ratings_dict[key]['directors']=crew_dict[key]['directors']
			#inserir estes realizadores na lista de pessoas uteis
			for drctr in ratings_dict[key]['directors']:
				humanListAux.add(drctr)
			ratings_dict[key]['writers']=crew_dict[key]['writers']
			#inserir estes escritores na lista de pessoas uteis
			for wrtr in ratings_dict[key]['writers']:
				humanListAux.add(wrtr)
print("limpado ratings_dict, adicionado os atores, realizadores e escritores | %s"  % (time.time() - start_time) )


#6[humans] dicionaro com key -> idPessoa, value -> 'primaryName':string, 'birthYear':string, 'deathYear':string, 'primaryProfession':[string], 'knownForTitles':[string]
humans_dict = {}
for row in readerHumans:
	#adicionar só pessoas que sejam uteis
	if row['nconst'] in humanListAux:
		humans_dict[row['nconst']]={'primaryName' : row['primaryName'], 'birthYear' : row['birthYear'], 'deathYear' : row['deathYear'],'primaryProfession' : row['primaryProfession'].split(","),'knownForTitles' : row['knownForTitles'].split(",")}
print("humans_dict criado | %s"  % (time.time() - start_time))

#remover dos campos 'knownForTitle' os titulos que não estao em ratings_dict
for key in humans_dict:
	for tit in humans_dict[key]['knownForTitles']:
		if tit not in ratings_dict:
			humans_dict[key]['knownForTitles'].remove(tit)
print("removido do campo 'knownForTitle' os titulos que nao estao no ratings_dict | %s"  % (time.time() - start_time))



#________escrita e criação de ficheiro movies.json que contem todos os movies com os campos acima, apenas os do imdb________
json = json.dumps(ratings_dict)
f = open("movies.json","w")
f.write(json)
f.close()

print("ficheiro movie.json criado | %s"  % (time.time() - start_time))


_______ecrita e criação de ficheiro humans.json que contem a informação de todos as pessoas listadas em movies.json_____________
json = json.dumps(humans_dict)
f = open("humans.json","w")
f.write(json)
f.close()
"""



"""_______________________Download de todos os 'movies' de omdbapi.com e po-los em api_movies.json_____________________"""
"""
api_dict = {}

movies = json.load(open('dados/movies.json'))
api_movies = json.load(open('dados/api_movies.json'))

api_aux = set() #contem os ids dos filmes já sacadas
for key in api_movies:
	api_aux.add(key)

api_key1 = '&apikey=5aec35de'
api_key2 = '&apikey=ef28afd8'
api_key3 = '&apikey=2fb13c99'
api_key4 = '&apikey=a1d3e574'

api_key_aux = api_key4

i=0
j=0
for key in movies:
	if key not in api_aux:    
		url = 'http://www.omdbapi.com/?i=' + key + api_key_aux
		response = urllib.request.urlopen(url)
		data = response.read()
		text = data.decode('utf-8')
		d = json.loads(text)
		api_dict[d['imdbID']] = d
		
		print("movie " + str(j))
		i+=1
		
		if api_key_aux == api_key1:
			api_key_aux = api_key2
		else:
			if api_key_aux == api_key2:
				api_key_aux = api_key1
			else:
				if api_key_aux == api_key3:
					api_key_aux = api_key1
		j+=1
		if j>2:
			break


if bool(api_dict):
	api_movies.update(api_dict)
	with open('dados/api_movies.json', 'w') as f:
		json.dump(api_movies, f)
else:
	print("acabou")

"""



"""______________________ADICIONAR CAMPOS QUE FALTAM AO MOVIES.JSON (ir busca-los ao api_movies.json) _______________________________"""

"""
api_movies = json.load(open('dados/api_movies.json'))
movies = json.load(open('dados/movies.json'))
humans = json.load(open('dados/humans.json'))

def boxOfficeToFloat(a):
	if a!='N/A':
		a=a.replace('$','')
		a = a.replace(',','')
		a = float(a)
	return a

for title in movies:
	movies[title]['rated']=api_movies[title]['Rated']
	movies[title]['plot']=api_movies[title]['Plot']
	movies[title]['poster']=api_movies[title]['Poster']
	movies[title]['website']=api_movies[title]['Website']
	movies[title]['studio']=api_movies[title]['Production']
	movies[title]['boxoffice']=boxOfficeToFloat(api_movies[title]['BoxOffice'])
	movies[title]['country']=api_movies[title]['Country'].split(',')
	movies[title]['language']=api_movies[title]['Language'].split(',')
	movies[title]['genre']=api_movies[title]['Genre'].split(',')
	movies[title]['ratings']=api_movies[title]['Ratings']
	
json = json.dumps(movies)
f = open("movies.json","w")
f.write(json)
f.close()
"""
""" 
#trocar iDS pelo nome das pessoas (para o dataset EXTRA)
for title in movies:
	x = movies[title].get("primaryActors",None)
	if x!=None:
		i=0
		for ator in movies[title]["primaryActors"]:
			movies[title]["primaryActors"][i]=humans[ator]["primaryName"]
			i+=1
	x = movies[title].get("directors",None)
	if x!=None:
		j=0
		for ator in movies[title]["directors"]:
			if ator!='\\N':
				movies[title]["directors"][j]=humans[ator]["primaryName"]
			j+=1
	x = movies[title].get("writers",None)
	if x!=None:
		k=0
		for ator in movies[title]["writers"]:
			if ator!='\\N':
				movies[title]["writers"][k]=humans[ator]["primaryName"]
				k+=1


json = json.dumps(movies)
f = open("movies.json","w")
f.write(json)
f.close()"""

#____tirar os espaços em branco no incio e no fim dos campos language, country (também fiz para o extra)____________
"""
movies = json.load(open('dados/movies.json'))
for title in movies:
	x = movies[title].get("language",None)
	if x!=None:
		i=0
		for genre in movies[title]["language"]:
			movies[title]["language"][i]=movies[title]["language"][i].strip()
			i+=1
	x = movies[title].get("country",None)
	if x!=None:
		i=0
		for genre in movies[title]["country"]:
			movies[title]["country"][i]=movies[title]["country"][i].strip()
			i+=1

json = json.dumps(movies)
f = open("movies.json","w")
f.write(json)
f.close()
"""

#_______________________NOVO movies.json com ids em vez de strings para os campos Genre, Country, Corporation, Language, mpaaRATE_______________________
"""
movies = json.load(open('dados/movies_ids.json'))

genres = json.load(open('dados/genres.json'))
corporations = json.load(open('dados/corporations.json'))
countries = json.load(open('dados/country.json'))
languages = json.load(open('dados/languages.json'))
mpaa_rate = json.load(open('dados/mpaa_rate.json'))

def getKey(dic,str):
	for key in dic:
		if dic[key]==str:
			return key



for title in movies:

	#genres
	x = movies[title].get("genres",None)
	if x!=None:
		i=0
		for genre in movies[title]["genres"]:
			movies[title]["genres"][i]=getKey(genres,genre)
			i+=1
	#corporation
	x = movies[title].get("corporation",None)
	if x!=None:
		movies[title]["corporation"]=getKey(corporations,x)
	#countries
	x = movies[title].get("country",None)
	if x!=None:
		i=0
		for country in movies[title]["country"]:
			movies[title]["country"][i]=getKey(countries,country)
			i+=1
	#mpaa_rate
	x = movies[title].get("mpaa_rate",None)
	if x!=None:
		movies[title]["mpaa_rate"]=getKey(mpaa_rate,x)
		for title in movies:
	#languages
	x = movies[title].get("language",None)
	if x!=None:
		i=0
		for lang in movies[title]["language"]:
			movies[title]["language"][i]=getKey(languages,lang)
			i+=1
	
	
json = json.dumps(movies)
f = open("movies.json","w")
f.write(json)
f.close()
"""

#_____converter valor dos diferentes ratings para decimal_______________ (feito)


	# "ratings": [
	# 			{
	# 				"Source": "Internet Movie Database",
	# 				"Value": "7.5/10"
	# 			},
	# 			{
	# 				"Source": "Rotten Tomatoes",
	# 				"Value": "59%"
	# 			},
	# 			{
	# 				"Source": "Metacritic",
	# 				"Value": "48/100"
	# 			}
	# 		]
"""
def conv_IMD(str):
	lista = str.split('/')
	a = lista[0]
	return (float(a)/1.0)

def conv_RT(str):
	lista = str.split('%')
	a = lista[0]
	return (int(a)/10.0)

def conv_MC(str):
	lista = str.split('/')
	a = lista[0]
	return (int(a)/10.0)

for title in movies:
	i=0
	for rating in movies[title]["ratings"]:
		if rating["Source"] == "Internet Movie Database":
			valor = rating["Value"]
			movies[title]["ratings"][i]["Value"] = conv_IMD(valor)
			i+=1
		if rating["Source"] == "Rotten Tomatoes":
			valor = rating["Value"]
			movies[title]["ratings"][i]["Value"] = conv_RT(valor)
			i+=1
		if rating["Source"] == "Metacritic":
			valor = rating["Value"]
			movies[title]["ratings"][i]["Value"] = conv_MC(valor)
			i+=1

json = json.dumps(movies)
f = open("movies_ids.json","w")
f.write(json)
f.close()
"""


#____________________________


dictP = {}
movies = json.load(open('dados/movies_ids.json'))
for key in movies:
	dictP[(movies[key]["primaryTitle"])] = ""

json = json.dumps(dictP)
f = open("movies.json","w",)
f.write(json)
f.close()


	

