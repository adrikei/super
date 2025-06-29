import fs from 'fs'
const inputFile = './input/beirariosm-12b.out'
const outputFile = './beirariosm-12b-parsed.out'
const errFile = './beirariosm-12b-error.out'
const content = fs.readFileSync(inputFile, 'utf-8').split('\n')
const list = content.map(c => (JSON.parse(c)))
const filtered = list.filter(e => !!e.item_name).filter(e => !!e.price)
const missed = list.filter(e => !e.item_name || !e.price)

console.log(filtered.length)
console.log(missed.length)

const model12b = 'google/gemma-3-12b'
// const model27b = 'google/gemma-3-27b'
async function askLLM(text: string, model: string = model12b) {
    const payload = {
        model: model,
        messages: [
            {
                role: 'system',
                content: [{
                    type: 'text', 
                    text: `You are an information extraction assistant. Given JSON describing a supermarket promotion, extract and return the data in the following normalized JSON format. Return only the JSON object. If any value is missing or not mentioned, set it to null.

                            Example output format:
                            {
                                "product_name": "...",
                                "brand": "...",
                                "price": ...,
                                "promotional_club_discount_price": ...,
                                "size_weight_count": "...",
                                "measurement_unit": "..."
                            }`
                }]
            },{ 
                role: 'user', 
                content: [{
                    type: 'text', 
                    text: text 
                }]
            }
        ],
        temperature: 0.0
    };
    
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
        keepalive: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    return await response.json();
}

async function ask(f: any) {
    try {
        const stringified = JSON.stringify(f)
        const result = (await askLLM(stringified)).choices[0].message.content.replace('```json', '').replace('```', '')
        const date = f.file.substring(0, 10)
        const firstSpaceIndex = f.file.indexOf(' ')
        const supermarket = f.file.substring(11, firstSpaceIndex)
        const secondSpaceIndex = f.file.indexOf(' ', firstSpaceIndex + 2)
        const periodIndex = f.file.indexOf('.')
        const hash = f.file.substring(secondSpaceIndex + 1, periodIndex)
        const toAppend = JSON.stringify({...JSON.parse(result), date, supermarket, hash})
        fs.appendFileSync(outputFile, `${toAppend}\n`)
        // console.log(toAppend)
    } catch (err) {
        const toAppend = JSON.stringify(f)
        fs.appendFileSync(errFile, `${toAppend}\n`)
        console.log("ERROR", f)
    }
}

for (const input of filtered){
    await ask(input)
}