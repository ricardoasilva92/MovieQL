$(function(){
  $("#intext").val("");

  $("#proc").click(()=>{
    var textSource = {
      "intext": $("#intext").val()
    }
    
    
    $.ajax({
      type: "POST",
      data: textSource,
      url: '/workbench',
      dataType: "JSON",
    }).done((response)=>{
        var colunas = response.head.vars;
        var html = `\n<table class="table table-striped">\n<tr>`;
        for(var col in colunas){
          html +="<th>" + colunas[col] + "</th>";
        }
        html+="</tr>\n";

        for(var key in response.results.bindings){
          var linha = response.results.bindings[key];
          html+="<tr>";
          for(var col in colunas){
            html +="<td>" + linha[colunas[col]].value + "</td>";
          }
          html+="</tr>\n";
        }
        html+="</table>\n";
        $("#resultado").children().remove();
        $("#resultado").append(html);
    });

  })
  $("#limpa").click(()=>{
    $("#resultado").children().remove();
  })
  $("#nova0").click(()=>{
    $("#intext").val(`select (?s as ?classes) where {
      ?s a owl:Class .
        }`);
  })
  $("#nova1").click(()=>{
    $("#intext").val(`select ?nome ?money where {
      ?s a cin:Movie .
      ?s cin:boxOffice ?money .
      ?s cin:name ?nome
  }
  order by desc(?money)
  limit 10`);
  })
  $("#nova2").click(()=>{
    $("#intext").val(`select ?nome (count (?m) as ?movie) where{
      ?s rdf:type cin:Director .
      ?s cin:name ?nome .
      ?s cin:isDirectorOf	?m
  }
  GROUP BY ?nome
  ORDER BY DESC(?movie)
  limit 15`);
  })
  $("#nova3").click(()=>{
    $("#intext").val(`select ?nome  (SUM (?money) as ?m) where{
      ?s rdf:type cin:Actor .
      ?s cin:name ?nome .
      ?s cin:isActorIn	?movie . 
      ?movie cin:boxOffice ?money
  }
  GROUP BY ?nome
  ORDER BY DESC(?m)
  limit 15`);
  })
})
