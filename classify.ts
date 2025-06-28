import fs from 'fs'
import path from 'path'
import { exit } from 'process';

const model12b = 'google/gemma-3-12b'
const model27b = 'google/gemma-3-27b'
async function askLLM(filePath: string, question: string, model: string = model12b) {
    const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
    const imageData = `data:image/jpeg;base64,${imageBase64}`;
    
    /*
    curl http://localhost:1234/v1/chat/completions \
        -H "Content-Type: application/json" \
        -d '{
            "model": "google/gemma-3-12b",
            "messages": [
            { "role": "system", "content": "Always answer in rhymes. Today is Thursday" },
            { "role": "user", "content": "What day is it today?" }
            ],
            "temperature": 0.7,
            "max_tokens": -1,
            "stream": false
        }'
    */
    const body = {
        model: model,
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: question },
                    {
                        type: 'image_url',
                        image_url: {
                            url: imageData
                        }
                    }
                ]
            }
        ],
        // stream: true,
        temperature: 0.0
    };
    
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
        keepalive: true,
        method: 'POST',
        headers: {
            
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    });
    return await response.json();
}

const cwd = process.cwd()
const directoryPath: string = "input"

try {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }

    const files = fs.readdirSync(path.resolve(cwd, directoryPath));

    for (const file of files) {
        if(file === '.DS_Store') continue;

        const fullPath = path.join(directoryPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            const productDir = path.join(fullPath, 'products');
            if (!fs.existsSync(productDir)) {
                fs.mkdirSync(productDir);
            }
            
            const trashDir = path.join(fullPath, 'trash');
            if (!fs.existsSync(trashDir)) {
                fs.mkdirSync(trashDir);
            }
            
            const datedDir = path.join(productDir, 'dated')
            if (!fs.existsSync(datedDir)) {
                fs.mkdirSync(datedDir);
            }

            const nonDatedDir = path.join(productDir, 'nonDated')
            if (!fs.existsSync(nonDatedDir)) {
                fs.mkdirSync(nonDatedDir);
            }

            const fewDir = path.join(datedDir, 'few')
            if (!fs.existsSync(fewDir)) {
                fs.mkdirSync(fewDir);
            }

            const manyDir = path.join(datedDir, 'many')
            if (!fs.existsSync(manyDir)) {
                fs.mkdirSync(manyDir);
            }

            const doneDir = path.join(fewDir, 'done')
            if (!fs.existsSync(doneDir)) {
                fs.mkdirSync(doneDir);
            }

            const otherDir = path.join(doneDir, 'other')
            if (!fs.existsSync(otherDir)) {
                fs.mkdirSync(otherDir);
            }
        }
    }

} catch (err) {
    console.error(err);
    exit()
}

try {
    const folders = fs.readdirSync(path.resolve(cwd, directoryPath));

    for (const folder of folders) {
        if(folder === '.DS_Store') continue;

        const supermarketDir = path.join(directoryPath, folder);

        if (fs.statSync(supermarketDir).isDirectory()) {
            const productDir = path.join(supermarketDir, 'products');
            const trashDir = path.join(supermarketDir, 'trash');
            
            const productQuestion = 'Does this image depict a product advertisement containing a clearly defined set of specific products and their prices? Only items sales, no raffles, donations or other forms of compensation.'
            let files = fs.readdirSync(path.resolve(cwd, supermarketDir));
            for(const file of files){
                if(file === '.DS_Store') continue;
                if(!(file.endsWith('.jpg') || file.endsWith('.jpeg'))) continue;

                const filePath = path.join(supermarketDir, file)
                const trashedPath = path.join(trashDir, file)
                const okPath = path.join(productDir, file)

                if(fs.statSync(filePath).isFile()){
                    console.log(filePath)
                    try{
                        const productResponse = await askLLM(filePath, productQuestion);
                        const isProduct = productResponse.choices[0].message.content.startsWith('Yes')
                        if(!isProduct){
                            console.log('moving', file, 'to trash')
                            fs.renameSync(filePath, trashedPath)
                            continue
                        } //else
                        fs.renameSync(filePath, okPath)
                    } catch (err) {
                        console.error(err);
                    }
                }
            }

            const datedDir = path.join(productDir, 'dated');
            const nonDatedDir = path.join(productDir, 'nonDated');

            // const datedQuestion = 'Start with either Yes or No. Does this image show any dates? What are they?'
            let productFiles = fs.readdirSync(path.resolve(cwd, productDir));
            for(const productFile of productFiles){
                if(productFile === '.DS_Store') continue;

                const filePath = path.join(productDir, productFile)

                const datedPath = path.join(datedDir, productFile)
                // const nonDatedPath = path.join(nonDatedDir, productFile)

                if(fs.statSync(filePath).isFile()){
                    // const datedResponse = await askLLM(filePath, datedQuestion);
                    // console.log(productDir, datedResponse.choices[0].message.content)

                    // const isDated = datedResponse.choices[0].message.content.startsWith('Yes')
                    // if(!isDated){
                        // console.log('moving', productFile, 'to nonDated')
                        // fs.renameSync(filePath, nonDatedPath)
                        // continue
                    // }// else
                    fs.renameSync(filePath, datedPath)
                }
            }

            const fewDir = path.join(datedDir, 'few');
            const manyDir = path.join(datedDir, 'many');

            const manyQuestion = 'give a json breakdown of the products listed, include them only if there is a price associated, only code'
            let datedFiles = fs.readdirSync(path.resolve(cwd, datedDir));
            for(const datedFile of datedFiles){
                if(datedFile === '.DS_Store') continue;

                const filePath = path.join(datedDir, datedFile)

                const fewPath = path.join(fewDir, datedFile)
                const manyPath = path.join(manyDir, datedFile)

                if(fs.statSync(filePath).isFile()){
                    // console.log(filePath)
                    try {
                        const manyResult = await askLLM(filePath, manyQuestion);
                        // console.log(JSON.stringify(manyResult))
                        const content: string = manyResult.choices[0].message.content
                        const parsed = JSON.parse(content.replace("```json\n", "").replace("\n```", ""))
                        
                        const isMany = parsed.length > 2
                        if(isMany){
                            console.log('moving', datedFile, 'to many')
                            fs.renameSync(filePath, manyPath)
                            continue
                        }
                        console.log('moving', datedFile, 'to few')
                        fs.renameSync(filePath, fewPath)
                    } catch (err) {
                        console.error(err);
                    }
                }
                // break
            }

            const supermarketOutputFilePath = path.join(cwd, `${folder}.out`)
            const doneDir = path.join(fewDir, 'done');
            const otherDir = path.join(fewDir, 'other');

            const describeQuestion = '// give a json breakdown of the products listed, include them only if there is a price associated, provide the item name, brand, price, a list of dates mentioned, when applicable, include product size, weight or count and the measurement unit associated with this sale, add also a field for any other important text that is found in the advertisement. Only code'
            let fewFiles = fs.readdirSync(path.resolve(cwd, fewDir))
            for(const fewFile of fewFiles){
                if(fewFile === '.DS_Store') continue

                const filePath = path.join(fewDir, fewFile)
                const donePath = path.join(doneDir, fewFile)
                try {
                    if(fs.statSync(filePath).isFile()){
                        const describeResult = await askLLM(filePath, describeQuestion, model12b)
                        const content: string = describeResult.choices[0].message.content
                        const parsed = JSON.parse(content.replace("```json\n", "").replace("\n```", ""))
                        
                        const result = {
                            response: parsed,
                            file: fewFile,
                        }
                        fs.appendFileSync(supermarketOutputFilePath, `${JSON.stringify(result)}\n`)
                        console.log(result)
                        
                        fs.renameSync(filePath, donePath)
                    }
                } catch (err) {
                    console.error(err);
                    const otherPath = path.join(otherDir, fewFile)
                    fs.renameSync(filePath, otherPath)
                }
            }

            // break;
        }
    }
} catch (err) {
    console.error(err);
}