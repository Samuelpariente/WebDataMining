// Define a function that searches for an image of a movie using the OMDb API
let title = localStorage.getItem("title")
title = title.replace("/_/g", " ");

function searchMovieImage(title) {
  const xhr = new XMLHttpRequest();
  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=8f5c637c`;
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.onload = () => {
    if (xhr.status === 200) {
      const response = xhr.response;
      if (response && response.Poster) {
        // Create an img element and set its src attribute to the movie poster URL
        const img = document.createElement('img');
        img.src = response.Poster;
        // Add CSS to center the image
        img.style.display = 'block';
        img.style.margin = '0 auto';
        // Add the img element after the h1 element
        const h1 = document.querySelector('h1');
        h1.insertAdjacentElement('afterend', img);
      } else {
        alert(`No image found for ${title}`);
      }
    } else {
      alert(`Error searching for image: ${xhr.status} ${xhr.statusText}`);
    }
  };
  xhr.send();
}




searchMovieImage(title);