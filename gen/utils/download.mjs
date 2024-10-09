import * as fs from 'fs'
import * as https from 'https'

export default (url, dest, trim = false) => {
    const file = fs.createWriteStream(dest)
    https.get(url, function (response) {
        response.pipe(file)
        file.on('finish', () => {
            file.close(() => {
                fs.readFile(dest, {encoding: 'utf8'}, (err, data) => {
                    if (err) return console.log(err)

                    let result = data

                    if (trim) result = result.replace(/\r\n/g, '\n')
                        .replace(/[^\S\r\n]{2,}/g, ' ')
                        .replace(/\n[^\S\r\n]+/g, '\n')

                    fs.writeFile(dest, result, {encoding: 'utf8'}, err => {
                        if (err) return console.log(err)
                    })
                })
            })
        })
    }).on('error', function (err) {
        console.log(err)
    })
}
