import * as crypto from 'crypto';
import * as express from 'express';
import * as request from 'request-promise-native';
import * as bodyParser from 'body-parser';
var MersenneTwister = require ('mersenne-twister');

let app = express();

app.get("/getChallenge", async (req, res) => {
    let [key, iv, data] = await enc();
    
    res.json({
        data: data.toString('hex'),
        key: key.toString('hex')
    });
});

app.post("/attemptChallenge", bodyParser.json(), async (req, res) => {
    let chlng = req.body;
    let key = Buffer.from(chlng.key, 'hex');
    let iv = Buffer.alloc(8, 0);
    let data = Buffer.from(chlng.data, 'hex');

    res.json(dec(data, key, iv));
})

function prepare(data: Buffer)
{
    let sha1 = crypto.createHmac('sha1',"asaf");
    sha1.update(data);
    let tag = sha1.digest();
    
    let paddingSize = 8 - ((data.length + tag.length) % 8);
    let paddingVal = paddingSize -1;
    let blockCount = (Math.floor((data.length + tag.length) / 8)) + 1;

    let prep = Buffer.alloc(blockCount * 8);
    data.copy(prep,0,0);
    tag.copy(prep, data.length, 0);

    Buffer.alloc(paddingSize, paddingVal).copy(prep, data.length + tag.length, 0);

    console.log(prep);

    return prep;

}

function naiveCBC_MACEncrypt(data: Buffer, key:Buffer, iv: Buffer, dec: boolean)
{
    let encBlock:Buffer = Buffer.alloc(data.length);

    let gen = new MersenneTwister();
    gen.init_seed(key.readUInt32LE(0) ^ key.readUInt32LE(4));

    for (let i = 0; i < data.length / 8; i++)
    {
        let blockKey: Buffer = Buffer.alloc(8);
        
        blockKey.writeUInt32LE(gen.random_int(), 0);
        blockKey.writeUInt32LE(gen.random_int(), 4);
        let lastBlock = (i === 0) ? iv : (dec ? data.slice((i-1)*8,i*8) : encBlock.slice((i-1)*8, i * 8));
        for (let j = 0; j < 8; j++)
            encBlock[(8*i) + j] = data[(8*i) + j] ^ lastBlock[j] ^ blockKey[j];
    }

    return encBlock;
}

async function enc()
{
    let req = JSON.parse (await request.get('https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1'));
    let byteArray = Buffer.from(req[0]);
    console.log('byteArray = ', byteArray)
    let key = crypto.randomBytes(8);
    let iv = Buffer.alloc(8,0);

    return [key, iv, naiveCBC_MACEncrypt(prepare(byteArray), key, iv, false)];

};

function dec(data: Buffer, key: Buffer, iv: Buffer) : object
{
    let dec = naiveCBC_MACEncrypt(data, key, iv, true);
    let paddingVal = dec[dec.length - 1];
    let paddingLength = paddingVal + 1;
    let padding = dec.slice(dec.length - paddingLength, dec.length);

    if (paddingVal > 7)
        return { error: 'padding' };

    for (let i = 0; i < padding.length - 1; i++)
        if (padding[i] != padding[i + 1])
            return {error: 'pad'};

    console.log(padding);
    console.log("pad ok !");

    let decNoPad = dec.slice(0, dec.length - padding[0] - 1);
    let tag = decNoPad.slice(decNoPad.length - 20, decNoPad.length);
    let pt = decNoPad.slice(0, decNoPad.length - 20);

    let hmac = crypto.createHmac("sha1", "asaf");
    hmac.update(pt);
    let attemptedDigest = hmac.digest();

    if (attemptedDigest.compare(tag) != 0)
    {
        return {error: 'tag'};
    }
        
    
    return {error: 'none'};
    
    
    
}

app.listen(3000, () => console.log('server running'));