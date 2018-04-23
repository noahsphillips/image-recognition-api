var _ = require('underscore'),
    express = require('express'),
    AWS = require('aws-sdk'),
    s3Config = require('../lib/aws-s3-config'),
    router = express.Router(),
    multer = require('multer'),
    multerS3 = require('multer-s3')

AWS.config.region = s3Config.photos.region;

var S3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        S3,
        bucket: s3Config.photos.bucket,
        acl: 'public-read',
        metadata(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key(req, file, cb) {
            cb(null, Date.now().toString() + '.png');
        }
    })
})

router.get('/', (req, res, next) => {
    res.send('You hit the get route of /photos');
});

router.post('/sign', async (req, res, next) => {
    console.log(req.body)
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
    var s3Params = {
        Bucket: s3Config.photos.bucket,
        Key: fileName,
        Expires: 60,
        ContentType: body.fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
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

router.post('/app/sign', async (req, res, next) => {
    console.log(req.body)
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
    var s3Params = {
        Bucket: s3Config.photos.bucket,
        Key: fileName,
        Expires: 60,
        ContentType: body.fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
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

router.post('/app/upload', async (req, res) => {
    

})

router.post('/app/recognize', async (req, res, next) => {
    var body = _.pick(req.body, 'fileName')
    var rekognition = new AWS.Rekognition()
    var rekParams = {
        Image: {
            S3Object: {
                Bucket: s3Config.photos.bucket,
                Name: body.fileName,
            },
        },
        MaxLabels: 1,
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

    return res.json(data)

});

router.post('/app/recognize', async (req, res, next) => {
    var body = _.pick(req.body, 'fileName')
    var rekognition = new AWS.Rekognition()
    var rekParams = {
        Image: {
            S3Object: {
                Bucket: s3Config.photos.bucket,
                Name: body.fileName,
            },
        },
        MaxLabels: 1,
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

    return res.json(data)

});

module.exports = router;
