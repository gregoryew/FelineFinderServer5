const bodyParser = require('body-parser');
const probe = require('probe-image-size');

module.exports = function(app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/api/sizeImages', function(req, res) {
        let imageArr = req.body.imageArray;
        let results = [];
        for (image of imageArr) {
            probe(image).then(result => {
                results.push({URL: result.url, width: result.width, height: result.height});
                if (results.length == imageArr.length) {
                    res.send(results);
                }
            })
        }
    });
}