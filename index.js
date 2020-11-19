
const express = require('express');
const bodyParser = require('body-parser');
const postcss = require('postcss')
const tailwind = require('tailwindcss')
const cssvars = require('postcss-css-variables')
var Haikunator = require('haikunator')

var haikunator = new Haikunator({
    defaults: {
        tokenLength: 0,
    }
});

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'))

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}

const config = {
    theme: {
        extend: {
            // colors: {
            // white: 'blue'
            // }
        },
    },
}

function parse(html = '') {
    return new Promise((resolve, reject) => {
        // well maybe thats not the smartest idea to parse html but YOLO:
        const classes = html.match(/class="([^"]+)"/g);
        const cleanClasses = classes.map(d => d.replace(/(\r\n|\n|\r)/gm, "").replace('class="', '').replace(/"$/, '').trim());

        const uniqueClasses = [...new Set(cleanClasses)];

        const classmap = uniqueClasses.reduce((prev, curr) => {
            prev[curr] = haikunator.haikunate();
            return prev;
        }, {})


        let css = ``;
        let resulthtml = html;

        uniqueClasses.forEach(twclass => {
            const name = classmap[twclass];
            css += `
              .${name} {
                  @apply ${twclass}
              }
            `;
            resulthtml = resulthtml.split(twclass).join(name);
        })

        postcss([tailwind(config), cssvars])
            .process(css, {
                from: undefined
            })
            .then(result => {
                resolve({
                    css: result.css,
                    html: resulthtml
                })
            }).catch((e) => {
                reject(e);
            })
    })
}


app.post('/convert', (req, res) => {
    console.log('Processing convert')
    const html = req.body.html;

    parse(html).then(result => {
        res.send(JSON.stringify(result));
    }).catch(err => {
        console.error(err);
        res.sendStatus(500);
    })
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})