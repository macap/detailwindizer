//server:
const express = require('express');
const bodyParser = require('body-parser');
//parser:
const postcss = require('postcss')
const tailwind = require('tailwindcss')
const cssvars = require('postcss-css-variables')
var Haikunator = require('haikunator')

var haikunator = new Haikunator({
    defaults: { 
        tokenLength: 0,
    }
});


// express app:

const app = express();
app.use(bodyParser.json());

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}


const config = {
    theme: {
        extend: {
          colors: {
            white: 'blue'
          }
        },
      },
}

function parse(html) {
    return new Promise((resolve, reject) => {


        const classes = html.match(/class="([^"]+)"/g);
const cleanClasses = classes.map(d => d.replace(/(\r\n|\n|\r)/gm,"").replace('class="', '').replace(/"$/, '').trim());

const uniqueClasses = [...new Set(cleanClasses)];

const classmap = uniqueClasses.reduce((prev, curr) => {prev[curr] = haikunator.haikunate(); return prev; }, {})
 

let css = ``;
let resulthtml = html;

uniqueClasses.forEach(twclass => {
    const name = classmap[twclass];
    css+=`
        .${name} {
            @apply ${twclass}
        }
    `;
    resulthtml = resulthtml.split(twclass).join(name);
})


postcss([tailwind(config), cssvars])
.process(css, { from: undefined })
.then(result => {
    resolve({ css: result.css, html: resulthtml })
    // console.log(result.css)
    // console.log('---')
    // console.log(resulthtml)
}).catch((e) => {
    reject();
})  


    })
}

app.post('/convert', (req, res) => {
    const html = req.body.html;

    parse(html).then(result => {
        res.send(JSON.stringify(result));
    }).catch(err => {
        res.sendStatus(500);
    })
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })


// const css = `
// .fancy-class {
//     @apply px-4 py-2 bg-blue-600 text-white rounded xl:mt-10;
// }
// `


// input :
// const html = `
// <div class="max-w-sm rounded overflow-hidden shadow-lg">
//   <img class="w-full" src="/img/card-top.jpg" alt="Sunset in the mountains">
//   <div class="px-6 py-4">
//     <div class="font-bold text-xl mb-2">The Coldest Sunset</div>
//     <p class="text-gray-700 text-base">
//       Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
//     </p>
//   </div>
//   <div class="px-6 pt-4 pb-2">
//     <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
//     <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
//     <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#winter</span>
//   </div>
// </div>

// `


//----


