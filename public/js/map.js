//  accessing env. var like process.env.MAP_TOKEN from script of show.ejs
mapboxgl.accessToken=mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style:"mapbox://styles/mapbox/streets-v12",//can change style like streets-v12,outdoors-v12,dark-v11,light-v11,satellite-streets-v12
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

console.log(listing.geometry.coordinates);
// //marker creation-can add multiple --only change coordinates
const marker = new mapboxgl.Marker({ color: 'red'}) //can change prop of marker like color ,rotation
        .setLngLat(listing.geometry.coordinates) //listing geometry coordinates which we saved  in create listing
        .setPopup( new mapboxgl.Popup({offset: 25})
    .setHTML(`<h1>${listing.title}</h1><p>Exact location will be provided after booking!</p>`)
    .setMaxWidth("300px")
    )
    .addTo(map);
//coordinates cannot directly access here --can use ejs like mapToken shifted here 

