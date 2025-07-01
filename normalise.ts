import fs from 'fs'

const inputFile = './dbsupermercados.out'
const outputFile = './dbsupermercados-12b-parsed.out'
const errFile = './dbsupermercados-12b-error.out'
const content = fs.readFileSync(inputFile, 'utf-8').split('\n')
const list = content.filter(e => e !== '').map(c => (JSON.parse(c)))
const productList = list.flatMap(e => {
    if(e.response.constructor == Array) return e.response.map((el: any) => ({...el, file: e.file}))
    else return [{...e.response, file: e.file}]
})
productList.forEach(x => {
    if(typeof x.price === 'string'){
        x.price = Number(x.price.replace(',', '.'))
    }
})
const filtered = productList.filter(e => !!e.item_name).filter(e => !!e.price)
for(const e of filtered){
    const date = e.file.substring(0, 10)
    const firstSpaceIndex = e.file.indexOf(' ')
    const supermarket = e.file.substring(11, firstSpaceIndex)
    const secondSpaceIndex = e.file.indexOf(' ', firstSpaceIndex + 2)
    const periodIndex = e.file.indexOf('.')
    const hash = e.file.substring(secondSpaceIndex + 1, periodIndex)
    // const toAppend = JSON.stringify({...JSON.parse(result), date, supermarket, hash})
    const r = {
        item_name: e.item_name,
        price: e.price,
        date,
        supermarket,
        hash,
        size_weight_count1: `${e.size??''} ${e.size_or_count??''} ${e.size_weight_count??''} ${e.product_size??''} ${e.measurement_unit??''}`.replace(/\s+/g, ' ').trim(),
        size_weight_count2: `${e.size??''} ${e.size_or_count??''} ${e.size_weight_count??''} ${e.product_size??''} ${e.measurement_unit??''}`.replace(/\s+/g, ' ').replace(/\b(\w+)(?:\s+\1)+\b$/, '$1').trim(),
        size_weight_count3: `${e.size??''} ${e.size_or_count??''} ${e.size_weight_count??''} ${e.product_size??''} ${e.measurement_unit??''}`.replace(/\s+/g, ' ').replace(/(\d+\s?[a-zA-Z]+)\s+\1?\b$/, '$1').trim(),
        file: e.file
    }
    const avoid = ['item_name', 'price', 'other_text', 'dates', 'file', 'brand', 'currency']
    const keys = Object.keys(e).filter(k => !avoid.includes(k))
    console.log(keys.map(k => e[k]).join(' '))
    console.log(r)
    // console.log(JSON.stringify(r))
}