# Super

## Usage

First of all you need supermarket data within `input/<supermarket_name>` with the format
`<yyyy-mm-dd>_<supermarket> - <hash>.jpg` 

example:
`1970-01-01_walmart - ABCDEFG.jpg`

Anything after the dash and before the extension dot is considered a "hash"

Then you run `classify.ts` to make the folder structure and "classify" the images, sort them into processable and ignored ones

Processable ones will end up in `input/supermarket/dated/few`

Also by the end, there will be a `supermarket.out` file, with results

Then run `parse.ts` to generate a normalized output file, that can be visualized in `index.html` 

Then, run the server to view the resulting tool 
```bash
npm install
npx ts-node server.ts
```

Then open http://localhost:8000 in your browser.

(`parse.ts` and `index.html` have file names hardcoded inside, change them accordingly)