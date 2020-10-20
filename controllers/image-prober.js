const bodyParser = require('body-parser');
var probe = require('probe-image-size');

module.exports = function(app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.post('/api/sizeImages', function(req, res) {
        let imageArr = res.body.imageArray;
        let results = [];
        for (image of imageArr) {
            probe(image).then(result => {
                results.push({URL: result.url, width: result.width, height: result.height});
            })
        }
        res.send(results);
    }
}