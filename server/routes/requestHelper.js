const https = require('https');

const httpGet = (url, cb) => {
    https.get(url, (res)=> {
        let data = '';
        res.on('data', (d) => {
            data += d;
        });
        res.on('end', ()=>{
            try {
                data = JSON.parse(data);
            } catch(e) {
                return cb(e);
            }
            cb(null, data)
        });
    }).on('error', (e)=> {
        cb(e);
    })
}

exports.makeCall = (options, cb) => {
    if(options && options.method.toLowerCase() == 'get') {
        httpGet(options.url, cb);
    }
}