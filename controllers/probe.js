var probe = require('probe-image-size');

probe('https://s3.amazonaws.com/filestore.rescuegroups.org/3197/pictures/animals/15906/15906885/73952582_500x916.jpg').then(result => {
  console.log(result); // =>
  /*
    {
      width: xx,
      height: yy,
      type: 'jpg',
      mime: 'image/jpeg',
      wUnits: 'px',
      hUnits: 'px',
      url: 'http://example.com/image.jpg'
    }
  */
});