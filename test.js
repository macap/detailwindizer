var Haikunator = require('haikunator')

var haikunator = new Haikunator({
    defaults: { // class defaults
        tokenLength: 0,
    }
})

const html = `

<div class="mt-1 dp-2">
    <span class="dd-22">
        <span class="dddd"></span>
        <span class="dddd"></span>
    </span>
</div>

`

const classes = html.match(/class="([^"]+)"/g);
const cleanClasses = classes.map(d => d.replace(/(\r\n|\n|\r)/gm,"").replace('class="', '').replace(/"$/, '').trim());

const uniqueClasses = [...new Set(cleanClasses)];

const classmap = uniqueClasses.reduce((prev, curr) => {prev[curr] = haikunator.haikunate(); return prev; }, {})

console.log(classmap);   

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

console.log('---- css: ----')
console.log(css);
console.log('--- html ---')
console.log(resulthtml);