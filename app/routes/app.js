var _ = require('underscore'),
    express = require('express'),
    AWS = require('aws-sdk'),
    s3Config = require('../lib/aws-s3-config'),
    router = express.Router(),
    Upload = require('../../models').upload
var multer = require('multer')
var multerS3 = require('multer-s3')

AWS.config.region = s3Config.photos.region;

var s3 = new AWS.S3({ /* ... */ })

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: s3Config.photos.bucket,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

router.post('/sign', async (req, res, next) => {
    var body = _.pick(
        req.body,
        'fileName',
        'fileType',
        'fileSize'
    );

    if (((body.fileSize / (1024 * 1024)).toFixed(2)) > 4) {
        // If file is over 4mb, drop upload
        return res.json({ error: "Too Large", message: "The Image You Tried To Upload Is Too Large." });
    }

    var s3 = new AWS.S3();
    var fileName = "files/recognition_photos/" + Date.now() + "/" + body.fileName;
    var buf = new Buffer(req.body.base64.replace(/^data:image\/\w+;base64,/, ""),'base64')
    var s3Params = {
        Body: buf,
        Bucket: s3Config.photos.bucket,
        Key: fileName,
        Expires: 60,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        ACL: 'public-read'
    };
    
    s3.putObject(s3Params, (err, data) => {
        if (err) {
            console.log('error')
            return res.json({ error: err, message: "Your File Could Not Be Uploaded" });
        }
        const returnData = {
            signedRequest: data,
            url: `https://${s3Config.photos.bucket}.s3.amazonaws.com/${fileName}`,
            fileName: fileName,
            body
        };

        res.json(returnData);
    });
});

router.post('/upload', upload.single('photo'), async (req, res) => {
    res.json(req.file)
})

router.post('/recognize', async (req, res, next) => {
    var body = _.pick(req.body, 'fileName', 'url')
    
    var rekognition = new AWS.Rekognition()
    var rekParams = {
        Image: {
            S3Object: {
                Bucket: s3Config.photos.bucket,
                Name: body.fileName,
            },
        },
        MaxLabels: 5,
        MinConfidence: 80,
    }

    try {
        var data = await new Promise((resolve, reject) => {
            rekognition.detectLabels(rekParams, (err, data) => {
                if (err) {
                    console.log(err);
                    return reject(new Error(err));
                }
                return resolve(data);
            });
        });
    } catch (e) {
        return res.status(500).json({ error: e, message: 'Could not recognize the image' })
    }    

    try {
        var upload = await Upload.forge({url: body.url, all_labels: data.Labels[0]}).save()
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error, message: 'Could not recognize the image' })
    }

    return res.json({upload})

});

router.get('/', async (req, res) => {

    try {
        var uploads = await Upload.fetchAll()
    } catch (error) {
        return res.status(500).json({error})
    }

    return res.json({uploads})
    

})

module.exports = router;
