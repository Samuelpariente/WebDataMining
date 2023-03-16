// Add markers for each theater to the map
function convertTheatersFormat(theaters) {
    const results = theaters.results.bindings;

    const movies = results.map((result) => ({
      title: result.title.value,
      startingDate: new Date(result.startingDate.value),
      endingDate: new Date(result.ending_date.value),
    }));

    const uniqueTheaters = {};

    results.forEach((result) => {
      const theaterName = result.theater_name.value;

      if (!uniqueTheaters[theaterName]) {
        uniqueTheaters[theaterName] = {
          location: {
            address: result.loc.value,
            lat: parseFloat(result.lat.value),
            lon: parseFloat(result.lon.value),
          },
          movies: [],
        };
      }

      uniqueTheaters[theaterName].movies.push({
        title: result.title.value,
        startingDate: new Date(result.startingDate.value),
        endingDate: new Date(result.ending_date.value),
      });
    });

return Object.entries(uniqueTheaters).map(([name, data]) => ({
  name,
  ...data,
}));
}

function convertMoviesFormat(Movies) {
    const results = Movies.results.bindings;

    return results;
}

function getMovieInfo(data) {
  const movies = [];
  const movieTitles = new Set();
  
  data.forEach((movie) => {
    const title = movie.title.value;
    
    if (!movieTitles.has(title)) {
      const movieInfo = {
        title: title,
        actor: [],
        director: [],
        writer: [],
        genre: [],
      };
      
      if (movie.actor_name && movie.actor_name.value) {
        movieInfo.actor.push(movie.actor_name.value);
      }
      if (movie.director_name && movie.director_name.value) {
        movieInfo.director.push(movie.director_name.value);
      }
      if (movie.writer_name && movie.writer_name.value) {
        movieInfo.writer.push(movie.writer_name.value);
      }
      if (movie.genre && movie.genre.value) {
        movieInfo.genre.push(movie.genre.value.split('#')[1]);
      }
      
      movieInfo.actor = [...new Set(movieInfo.actor)];
      movieInfo.director = [...new Set(movieInfo.director)];
      movieInfo.writer = [...new Set(movieInfo.writer)];
      movieInfo.genre = [...new Set(movieInfo.genre)];
      
      movies.push(movieInfo);
      movieTitles.add(title);
    } else {
      // If the movie title already exists, update its information
      const movieIndex = movies.findIndex((m) => m.title === title);
      
      if (movie.actor_name && movie.actor_name.value) {
        movies[movieIndex].actor.push(movie.actor_name.value);
        movies[movieIndex].actor = [...new Set(movies[movieIndex].actor)];
      }
      if (movie.director_name && movie.director_name.value) {
        movies[movieIndex].director.push(movie.director_name.value);
        movies[movieIndex].director = [...new Set(movies[movieIndex].director)];
      }
      if (movie.writer_name && movie.writer_name.value) {
        movies[movieIndex].writer.push(movie.writer_name.value);
        movies[movieIndex].writer = [...new Set(movies[movieIndex].writer)];
      }
      if (movie.genre && movie.genre.value) {
        movies[movieIndex].genre.push(movie.genre.value.split('#')[1]);
        movies[movieIndex].genre = [...new Set(movies[movieIndex].genre)];
      }
    }
  });
  
  return movies;
}







const fetchData = async (url,query) => {
  
	  const options = {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		  },
		  body: 'query=' + encodeURIComponent(query),
		};
  
    const response = await fetch(url, options);
    const body = await response.json();
    return body;
  
};



// Define a function to display the theaters and their movie information on the map
async function displayTheaters() {
	
 let query = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX ex: <http://www.semanticweb.org/alexa/ontologies/2023/2/untitled-ontology-23#> SELECT ?title ?genre ?actor_name ?director_name ?writer_name ?startingDate ?ending_date ?theater_name ?loc ?lon ?lat WHERE { ?planning ex:starting_date ?startingDate. ?planning ex:ending_date ?ending_date. ?planning ex:hasPlannedMovie ?movies. ?planning ex:hasPlannedMovieTheater ?theatre. ?movies ex:title ?title. ?theatre ex:name_theater ?theater_name. ?theatre ex:location ?loc. ?theatre ex:longitude ?lon. ?theatre ex:latitude ?lat. }";
 const url = 'http://ec2-18-204-18-37.compute-1.amazonaws.com:3030/Movie/sparql';
	
	
 let data = await fetchData(url,query); 
 const thea = convertTheatersFormat(data);
 
 query = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX ex: <http://www.semanticweb.org/alexa/ontologies/2023/2/untitled-ontology-23#> SELECT ?title ?genre ?actor_name ?director_name ?writer_name WHERE { ?movies rdf:type ex:Movie. ?movies ex:title ?title. OPTIONAL {  ?movies ex:hasActor ?actor. ?actor ex:name_person ?actor_name.} OPTIONAL {  ?movies ex:hasDirector ?director. ?director ex:name_person ?director_name.} OPTIONAL {  ?movies ex:hasWriter ?writer. ?writer ex:name_person ?writer_name.} OPTIONAL {  ?movies ex:hasGenre ?genre.} }";
 data = await fetchData(url,query); 
 const temp = convertMoviesFormat(data);
 const movies = getMovieInfo(temp);
 
 const map = L.map('mapid').setView([48.852966, 2.349902], 12);
// Add a tile layer to the map
const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tileLayerOptions = {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
};
L.tileLayer(tileLayerUrl, tileLayerOptions).addTo(map);

// Loop through the theaters and add markers to the map
thea.forEach(theater => {
  // Create a popup with the theater name and movie information
  const popupContent = `
    <h2>${theater.name}</h2>
      <ul>
        ${theater.movies.map(movie => `
          <li>
            <a href="#" class="movie-link" data-title="${movie.title}">
              ${movie.title}: ${movie.startingDate.toDateString()} - ${movie.endingDate.toDateString()}
            </a>
          </li>
        `).join('')}
      </ul>
  `;
  // Create a marker for the theater location and bind the popup
  const marker = L.marker([theater.location.lat, theater.location.lon]).bindPopup(popupContent);
  // Add the marker to the map
  marker.addTo(map);

  // Add event listener to the movie links in the popup
  marker.on('popupopen', () => {
  const movieLinks = marker._popup._contentNode.querySelectorAll('.movie-link');
  movieLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const title = e.target.dataset.title;
      const movie = movies.find(movie => movie.title === title);
	  localStorage.setItem('title', movie.title);
	  const title2 = movie.title.replace(/_/g, " ");
	  console.log(title2);
      // Open a new window and populate it with the movie information
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
		  <link rel="stylesheet" href="style.css">
          <head>
            <title>${title2}</title>
          </head>
          <body>
            <h1>${title2}</h1>
			<script type="text/javascript" charset="UTF-8" src="script2.js"></script>
            <p><strong>Genre:</strong> ${movie.genre ? movie.genre : 'N/A'}</p>
            <p><strong>Actor Name:</strong> ${movie.actor ? movie.actor : 'N/A'}</p>
            <p><strong>Director Name:</strong> ${movie.director ? movie.director : 'N/A'}</p>
            <p><strong>Writer Name:</strong> ${movie.writer ? movie.writer : 'N/A'}</p>
          </body>
        </html>
      `);
    });
  });
});

});
}






// Call the displayTheaters function when the DOM is ready
document.addEventListener('DOMContentLoaded', displayTheaters);
