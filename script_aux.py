#!/usr/bin/python3

import fileinput, csv, pprint, json, time, urllib.request

start_time = time.time()
pp = pprint.PrettyPrinter(indent=4)


"""______________________ADICIONAR CAMPOS QUE FALTAM AO MOVIES.JSON (ir busca-los ao api_movies.json) _______________________________"""


movies = json.load(open('dados/movies_ids.json',encoding="utf8"))
api_movies = json.load(open('dados/api_movies.json',encoding="utf8"))
humans = json.load(open('dados/humans_antigo.json',encoding="utf8"))
#######################################################
#________________________GENRE_________________________
#######################################################
"""
genre_aux = set()

for title in movies:
	for genre in movies[title]['genres']:
		if genre not in genre_aux:
			genre_aux.add(genre)

dict_genre = {}
i=1
for genre in genre_aux:
	x = "gnr" + str(i) + "_" + genre
	dict_genre[x] = genre
	i+=1
	

json = json.dumps(dict_genre)
f = open("genres.json","w",encoding="utf8")
f.write(json)
f.close()
"""


#######################################################
#________________________LANGUAGE______________________
#######################################################
"""
language_distinct = set()

for key in movies:
	for l in movies[key]["language"]: 
		if l.strip() not in language_distinct:
			language_distinct.add(l.strip())

dict_language = {}
j=1
for lang in language_distinct:
	x = "lang" + str(j) + "_" + lang.strip().replace(' ','_')
	dict_language[x] = lang
	j+=1
	


json = json.dumps(dict_language)
f = open("languages.json","w",encoding="utf8")
f.write(json)
f.close()
"""

#######################################################
#________________________MPAA_RATED______________________
#######################################################
"""
#saber quantos rated distintos há
rated_distinct = set()

for key in movies:
	if movies[key]["rated"] not in rated_distinct:
		rated_distinct.add(movies[key]["rated"])

dict_mpaa = {}
i=1
for rated in rated_distinct:
	x = "mpaa" + str(i) + "_" + rated
	dict_mpaa[x] = rated
	i+=1
	

json = json.dumps(dict_mpaa)
f = open("mpaa_rate.json","w",encoding="utf8")
f.write(json)
f.close()
"""

#######################################################
#________________________COUNTRY______________________
#######################################################
"""
country_distinct = set()

for key in movies:
	for l in movies[key]["country"]: 
		if l.strip() not in country_distinct:
			country_distinct.add(l.strip())

dict_country = {}
i=1
for country in country_distinct:
	x = "cntry" + str(i) + "_" + country.strip().replace(' ','_')
	dict_country[x] = country
	i+=1

json = json.dumps(dict_country)
f = open("country.json","w",encoding="utf8")
f.write(json)
f.close()
"""

#######################################################
#________________________CORPORATION______________________
#######################################################
"""
corporation_distinct = set()

for key in movies:
	for corp in movies[key]["corporation"].split('/'):
		if corp not in corporation_distinct:
			corporation_distinct.add(corp)

dict_corp = {}
j=1
for corpo in corporation_distinct:
	x = 'corp_'+str(j)
	dict_corp[x] = corpo
	j+=1

json = json.dumps(dict_corp)
f = open("corporations.json","w",encoding="utf8")
f.write(json)
f.close()
"""
#pp.pprint(dict_corp)






"""[6] BoxOffice  """

"""
def boxOfficeToFloat(a):
	if a!='N/A':
		a=a.replace('$','')
		a = a.replace(',','')
		a = float(a)
	return a


for key in api_movies:
	a=api_movies[key]['BoxOffice']
	print(boxOfficeToFloat(a))

"""



"""[8] website fácil é só string"""

"""[9]" RATING"""
""""
rating_distinct = set()

for key in api_movies:
	for l in api_movies[key]["Ratings"]:
		if l["Source"] not in rating_distinct:
			rating_distinct.add(l["Source"])

print(rating_distinct)
"""


for h in humans:
	newKnown = []
	for tit in humans[h]["knownForTitles"]:
		if tit in movies:
			newKnown.append(tit)
	humans[h]["knownForTitles"] = newKnown
	

json = json.dumps(humans)
f = open("humans2.json","w",encoding="utf8")
f.write(json)
f.close()