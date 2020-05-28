import fetch from 'node-fetch';

const getChallenge = async () => {
    let res = await fetch("http://localhost:3000/getChallenge");
    let body = await res.json();

    let BLOCK_SIZE = 8 //Init BLOCK_SIZE
    let decrypted = '' // Data which been decrypted
    let strFixed = '' // Data needs to be reversed because we decrypt from last to begin
    let buf = Buffer.from(body.data, 'hex') // Initial buf with body.data which holds of course the data
    let isData = 1 //flag
    let counter = 0 
    while (isData) {
        let byte = 7;
        let index = [] // This array holds the current block decrypted bytes
        for (let i = 0; i < 256; ++i) {
            let toDecrypt = Buffer.alloc(BLOCK_SIZE, 0) // Allocation BLOCK_SIZE (each iteration grows by 8)
            buf.copy(toDecrypt) // copy BLOCK_SIZE bytes to toDecrypt
            switch (byte) {
                case 7:
                    toDecrypt[BLOCK_SIZE - 1] = toDecrypt[BLOCK_SIZE - 1] ^ i
                    break
                case 6:
                    toDecrypt[BLOCK_SIZE - 1] = toDecrypt[BLOCK_SIZE - 1] ^ (index[0] ^ 1)
                    toDecrypt[BLOCK_SIZE - 2] = toDecrypt[BLOCK_SIZE - 2] ^ (i ^ 1)
                    break
                case 5:
                    toDecrypt[BLOCK_SIZE - 1] = toDecrypt[BLOCK_SIZE - 1] ^ (index[0] ^ 2)
                    toDecrypt[BLOCK_SIZE - 2] = toDecrypt[BLOCK_SIZE - 2] ^ (index[1] ^ 2)
                    toDecrypt[BLOCK_SIZE - 3] = toDecrypt[BLOCK_SIZE - 3] ^ (i ^ 2)
                    break
                case 4:
                    toDecrypt[BLOCK_SIZE - 1] = toDecrypt[BLOCK_SIZE - 1] ^ (index[0] ^ 3)
                    toDecrypt[BLOCK_SIZE - 2] = toDecrypt[BLOCK_SIZE - 2] ^ (index[1] ^ 3)
                    toDecrypt[BLOCK_SIZE - 3] = toDecrypt[BLOCK_SIZE - 3] ^ (index[2] ^ 3)
                    toDecrypt[BLOCK_SIZE - 4] = toDecrypt[BLOCK_SIZE - 4] ^ (i ^ 3)
                    break
                case 3:
                    toDecrypt[BLOCK_SIZE - 1] = toDecrypt[BLOCK_SIZE - 1] ^ (index[0] ^ 4)
                    toDecrypt[BLOCK_SIZE - 2] = toDecrypt[BLOCK_SIZE - 2] ^ (index[1] ^ 4)
                    toDecrypt[BLOCK_SIZE - 3] = toDecrypt[BLOCK_SIZE - 3] ^ (index[2] ^ 4)
                    toDecrypt[BLOCK_SIZE - 4] = toDecrypt[BLOCK_SIZE - 4] ^ (index[3] ^ 4)
                    toDecrypt[BLOCK_SIZE - 5] = toDecrypt[BLOCK_SIZE - 5] ^ (i ^ 4)
                    break
                case 2:
                    toDecrypt[BLOCK_SIZE - 1] = toDecrypt[BLOCK_SIZE - 1] ^ (index[0] ^ 5)
                    toDecrypt[BLOCK_SIZE - 2] = toDecrypt[BLOCK_SIZE - 2] ^ (index[1] ^ 5)
                    toDecrypt[BLOCK_SIZE - 3] = toDecrypt[BLOCK_SIZE - 3] ^ (index[2] ^ 5)
                    toDecrypt[BLOCK_SIZE - 4] = toDecrypt[BLOCK_SIZE - 4] ^ (index[3] ^ 5)
                    toDecrypt[BLOCK_SIZE - 5] = toDecrypt[BLOCK_SIZE - 5] ^ (index[4] ^ 5)
                    toDecrypt[BLOCK_SIZE - 6] = toDecrypt[BLOCK_SIZE - 6] ^ (i ^ 5)
                    break
                case 1:
                    toDecrypt[BLOCK_SIZE - 1] = toDecrypt[BLOCK_SIZE - 1] ^ (index[0] ^ 6)
                    toDecrypt[BLOCK_SIZE - 2] = toDecrypt[BLOCK_SIZE - 2] ^ (index[1] ^ 6)
                    toDecrypt[BLOCK_SIZE - 3] = toDecrypt[BLOCK_SIZE - 3] ^ (index[2] ^ 6)
                    toDecrypt[BLOCK_SIZE - 4] = toDecrypt[BLOCK_SIZE - 4] ^ (index[3] ^ 6)
                    toDecrypt[BLOCK_SIZE - 5] = toDecrypt[BLOCK_SIZE - 5] ^ (index[4] ^ 6)
                    toDecrypt[BLOCK_SIZE - 6] = toDecrypt[BLOCK_SIZE - 6] ^ (index[5] ^ 6)
                    toDecrypt[BLOCK_SIZE - 7] = toDecrypt[BLOCK_SIZE - 7] ^ (i ^ 6)
                    break
                case 0:
                    toDecrypt[BLOCK_SIZE - 1] = toDecrypt[BLOCK_SIZE - 1] ^ (index[0] ^ 7)
                    toDecrypt[BLOCK_SIZE - 2] = toDecrypt[BLOCK_SIZE - 2] ^ (index[1] ^ 7)
                    toDecrypt[BLOCK_SIZE - 3] = toDecrypt[BLOCK_SIZE - 3] ^ (index[2] ^ 7)
                    toDecrypt[BLOCK_SIZE - 4] = toDecrypt[BLOCK_SIZE - 4] ^ (index[3] ^ 7)
                    toDecrypt[BLOCK_SIZE - 5] = toDecrypt[BLOCK_SIZE - 5] ^ (index[4] ^ 7)
                    toDecrypt[BLOCK_SIZE - 6] = toDecrypt[BLOCK_SIZE - 6] ^ (index[5] ^ 7)
                    toDecrypt[BLOCK_SIZE - 7] = toDecrypt[BLOCK_SIZE - 7] ^ (index[6] ^ 7)
                    toDecrypt[BLOCK_SIZE - 8] = toDecrypt[BLOCK_SIZE - 8] ^ (i ^ 7)
                    break
                default:
                    break
            }
            let chlng = { data: toDecrypt.toString('hex'), key: body.key }
            let chlng_res = await fetch("http://localhost:3000/attemptChallenge", { body: JSON.stringify(chlng), method: "POST", headers: { "Content-Type": "application/json" } })
            let chlng_res_body = await chlng_res.json()
            if (chlng_res_body.error == 'tag') {
                index.push(i)
                // Check if the value we get is valid 
                if((i.toString(16) >= '20' && i.toString(16) <= '7A') ){
                    decrypted += i.toString(16)
                }
                else isData = 0 // else we got all data
                i = 0
                byte--;
            }
        }
        let str = ''
        //convert decrypted (which is all values in hex) to a string
        for (let n = 0; n < decrypted.length; n += 2) {
            str += String.fromCharCode(parseInt(decrypted.substr(n, 2), 16));
        }
        //reverse str
        let newString = "";
        for (let j = str.length - 1; j >= 0; j--) {
            newString += str[j];
        }
        //strFixed appends the reversed string(which is the correct one)
        strFixed += newString
        console.log(`Block no.${counter++} - ${strFixed}`)
        decrypted = ''
        BLOCK_SIZE += 8
    }
    console.log(`\nDecrypted data\n> ${strFixed}`)
}

getChallenge()