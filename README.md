# FIOLIN

_A Fiddle For Files_

**tl;dr:** Write simple scripts that manipulate files. Share them with your
friends. Run them locally in your browser.

Try it for yourself (TODO: link)!

## License

Fiolin is licensed under the MIT License. This includes the first-party fiolin
scripts in this repository, unless otherwise specified. It does not, however,
include third-party scripts accessed through the fiolion website but hosted
elsewhere.

## Documentation

- [Design Document](/DESIGN.md)
- Live Documentation (TODO: link)

## Development

```sh
# Run dev server on http://localhost:3000 Also, a fake third-party server will
# be run on port 3001; you can test script retrieval by entering this in the URL
# field of the third-party form: http://localhost:3001/cors-3p-script.json
$ npm run dev

# Tests (in watch mode by default)
$ npm run test

# Individual fiolin scripts can be run using node:
$ npm run fiol -- unlock-ppt --input some.pptx --outputDir .

# TODO: deploy
# $ npm run deploy
```
